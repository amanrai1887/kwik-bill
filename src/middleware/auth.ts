import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/users.ts';
import { config } from '../config/app.config.ts';

export interface AuthRequest extends Request {
  user?: DecodedIdToken | { uid: string; email: string; name?: string };
  dbUser?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const isDevOrDemo = config.allowDemoAuth;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (isDevOrDemo) {
      const demoUid = 'demo-business-owner-101';
      const demoEmail = 'owner@speedytrans.in';
      try {
        const dbUser = await getOrCreateUser(demoUid, demoEmail, 'Speedy Transport & Logistics');
        req.user = { uid: demoUid, email: demoEmail, name: 'Speedy Transport Logistics' };
        req.dbUser = dbUser;
        return next();
      } catch (err) {
        console.error('Error creating/fetching fallback user:', err);
        return res.status(500).json({ success: false, error: { code: 'SESSION_INIT_ERROR', message: 'Database session initialization error' } });
      }
    }
    return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized: Missing or invalid Authorization header.' } });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const dbUser = await getOrCreateUser(
      decodedToken.uid,
      decodedToken.email || 'user@example.com',
      decodedToken.name || 'My Business'
    );
    req.user = decodedToken;
    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    if (isDevOrDemo) {
      const demoUid = 'demo-business-owner-101';
      const demoEmail = 'owner@speedytrans.in';
      const dbUser = await getOrCreateUser(demoUid, demoEmail, 'Speedy Transport & Logistics');
      req.user = { uid: demoUid, email: demoEmail, name: 'Speedy Transport Logistics' };
      req.dbUser = dbUser;
      return next();
    }
    return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Unauthorized: Invalid or expired authentication token.' } });
  }
};
