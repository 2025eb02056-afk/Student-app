import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { UserRole } from '../shared/types/index.js';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export function generateToken(payload: AuthUserPayload): string {
  return jwt.sign(payload, env.SESSION_SECRET, { expiresIn: '7d' });
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new UnauthorizedError('Please log in to continue'));
  }

  try {
    const decoded = jwt.verify(token, env.SESSION_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    return next(new UnauthorizedError('Session expired or invalid. Please log in again.'));
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, env.SESSION_SECRET) as AuthUserPayload;
      req.user = decoded;
    } catch {
      // Ignored for optional auth
    }
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to perform this action'));
    }

    next();
  };
}
