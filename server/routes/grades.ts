import { Router } from 'express';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { db } from '../db/database';

export const gradesRouter = Router();

// GET /api/grades - Query grades with strict FERPA evaluation
gradesRouter.get('/', (req: AuthenticatedRequest, res) => {
  const { classId, studentId } = req.query;
  const userRole = req.user?.role;
  const userId = req.user?.id;
  const schoolId = req.user?.schoolId;

  // Find class IDs that belong to the school
  const schoolClassIds = db.classes.filter((c) => c.schoolId === schoolId).map((c) => c.id);
  let tenantGrades = db.grades.filter((g) => schoolClassIds.includes(g.classId));

  if (classId) {
    tenantGrades = tenantGrades.filter((g) => g.classId === classId);
  }
  if (studentId) {
    tenantGrades = tenantGrades.filter((g) => g.studentId === studentId);
  }

  // FERPA Visibility Filter:
  if (userRole === 'student') {
    // Students see ONLY their own grades
    tenantGrades = tenantGrades.filter((g) => g.studentId === userId);
  } else if (userRole === 'parent') {
    // Parents see ONLY their linked children's grades
    const childIds = db.parentStudentMaps
      .filter((psm) => psm.parentId === userId)
      .map((psm) => psm.studentId);
    tenantGrades = tenantGrades.filter((g) => childIds.includes(g.studentId));
  }

  return res.json({ grades: tenantGrades });
});

// POST /api/grades - Record or submit a continuous assessment score (Teachers & Admins)
gradesRouter.post('/', requireRole(['teacher', 'school_admin']), (req: AuthenticatedRequest, res) => {
  const { enrollmentId, classId, studentId, assignmentName, category, scoreAchieved, maxScore, feedback } = req.body;

  if (!classId || !studentId || scoreAchieved === undefined || !maxScore) {
    return res.status(400).json({ error: 'Missing grade parameters (classId, studentId, scoreAchieved, maxScore).' });
  }

  const cls = db.classes.find((c) => c.id === classId);
  if (!cls || cls.schoolId !== req.user?.schoolId) {
    return res.status(404).json({ error: 'Class not found in current school tenant.' });
  }

  // If teacher: enforce that teacher can only enter grades for classes they teach!
  if (req.user?.role === 'teacher' && cls.teacherId !== req.user?.id) {
    return res.status(403).json({
      error: 'RLS Security Violation: Teachers are strictly prohibited from grading classes assigned to other educators.',
      assignedTeacherId: cls.teacherId,
      callerId: req.user.id,
    });
  }

  if (scoreAchieved > maxScore) {
    return res.status(400).json({ error: 'Constraint error: scoreAchieved cannot exceed maxScore.' });
  }

  const student = db.users.find((u) => u.id === studentId);
  const percentage = Math.round((scoreAchieved / maxScore) * 1000) / 10;
  let letterGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (percentage >= 85) letterGrade = 'A';
  else if (percentage >= 70) letterGrade = 'B';
  else if (percentage >= 55) letterGrade = 'C';
  else if (percentage >= 40) letterGrade = 'D';

  const newGrade = {
    id: `grd-${Date.now()}`,
    enrollmentId: enrollmentId || `enr-${classId}-${studentId}`,
    classId,
    studentId,
    studentName: student ? student.name : 'Enrolled Student',
    subject: cls.subject,
    assignmentName: assignmentName || 'Continuous Assessment',
    category: category || 'continuous_assessment',
    scoreAchieved: Number(scoreAchieved),
    maxScore: Number(maxScore),
    percentage,
    letterGrade,
    gradedBy: req.user!.id,
    feedback: feedback || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.grades.push(newGrade);

  return res.status(201).json({ success: true, grade: newGrade });
});

// GET /api/grades/report-card/:studentId - Generate official term report card
gradesRouter.get('/report-card/:studentId', (req: AuthenticatedRequest, res) => {
  const { studentId } = req.params;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  // FERPA Check
  if (userRole === 'student' && userId !== studentId) {
    return res.status(403).json({ error: 'FERPA Denied: Cannot view another student report card.' });
  }
  if (userRole === 'parent') {
    const isChild = db.parentStudentMaps.some((psm) => psm.parentId === userId && psm.studentId === studentId);
    if (!isChild) {
      return res.status(403).json({ error: 'FERPA Denied: Student is not your linked dependent.' });
    }
  }

  const student = db.users.find((u) => u.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const studentGrades = db.grades.filter((g) => g.studentId === studentId);
  const totalPercentage = studentGrades.reduce((acc, curr) => acc + curr.percentage, 0);
  const gpaAverage = studentGrades.length > 0 ? Math.round(totalPercentage / studentGrades.length) : 0;

  return res.json({
    student,
    grades: studentGrades,
    summary: {
      overallAverage: gpaAverage,
      standing: gpaAverage >= 85 ? 'First Class Distinction' : gpaAverage >= 70 ? 'Credit Pass' : 'Pass',
      totalAssessments: studentGrades.length,
      conductRemark: 'Exemplary academic discipline and leadership in classroom discussions.',
      principalRemark: 'Promoted with honor recommendation. Keep striving for national excellence.',
    },
  });
});
