import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../config/constants.js';
import { AuthenticatedRequest, JwtUserPayload, UserRole } from '../types/index.js';
import { db } from '../services/store.js';

/**
 * Middleware to authenticate requests via Bearer JWT token
 */
export const authenticateJwt = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Bearer authorization token',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JwtUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired session token',
    });
    return;
  }
};

/**
 * Middleware to enforce specific roles (e.g. 'admin', 'vendor', 'courier')
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized', message: 'User identity missing' });
      return;
    }

    const hasPermission = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasPermission) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Requires one of [${allowedRoles.join(', ')}] permissions.`,
      });
      return;
    }

    next();
  };
};

/**
 * Resolves and validates the target campus context from X-Campus-ID header or query
 */
export const resolveCampusContext = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const campusHeader =
    (req.headers['x-campus-id'] as string) ||
    (req.query.campusId as string) ||
    req.user?.campusId ||
    'campus-run-ede'; // Default flagship

  const campus = db.campuses.find(
    (c) => c.id === campusHeader || c.slug === campusHeader
  );

  if (!campus) {
    res.status(404).json({
      error: 'CampusNotFound',
      message: `Specified campus identifier '${campusHeader}' does not exist on UniHive`,
    });
    return;
  }

  req.campusId = campus.id;
  next();
};
