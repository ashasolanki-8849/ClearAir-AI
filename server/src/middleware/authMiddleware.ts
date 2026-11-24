import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullName?: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'clearair_super_secret_jwt_key_2026_smog_protection';

  try {
    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      fullName: decoded.fullName,
    };
    next();
  } catch (err: any) {
    res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    return;
  }
};

export const optionalAuthenticateToken = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return next();
  }

  const secret = process.env.JWT_SECRET || 'clearair_super_secret_jwt_key_2026_smog_protection';

  try {
    const decoded = jwt.verify(token, secret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      fullName: decoded.fullName,
    };
  } catch (err) {
    // Ignore invalid token for optional auth
  }
  next();
};
