import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokenUtils';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyAccessToken(token) as any;
    req.user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email
    };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

/** Optional authentication: attaches req.user when a VALID Bearer token is
 *  present; proceeds as an anonymous guest when the token is absent or
 *  invalid (a stale token in localStorage must not break guest-permitted
 *  actions like affiliate click tracking). Never use this to guard
 *  privileged routes — it never rejects. */
export const optionalAuthenticateToken = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = verifyAccessToken(token) as any;
      req.user = { id: decoded.sub, role: decoded.role, email: decoded.email };
    } catch {
      // invalid/expired token → treat as guest
    }
  }
  next();
};

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
  };
};

export const blockViewOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === 'PLATFORM_VIEWER') {
    return res.status(403).json({ error: 'View-only account. This action is not permitted.' });
  }
  next();
};
