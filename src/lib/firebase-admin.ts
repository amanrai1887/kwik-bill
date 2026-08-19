import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let projectId = process.env.FIREBASE_PROJECT_ID || 'invoice-saas-app-fc503';

if (!getApps().length) {
  initializeApp({
    projectId,
  });
}


export const adminAuth = getAuth();

