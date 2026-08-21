import { Router } from 'express';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { db } from '../db/database';

export const liveClassroomRouter = Router();

// GET /api/live/sessions - Active live audio/slide sessions
liveClassroomRouter.get('/sessions', (req: AuthenticatedRequest, res) => {
  const schoolId = req.user?.schoolId;
  const sessions = db.liveSessions.filter((s) => s.schoolId === schoolId);
  return res.json({ sessions });
});

// GET /api/live/sessions/:id - Specific live session state
liveClassroomRouter.get('/sessions/:id', (req: AuthenticatedRequest, res) => {
  const session = db.liveSessions.find((s) => s.id === req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.schoolId !== req.user?.schoolId) {
    return res.status(403).json({ error: 'Access forbidden across school boundaries.' });
  }

  return res.json({ session });
});

// PATCH /api/live/sessions/:id/slide - Change active slide broadcast (Teacher only)
liveClassroomRouter.patch('/sessions/:id/slide', requireRole(['teacher', 'school_admin']), (req: AuthenticatedRequest, res) => {
  const { slideIndex, audioBroadcastActive } = req.body;
  const session = db.liveSessions.find((s) => s.id === req.params.id);

  if (!session) {
    return res.status(404).json({ error: 'Live session not found' });
  }

  if (slideIndex !== undefined) {
    session.activeSlideIndex = Number(slideIndex);
  }
  if (audioBroadcastActive !== undefined) {
    session.audioBroadcastActive = Boolean(audioBroadcastActive);
  }

  return res.json({ success: true, session });
});
