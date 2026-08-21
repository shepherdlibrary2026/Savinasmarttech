import { Router } from 'express';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { db } from '../db/database';

export const attendanceRouter = Router();

// GET /api/attendance - Daily attendance records
attendanceRouter.get('/', (req: AuthenticatedRequest, res) => {
  const { classId, date, studentId } = req.query;
  const userRole = req.user?.role;
  const userId = req.user?.id;
  const schoolId = req.user?.schoolId;

  let tenantAttendance = db.attendance.filter((a) => a.schoolId === schoolId);

  if (classId) {
    tenantAttendance = tenantAttendance.filter((a) => a.classId === classId);
  }
  if (date) {
    tenantAttendance = tenantAttendance.filter((a) => a.date === date);
  }
  if (studentId) {
    tenantAttendance = tenantAttendance.filter((a) => a.studentId === studentId);
  }

  // Role Filtering
  if (userRole === 'student') {
    tenantAttendance = tenantAttendance.filter((a) => a.studentId === userId);
  } else if (userRole === 'parent') {
    const childIds = db.parentStudentMaps
      .filter((psm) => psm.parentId === userId)
      .map((psm) => psm.studentId);
    tenantAttendance = tenantAttendance.filter((a) => childIds.includes(a.studentId));
  }

  return res.json({ attendance: tenantAttendance });
});

// POST /api/attendance/batch - Submit daily roll-call for a classroom (Teacher / Admin)
attendanceRouter.post('/batch', requireRole(['teacher', 'school_admin']), (req: AuthenticatedRequest, res) => {
  const { classId, date, records } = req.body;

  if (!classId || !date || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Missing parameters (classId, date, records array).' });
  }

  const cls = db.classes.find((c) => c.id === classId);
  if (!cls || cls.schoolId !== req.user?.schoolId) {
    return res.status(404).json({ error: 'Class not found in active school tenant.' });
  }

  // Teacher RLS validation
  if (req.user?.role === 'teacher' && cls.teacherId !== req.user?.id) {
    return res.status(403).json({
      error: 'RLS Permission Denied: You cannot take roll call for a class not assigned to you.',
    });
  }

  const savedRecords = [];

  for (const item of records) {
    const { studentId, status, notes } = item;
    const student = db.users.find((u) => u.id === studentId);

    // Remove any existing attendance for same student/class/date to prevent duplicates
    db.attendance = db.attendance.filter(
      (a) => !(a.studentId === studentId && a.classId === classId && a.date === date)
    );

    const newRecord = {
      id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      schoolId: req.user!.schoolId,
      classId,
      studentId,
      studentName: student ? student.name : 'Student',
      date,
      status: status || 'present',
      period: 'Full Day',
      markedBy: req.user!.id,
      notes: notes || '',
      smsSentToParent: status === 'absent' || status === 'late',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.attendance.push(newRecord);
    savedRecords.push(newRecord);
  }

  return res.status(201).json({
    success: true,
    count: savedRecords.length,
    date,
    classId,
    records: savedRecords,
  });
});
