import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.ts';
import type { User, Role } from '../types/index.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'yadakpart_super_secret_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function comparePassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Middleware: Extract user if token present (doesn't fail if missing)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (decoded && decoded.id) {
      const user = db.findUserById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }
  }
  next();
}

// Middleware: Require user to be logged in
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'لطفاً ابتدا وارد حساب کاربری خود شوید.' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    return res.status(401).json({ error: 'توکن نامعتبر یا منقضی شده است.' });
  }

  const user = db.findUserById(decoded.id);
  if (!user || !user.isActive) {
    return res.status(401).json({ error: 'حساب کاربری یافت نشد یا غیرفعال است.' });
  }

  req.user = user;
  next();
}

// Middleware: Strictly require admin or super_admin role
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
      return res.status(403).json({ error: 'دسترسی غیرمجاز: این بخش فقط برای مدیران سیستم مجاز است.' });
    }
    next();
  });
}
