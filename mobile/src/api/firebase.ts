import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth,
  getAuth,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
// @ts-ignore - Metro bundler resolves getReactNativePersistence in React Native runtime
import { getReactNativePersistence } from '@firebase/auth/dist/rn/index.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBvZ8MgdIoAnAma5YeEsZ-xM6NCmK9KwEg",
  authDomain: "invoice-saas-app-fc503.firebaseapp.com",
  projectId: "invoice-saas-app-fc503",
  storageBucket: "invoice-saas-app-fc503.firebasestorage.app",
  messagingSenderId: "254610968957",
  appId: "1:254610968957:web:e18fcbe1c3ef84395ebc14"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with React Native AsyncStorage persistence
export const auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch {
    return getAuth(app);
  }
})();

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signOut, 
  onAuthStateChanged, 
  FirebaseUser 
};
