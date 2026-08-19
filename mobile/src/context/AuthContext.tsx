import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken, setAuthToken, removeAuthToken } from '../api/client.ts';
import { api } from '../api/endpoints.ts';
import { UserProfile } from '../types/index.ts';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  loginWithToken: (token: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<{ needVerification: boolean }>;
  resendEmailVerification: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInitialAuth = async () => {
    try {
      // 1. Try Firebase Auth with react-native persistence
      const { auth, onAuthStateChanged } = await import('../api/firebase.ts');

      // Wait for Firebase persistence to restore auth user
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            const freshToken = await fbUser.getIdToken();
            await setAuthToken(freshToken);
            setToken(freshToken);
            const profile = await api.getProfile();
            setUser(profile);
          } catch (e) {
            console.log('Error fetching profile on auth restore:', e);
          }
        } else {
          // If no Firebase user, check AsyncStorage token fallback
          const storedToken = await getAuthToken();
          if (storedToken) {
            try {
              setToken(storedToken);
              const profile = await api.getProfile();
              setUser(profile);
            } catch {
              await removeAuthToken();
              setToken(null);
              setUser(null);
            }
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.log('Mobile session loading error:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialAuth();
  }, []);



  const loginWithToken = async (newToken: string) => {
    setLoading(true);
    try {
      await setAuthToken(newToken);
      setToken(newToken);
      const profile = await api.getProfile();
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { signInWithEmailAndPassword, auth } = await import('../api/firebase.ts');
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      
      // Enforce email verification check on mobile
      if (!credential.user.emailVerified) {
        const { signOut } = await import('../api/firebase.ts');
        await signOut(auth);
        const err: any = new Error('Your email is not verified yet. Please check your inbox and click the verification link before logging in.');
        err.code = 'auth/email-not-verified';
        throw err;
      }

      const idToken = await credential.user.getIdToken();
      await loginWithToken(idToken);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { createUserWithEmailAndPassword, sendEmailVerification, signOut, auth } = await import('../api/firebase.ts');
      const credential = await createUserWithEmailAndPassword(auth, email, pass);
      
      // Send verification link to user's mail
      await sendEmailVerification(credential.user);
      
      // Sign out immediately until email link is clicked
      await signOut(auth);
      return { needVerification: true };
    } finally {
      setLoading(false);
    }
  };

  const resendEmailVerification = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const { signInWithEmailAndPassword, sendEmailVerification, signOut, auth } = await import('../api/firebase.ts');
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      await sendEmailVerification(credential.user);
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };


  const logout = async () => {
    await removeAuthToken();
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await api.getProfile();
      setUser(profile);
    } catch (e) {
      console.log('Failed to refresh profile:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      loginWithToken, 
      loginWithEmail, 
      registerWithEmail, 
      resendEmailVerification,
      logout, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>

  );

};

export const useMobileAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useMobileAuth must be used within an AuthProvider');
  }
  return context;
};
