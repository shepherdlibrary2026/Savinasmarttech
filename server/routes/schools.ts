import { Router } from 'express';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';
import { db } from '../db/database';

export const schoolsRouter = Router();

// GET /api/schools - List accessible schools
schoolsRouter.get('/', (req: AuthenticatedRequest, res) => {
  const isPlatformAdmin = req.user?.role === 'platform_admin' || (req.user?.role as any) === 'super_admin';
  if (isPlatformAdmin) {
    return res.json({ schools: db.schools });
  }

  // Tenant-restricted
  const tenantSchools = db.schools.filter((s) => s.id === req.user?.schoolId);
  return res.json({ schools: tenantSchools });
});

// GET /api/schools/:id - Specific school tenant details
schoolsRouter.get('/:id', (req: AuthenticatedRequest, res) => {
  const school = db.schools.find((s) => s.id === req.params.id);
  if (!school) {
    return res.status(404).json({ error: 'School not found' });
  }

  // Multi-tenant check
  if (
    req.user?.role !== 'platform_admin' &&
    (req.user?.role as any) !== 'super_admin' &&
    school.id !== req.user?.schoolId
  ) {
    return res.status(403).json({ error: 'Access denied: Cross-tenant access violation.' });
  }

  const classesCount = db.classes.filter((c) => c.schoolId === school.id).length;
  const staffCount = db.users.filter(
    (u) => u.schoolId === school.id && ['school_admin', 'teacher', 'bursar'].includes(u.role)
  ).length;
  const studentsCount = db.users.filter((u) => u.schoolId === school.id && u.role === 'student').length;

  return res.json({
    school,
    stats: {
      classesCount,
      staffCount,
      studentsCount,
      activeTerm: school.activeTermId,
    },
  });
});

// PATCH /api/schools/:id - Update school settings (School Admin only)
schoolsRouter.patch('/:id', requireRole(['school_admin']), (req: AuthenticatedRequest, res) => {
  const school = db.schools.find((s) => s.id === req.params.id);
  if (!school) {
    return res.status(404).json({ error: 'School not found' });
  }

  if (school.id !== req.user?.schoolId) {
    return res.status(403).json({ error: 'Forbidden: Cannot modify another school.' });
  }

  const { name, motto, themeColor, momoMerchantIdMTN, orangeMoneyMerchantId } = req.body;
  if (name) school.name = name;
  if (motto) school.motto = motto;
  if (themeColor) school.themeColor = themeColor;
  if (momoMerchantIdMTN) school.momoMerchantIdMTN = momoMerchantIdMTN;
  if (orangeMoneyMerchantId) school.orangeMoneyMerchantId = orangeMoneyMerchantId;
  school.updatedAt = new Date().toISOString();

  return res.json({ success: true, school });
});
