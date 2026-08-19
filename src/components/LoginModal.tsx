import React, { useState } from 'react';
import { 
  LogIn, 
  Mail, 
  Lock, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Zap,
  MessageSquare,
  Building,
  Check
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext.tsx';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resendVerificationEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendStatus(null);
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please enter both your email address and password.');
      }
      if (password.length < 6) {
        throw new Error('Password must contain at least 6 characters.');
      }

      if (isSignUp) {
        await signUpWithEmail(email, password);
        setVerificationSent(true);
      } else {
        await signInWithEmail(email, password);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/email-not-verified') {
        msg = 'Your email address is not verified yet. Please check your inbox and click the verification link before signing in.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password sign-in is not enabled yet in your Firebase Console. Please enable "Email/Password" in Firebase Authentication settings or sign in with Google.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password. Please double check and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (err.code === 'auth/user-not-found') {
        msg = 'No account found with this email. Please click Create Account below.';
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
      setResendStatus('Verification link re-sent! Please check your inbox and spam folder.');
    } catch (e: any) {
      setError(e.message || 'Failed to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md transition-all animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200/80 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          id="close-login-modal-btn"
          aria-label="Close login dialog"
          className="absolute top-4 right-4 z-20 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT BRAND PROOF COLUMN (Modern SaaS Showcase) */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-8 flex-col justify-between relative overflow-hidden text-white border-r border-indigo-950">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Info */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/logo.png" 
                alt="KwikBill Logo" 
                className="w-11 h-11 rounded-xl object-contain bg-white p-1 shadow-md shadow-indigo-950/50"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-white">
                    Kwik<span className="text-indigo-400">Bill</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 uppercase">
                    Pro
                  </span>
                </div>
                <p className="text-[11px] text-indigo-200/70 font-medium">Smart Invoicing & WhatsApp Collections</p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight leading-snug mb-3">
              Collect Invoice Payments 3x Faster via WhatsApp.
            </h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed">
              Automate GST bills, client follow-ups, and instant UPI QR payments with enterprise-grade reliability.
            </p>
          </div>

          {/* Middle Value Props */}
          <div className="space-y-3.5 my-6 relative z-10">
            <div className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">1-Click WhatsApp Reminders</p>
                <p className="text-[11px] text-indigo-200/70">4-Stage friendly to urgent payment escalations</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Dynamic UPI Payment QR</p>
                <p className="text-[11px] text-indigo-200/70">Instant zero-fee settlement directly to your bank</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 backdrop-blur-xs">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Multi-Industry Templates</p>
                <p className="text-[11px] text-indigo-200/70">Tailored for Transport, Agencies, MSMEs & Retail</p>
              </div>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-indigo-200/60 relative z-10">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>256-Bit SSL Cloud Encrypted & Isolated Database</span>
          </div>
        </div>

        {/* RIGHT FORM COLUMN */}
        <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-center overflow-y-auto bg-white dark:bg-slate-900">
          <div className="max-w-md w-full mx-auto">
            
            {/* Mobile Header Brand Icon */}
            <div className="md:hidden flex items-center gap-2.5 mb-5">
              <img 
                src="/logo.png" 
                alt="KwikBill Logo" 
                className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-slate-200 shadow-xs"
              />
              <div>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  Kwik<span className="text-indigo-600">Bill</span> Pro
                </span>
              </div>
            </div>

            {/* Title Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {isSignUp ? 'Get Started Free' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isSignUp 
                  ? 'Create your workspace and start invoicing in under 2 minutes.' 
                  : 'Enter your credentials to access your billing dashboard.'}
              </p>
            </div>

            {/* VERIFICATION SENT STATE */}
            {verificationSent ? (
              <div className="text-center py-4 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-sm">
                  <Mail className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Check Your Inbox
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed px-2">
                  We sent an activation link to <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{email}</strong>. Please click the link to activate your account.
                </p>
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl text-xs text-amber-800 dark:text-amber-300 text-left">
                  <strong>💡 Pro Tip:</strong> After clicking the verification link in your email, return here and sign in with your email & password.
                </div>
                {resendStatus && (
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{resendStatus}</p>
                )}
                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setVerificationSent(false); setIsSignUp(false); }}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    Proceed to Sign In
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Didn't receive the email? Resend verification link
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* EMAIL FORM (Above) */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1.5 uppercase tracking-wider">
                      Work Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      {!isSignUp && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          Min. 6 chars
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    id="submit-auth-btn"
                    className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50 mt-2"
                  >
                    <span>{loading ? 'Processing...' : isSignUp ? 'Create Workspace Account' : 'Sign In to Workspace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* DIVIDER */}
                <div className="relative flex items-center justify-center my-5">
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                  <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Or continue with
                  </span>
                  <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                </div>

                {/* 1-CLICK GOOGLE SIGN IN (Below) */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                  id="google-auth-btn"
                  className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-60 mb-4"
                >
                  {/* Google SVG Icon */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{googleLoading ? 'Connecting with Google...' : 'Sign in with Google'}</span>
                </button>

                {/* Mode Switch Footer */}
                <div className="text-center pt-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400">
                    {isSignUp ? 'Already have an account? ' : "Don't have a workspace yet? "}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer ml-1"
                  >
                    {isSignUp ? 'Sign In' : 'Create Free Account'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};


