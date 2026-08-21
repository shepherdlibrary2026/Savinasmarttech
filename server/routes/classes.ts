import { Router } from 'express';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { db } from '../db/database';

export const classesRouter = Router();

// GET /api/classes - List classes
classesRouter.get('/', (req: AuthenticatedRequest, res) => {
  const schoolId = req.user?.schoolId;
  const userRole = req.user?.role;
  const userId = req.user?.id;

  let tenantClasses = db.classes.filter((c) => c.schoolId === schoolId);

  // If student: only show enrolled classes
  if (userRole === 'student') {
    const studentEnrolledClassIds = db.enrollments
      .filter((e) => e.studentId === userId)
      .map((e) => e.classId);
    tenantClasses = tenantClasses.filter((c) => studentEnrolledClassIds.includes(c.id));
  }

  // If parent: only show classes their children attend
  if (userRole === 'parent') {
    const childIds = db.parentStudentMaps
      .filter((psm) => psm.parentId === userId)
      .map((psm) => psm.studentId);
    const childClassIds = db.enrollments
      .filter((e) => childIds.includes(e.studentId))
      .map((e) => e.classId);
    tenantClasses = tenantClasses.filter((c) => childClassIds.includes(c.id));
  }

  return res.json({ classes: tenantClasses });
});

// GET /api/classes/:id - Class details with enrolled student roster
classesRouter.get('/:id', (req: AuthenticatedRequest, res) => {
  const cls = db.classes.find((c) => c.id === req.params.id);
  if (!cls) {
    return res.status(404).json({ error: 'Class not found' });
  }

  if (cls.schoolId !== req.user?.schoolId) {
    return res.status(403).json({ error: 'Forbidden: Class belongs to another school tenant.' });
  }

  const enrollments = db.enrollments.filter((e) => e.classId === cls.id);
  const enrolledStudentIds = enrollments.map((e) => e.studentId);
  const students = db.users.filter((u) => enrolledStudentIds.includes(u.id));

  return res.json({
    class: cls,
    students,
    enrollmentCount: enrollments.length,
  });
});

// POST /api/classes - Create new class stream (Admin only)
classesRouter.post('/', requireRole(['school_admin']), (req: AuthenticatedRequest, res) => {
  const { name, gradeLevel, tier, subject, teacherId, academicYear, termPeriod, roomNumber, maxCapacity } = req.body;

  if (!name || !subject || !teacherId) {
    return res.status(400).json({ error: 'Missing required class fields (name, subject, teacherId).' });
  }

  const teacher = db.users.find((u) => u.id === teacherId);
  const newClass = {
    id: `cls-${Date.now()}`,
    schoolId: req.user!.schoolId,
    name,
    gradeLevel: gradeLevel || 'Grade 10',
    tier: tier || 'senior_high',
    subject,
    teacherId,
    teacherName: teacher ? teacher.name : 'Assigned Teacher',
    academicYear: academicYear || '2025/2026',
    termPeriod: termPeriod || 'Semester 1',
    roomNumber: roomNumber || 'Rm 101',
    maxCapacity: maxCapacity || 40,
    studentCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.classes.push(newClass);

  return res.status(201).json({ success: true, class: newClass });
});
