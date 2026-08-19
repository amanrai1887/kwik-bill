import React, { useState } from 'react';
import { 
  LogIn, 
  Mail, 
  Lock, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext.tsx';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resendVerificationEmail } = useAuth();
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendStatus(null);
    setLoading(true);

    try {
      if (authMethod === 'google') {
        await signInWithGoogle();
        if (onSuccess) onSuccess();
        onClose();
      } else {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }

        if (isSignUp) {
          await signUpWithEmail(email, password);
          setVerificationSent(true);
        } else {
          await signInWithEmail(email, password);
          if (onSuccess) onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = err.message || 'Authentication failed. Please check credentials.';
      if (err.code === 'auth/email-not-verified') {
        msg = 'Your email address is not verified yet. Please check your inbox and click the activation link before signing in.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in is not enabled yet in your Firebase Console. Please enable "Email/Password" under Authentication > Sign-in method, or sign in with Google.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email. Please create an account.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !password) {
      setError('Please enter your email and password above to resend the verification link.');
      return;
    }
    setLoading(true);
    try {
      await resendVerificationEmail(email, password);
      setResendStatus('Verification link re-sent! Please check your inbox & spam folder.');
    } catch (e: any) {
      setError(e.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <img 
            src="/logo.png" 
            alt="KwikBill Logo" 
            className="w-14 h-14 rounded-2xl object-contain bg-white p-1 border border-slate-200 shadow-sm mx-auto mb-3"
          />
          <h2 className="text-xl font-bold text-slate-900">
            {isSignUp ? 'Create Workspace Account' : 'Sign In to Your Workspace'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your invoices, client directory, and WhatsApp automation
          </p>
        </div>


        {verificationSent ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
              <Mail className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Verify Your Email Address
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed px-2">
              We have dispatched a verification link to <strong className="text-slate-900 font-bold">{email}</strong>. Please click the link in your email to activate your account.
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left">
              <strong>Next Step:</strong> After clicking the link in your email, return here and sign in with your email & password to access your workspace.
            </div>
            {resendStatus && (
              <p className="text-xs font-semibold text-emerald-600">{resendStatus}</p>
            )}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => { setVerificationSent(false); setIsSignUp(false); }}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Proceed to Sign In
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer disabled:opacity-50"
              >
                Didn't receive email? Resend link
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab switch between Google and Email */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setAuthMethod('google'); setError(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  authMethod === 'google' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Google Login
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); setError(null); }}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  authMethod === 'email' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Email & Password
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                {error.includes('verified') && (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-[11px] text-indigo-700 font-bold underline hover:text-indigo-900 text-left mt-1 cursor-pointer"
                  >
                    Click here to resend verification email
                  </button>
                )}
              </div>
            )}

            {resendStatus && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700">
                {resendStatus}
              </div>
            )}


        {authMethod === 'google' ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Authenticate instantly with your Google account. Supports SuperAdmin and Small Business subscriber logins.
            </p>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Processing...' : isSignUp ? 'Create Account & Enter' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 text-xs">
              <span className="text-slate-500">
                {isSignUp ? 'Already have an account? ' : "Don't have an account yet? "}
              </span>
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                className="text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </form>
        )}
        </>
        )}
      </div>
    </div>
  );
};

