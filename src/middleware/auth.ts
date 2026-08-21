import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getOrCreateUser } from '../db/users.ts';
import { config, isSuperAdminEmail } from '../config/app.config.ts';

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
  
  let dbUser: any = null;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (isDevOrDemo) {
      const demoUid = 'demo-business-owner-101';
      const demoEmail = 'owner@speedytrans.in';
      try {
        dbUser = await getOrCreateUser(demoUid, demoEmail, 'Speedy Transport & Logistics');
        req.user = { uid: demoUid, email: demoEmail, name: 'Speedy Transport Logistics' };
        req.dbUser = dbUser;
      } catch (err) {
        console.error('Error creating/fetching fallback user:', err);
        return res.status(500).json({ success: false, error: { code: 'SESSION_INIT_ERROR', message: 'Database session initialization error' } });
      }
    } else {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized: Missing or invalid Authorization header.' } });
    }
  } else {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      dbUser = await getOrCreateUser(
        decodedToken.uid,
        decodedToken.email || 'user@example.com',
        decodedToken.name || 'My Business'
      );
      req.user = decodedToken;
      req.dbUser = dbUser;
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      if (isDevOrDemo) {
        const demoUid = 'demo-business-owner-101';
        const demoEmail = 'owner@speedytrans.in';
        dbUser = await getOrCreateUser(demoUid, demoEmail, 'Speedy Transport & Logistics');
        req.user = { uid: demoUid, email: demoEmail, name: 'Speedy Transport Logistics' };
        req.dbUser = dbUser;
      } else {
        return res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Unauthorized: Invalid or expired authentication token.' } });
      }
    }
  }

  // Check if demo workspace visitor is attempting any mutating write operations
  if (req.dbUser?.uid === 'demo-business-owner-101') {
    const isWriteMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    if (isWriteMethod) {
      const url = req.originalUrl || req.url || '';
      const isPlanRequest = req.method === 'POST' && url.includes('/plan-request');
      const isCacheReset = req.method === 'POST' && url.includes('/cache/reset');
      if (!isPlanRequest && !isCacheReset) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'DEMO_READ_ONLY',
            message: 'You are viewing the demo workspace in read-only mode. Please sign in or create an account to create, edit, or delete data.',
          },
        });
      }
    }
  }

  // Check if tenant account has been suspended by Admin
  const isSuspendedAccount =
    req.dbUser &&
    ['suspended', 'inactive', 'cancelled'].includes(req.dbUser.subscriptionStatus);

  if (isSuspendedAccount) {
    const isSuperAdmin = req.dbUser.role === 'superadmin' || isSuperAdminEmail(req.dbUser.email);
    if (!isSuperAdmin) {
      const url = req.originalUrl || req.url || '';
      const isProfileGet = req.method === 'GET' && url.includes('/profile');
      const isPlanRequest = req.method === 'POST' && url.includes('/plan-request');

      if (!isProfileGet && !isPlanRequest) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_SUSPENDED',
            message: 'Your account has been suspended by the platform administrator. Please contact support.',
          },
        });
      }
    }
  }

  // Check if tenant 15-day free trial has expired
  if (req.dbUser) {
    const isSuperAdmin = req.dbUser.role === 'superadmin' || isSuperAdminEmail(req.dbUser.email);
    if (!isSuperAdmin && req.dbUser.subscriptionStatus !== 'active') {
      const isTrial = req.dbUser.subscriptionStatus === 'trial' || req.dbUser.subscriptionPlan === 'trial_15_days';
      const isTrialEnded = Boolean(
        isTrial && req.dbUser.trialEndsAt && new Date(req.dbUser.trialEndsAt).getTime() <= Date.now()
      );
      const isStatusExpired = req.dbUser.subscriptionStatus === 'expired';

      if (isTrialEnded || isStatusExpired) {
        const url = req.originalUrl || req.url || '';
        const isProfileGet = req.method === 'GET' && url.includes('/profile');
        const isPlanRequest = req.method === 'POST' && url.includes('/plan-request');

        if (!isProfileGet && !isPlanRequest) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'TRIAL_EXPIRED',
              message: 'Your 15-day free trial has expired. Please upgrade to a paid plan to continue.',
            },
          });
        }
      }
    }
  }

  next();
};
