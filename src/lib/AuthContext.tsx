import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleAuthProvider } from './firebase.ts';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut, 
  User 
} from 'firebase/auth';
import { fetchProfile, updateProfile } from './api.ts';
import { UserProfile } from './types.ts';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  resendVerificationEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setDemoMode] = useState<boolean>(true);

  const loadUserProfile = async () => {
    try {
      const data = await fetchProfile();
      if (data.user) {
        setProfile(data.user);
      }
    } catch (e) {
      console.error('Failed to load profile on boot:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // If user logged in with password but email is NOT verified, block session
      if (firebaseUser && !firebaseUser.emailVerified && firebaseUser.providerData.some(p => p.providerId === 'password')) {
        setUser(null);
        setDemoMode(true);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      if (firebaseUser) {
        setDemoMode(false);
      }
      await loadUserProfile();
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleAuthProvider);
      setDemoMode(false);
      await loadUserProfile();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      
      // Enforce email verification check
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        setUser(null);
        setDemoMode(true);
        const err: any = new Error('Your email address is not verified yet. Please check your inbox (and spam folder) and click the verification link before signing in.');
        err.code = 'auth/email-not-verified';
        throw err;
      }

      setDemoMode(false);
      await loadUserProfile();
    } catch (error) {
      console.error('Error signing in with Email/Password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      
      // Send verification link to user's email address
      await sendEmailVerification(userCredential.user);

      // Sign out immediately until email link is clicked
      await signOut(auth);
      setUser(null);
      setDemoMode(true);
    } catch (error) {
      console.error('Error creating account with Email/Password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (email: string, pass: string) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);
      setDemoMode(true);
      await loadUserProfile();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    const res = await updateProfile(data);
    if (res.user) {
      setProfile(res.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        resendVerificationEmail: handleResendVerification,
        logout: handleLogout,
        refreshProfile: loadUserProfile,
        updateUserProfile: handleUpdateProfile,
        isDemoMode,
        setDemoMode,
      }}
    >

      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
