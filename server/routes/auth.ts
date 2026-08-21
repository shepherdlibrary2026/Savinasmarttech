import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../db/database';

export const authRouter = Router();

// GET /api/auth/me - Current user identity and active tenant context
authRouter.get('/me', (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = db.users.find((u) => u.id === req.user?.id);
  const school = db.schools.find((s) => s.id === req.user?.schoolId);
  const profile = db.profiles.find((p) => p.userId === req.user?.id);

  return res.json({
    user,
    school,
    profile: profile || null,
    claims: {
      userId: req.user.id,
      schoolId: req.user.schoolId,
      role: req.user.role,
      email: req.user.email,
    },
  });
});

// POST /api/auth/switch-role - Simulate switching active persona for multi-role testing
authRouter.post('/switch-persona', (req: AuthenticatedRequest, res) => {
  const { role, userId } = req.body;

  let targetUser = userId ? db.users.find((u) => u.id === userId) : null;
  if (!targetUser && role) {
    targetUser = db.users.find((u) => u.role === role);
  }

  if (!targetUser) {
    return res.status(404).json({ error: `User with role '${role}' or id '${userId}' not found.` });
  }

  const school = db.schools.find((s) => s.id === targetUser?.schoolId);

  return res.json({
    message: `Switched active persona to ${targetUser.name} (${targetUser.role})`,
    user: targetUser,
    school,
  });
});

// GET /api/auth/personas - List all available test personas
authRouter.get('/personas', (req, res) => {
  return res.json({
    personas: db.users.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      email: u.email,
      schoolId: u.schoolId,
      gradeLevel: u.gradeLevel,
      studentTier: u.studentTier,
      avatarUrl: u.avatarUrl,
    })),
  });
});
