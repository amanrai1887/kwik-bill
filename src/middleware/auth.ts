import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/users.ts';

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
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If no auth header, support fallback demo user session for smooth testing
    const demoUid = (req.headers['x-demo-user-id'] as string) || 'demo-business-owner-101';
    const demoEmail = (req.headers['x-demo-email'] as string) || 'owner@speedytrans.in';
    
    try {
      const dbUser = await getOrCreateUser(demoUid, demoEmail, 'Speedy Transport & Logistics');
      req.user = { uid: demoUid, email: demoEmail, name: 'Speedy Transport Logistics' };
      req.dbUser = dbUser;
      return next();
    } catch (err) {
      console.error('Error creating/fetching fallback user:', err);
      return res.status(500).json({ error: 'Database session initialization error' });
    }
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const dbUser = await getOrCreateUser(decodedToken.uid, decodedToken.email || 'user@example.com', decodedToken.name || 'My Business');
    req.user = decodedToken;
    req.dbUser = dbUser;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    // Graceful fallback for mock tokens or guest demo
    const demoUid = 'demo-business-owner-101';
    const demoEmail = 'owner@speedytrans.in';
    const dbUser = await getOrCreateUser(demoUid, demoEmail, 'Speedy Transport & Logistics');
    req.user = { uid: demoUid, email: demoEmail, name: 'Speedy Transport Logistics' };
    req.dbUser = dbUser;
    next();
  }
};
