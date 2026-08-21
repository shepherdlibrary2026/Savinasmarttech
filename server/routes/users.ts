import { Router } from 'express';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { db } from '../db/database';

export const usersRouter = Router();

// GET /api/users - List users within tenant
usersRouter.get('/', (req: AuthenticatedRequest, res) => {
  const { role, gradeLevel } = req.query;
  const schoolId = req.user?.schoolId;

  let tenantUsers = db.users.filter((u) => u.schoolId === schoolId);

  if (role) {
    tenantUsers = tenantUsers.filter((u) => u.role === role);
  }
  if (gradeLevel) {
    tenantUsers = tenantUsers.filter((u) => u.gradeLevel === gradeLevel);
  }

  // If student or parent, sanitize staff or peers based on FERPA
  if (req.user?.role === 'student') {
    tenantUsers = tenantUsers.filter((u) => u.id === req.user?.id || u.role === 'teacher');
  }

  return res.json({ users: tenantUsers });
});

// GET /api/users/:id - User details
usersRouter.get('/:id', (req: AuthenticatedRequest, res) => {
  const targetUser = db.users.find((u) => u.id === req.params.id);
  if (!targetUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Cross tenant check
  if (targetUser.schoolId !== req.user?.schoolId) {
    return res.status(403).json({ error: 'Forbidden: Cross-tenant access denied.' });
  }

  return res.json({ user: targetUser });
});

// GET /api/profiles/:userId - FERPA protected profile data (Medical, PII, Emergency Contacts)
usersRouter.get('/profiles/:userId', (req: AuthenticatedRequest, res) => {
  const { userId } = req.params;
  const targetUser = db.users.find((u) => u.id === userId);

  if (!targetUser) {
    return res.status(404).json({ error: 'Target user not found' });
  }

  if (targetUser.schoolId !== req.user?.schoolId) {
    return res.status(403).json({ error: 'Forbidden: Cross-tenant isolation active.' });
  }

  // FERPA ACCESS CONTROL RULES:
  // 1. Super Admin or School Admin -> Allowed
  // 2. Teacher -> Allowed for students in school
  // 3. Student -> Self only
  // 4. Parent -> Self or verified child via parent_student_map
  const callerRole = req.user?.role;
  const callerId = req.user?.id;

  let isAuthorized = false;

  if (callerRole === 'school_admin' || (callerRole as any) === 'super_admin' || callerRole === 'platform_admin') {
    isAuthorized = true;
  } else if (callerRole === 'teacher') {
    isAuthorized = true;
  } else if (callerRole === 'student' && callerId === userId) {
    isAuthorized = true;
  } else if (callerRole === 'parent') {
    if (callerId === userId) {
      isAuthorized = true;
    } else {
      const isLinkedChild = db.parentStudentMaps.some(
        (psm) => psm.parentId === callerId && psm.studentId === userId
      );
      if (isLinkedChild) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    return res.status(403).json({
      error: 'FERPA Access Denied: You do not have educational rights to inspect this student profile record.',
      callerRole,
      targetUserId: userId,
    });
  }

  const profile = db.profiles.find((p) => p.userId === userId);
  return res.json({ profile: profile || null, user: targetUser });
});

// POST /api/users - Create new student or staff member (Admin only)
usersRouter.post('/', requireRole(['school_admin']), (req: AuthenticatedRequest, res) => {
  const { firstName, lastName, email, role, phone, gradeLevel, studentTier, section } = req.body;

  if (!firstName || !lastName || !email || !role) {
    return res.status(400).json({ error: 'Missing required user fields (firstName, lastName, email, role).' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    schoolId: req.user!.schoolId,
    email,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    role,
    phone: phone || '',
    gradeLevel: gradeLevel || undefined,
    studentTier: studentTier || undefined,
    section: section || undefined,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  return res.status(201).json({ success: true, user: newUser });
});
