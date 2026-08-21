import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../src/types';
import { db } from '../db/database';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    schoolId: string;
    role: UserRole;
    email: string;
    name: string;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Support custom headers, Bearer tokens, or fallback defaults
  const headerUserId = req.headers['x-user-id'] as string;
  const headerSchoolId = req.headers['x-school-id'] as string;
  const headerRole = req.headers['x-user-role'] as UserRole;
  const authHeader = req.headers['authorization'];

  if (headerUserId) {
    const existingUser = db.users.find((u) => u.id === headerUserId);
    if (existingUser) {
      req.user = {
        id: existingUser.id,
        schoolId: headerSchoolId || existingUser.schoolId,
        role: headerRole || existingUser.role,
        email: existingUser.email,
        name: existingUser.name,
      };
      return next();
    }
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    // In production, verify JWT token; for mock/session verification:
    const matchedUser = db.users.find((u) => u.id === token || u.email === token);
    if (matchedUser) {
      req.user = {
        id: matchedUser.id,
        schoolId: matchedUser.schoolId,
        role: matchedUser.role,
        email: matchedUser.email,
        name: matchedUser.name,
      };
      return next();
    }
  }

  // Default context (Savina Administrator) for open testing
  const defaultAdmin = db.users.find((u) => u.role === 'school_admin') || db.users[0];
  req.user = {
    id: defaultAdmin.id,
    schoolId: defaultAdmin.schoolId,
    role: defaultAdmin.role,
    email: defaultAdmin.email,
    name: defaultAdmin.name,
  };

  next();
}

/**
 * Require specific roles middleware
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated: No user context found.' });
    }

    if (
      req.user.role === 'platform_admin' ||
      (req.user.role as any) === 'super_admin' ||
      allowedRoles.includes(req.user.role)
    ) {
      return next();
    }

    return res.status(403).json({
      error: `Forbidden: Role '${req.user.role}' does not have required permissions.`,
      requiredRoles: allowedRoles,
    });
  };
}
