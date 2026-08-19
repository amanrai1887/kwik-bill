import React, { useState } from 'react';
import { 
  Check, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  LogIn, 
  IndianRupee, 
  X,
  CreditCard,
  Building,
  Mail,
  Lock,
  UserCheck,
  Send,
  Phone,
  User,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext.tsx';
import { submitPlanRequestApi } from '../lib/api.ts';
import { launchRazorpayCheckout } from '../lib/razorpay.ts';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: 'trial_15_days' | 'starter_299' | 'pro_499') => Promise<void>;
}

export const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [selectedTier, setSelectedTier] = useState<'trial_15_days' | 'starter_299' | 'pro_499'>('trial_15_days');
  const [isProcessing, setIsProcessing] = useState(false);

  // Authentication Mode (if user not logged in)
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Paid Plan Business Inquiry Details Form
  const [showBusinessDetailsForm, setShowBusinessDetailsForm] = useState(false);
  const [bizName, setBizName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [industry, setIndustry] = useState('transport');
  const [businessNeeds, setBusinessNeeds] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleNextOrSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    // 1. If not authenticated, authenticate first
    if (!user) {
      setIsProcessing(true);
      try {
        if (authMethod === 'google') {
          await signInWithGoogle();
        } else {
          if (!email || !password) throw new Error('Please enter email and password.');
          if (password.length < 6) throw new Error('Password must be at least 6 characters.');
          if (isSignUp) await signUpWithEmail(email, password);
          else await signInWithEmail(email, password);
        }
      } catch (err: any) {
        console.error('Auth error:', err);
        let msg = err.message || 'Authentication failed. Please check credentials.';
        if (err.code === 'auth/operation-not-allowed') {
          msg = 'Email/Password sign-in is not enabled in Firebase Console. Use Google Sign In or enable it.';
        } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          msg = 'Invalid email or password.';
        } else if (err.code === 'auth/email-already-in-use') {
          msg = 'This email is already registered. Please click "Sign In".';
        }
        setAuthError(msg);
        setIsProcessing(false);
        return;
      } finally {
        setIsProcessing(false);
      }
    }

    // 2. If user selected 15-day trial, activate directly
    if (selectedTier === 'trial_15_days') {
      setIsProcessing(true);
      try {
        await onSelectPlan('trial_15_days');
        onClose();
      } catch (err: any) {
        alert(err.message || 'Failed to start trial');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // 3. If paid plan selected, show the business details form before sending to Admin
    if (!showBusinessDetailsForm) {
      setShowBusinessDetailsForm(true);
      return;
    }

    // 4. Submit Business Needs Request to SuperAdmin
    if (!bizName || !contactName || !contactPhone) {
      alert('Please fill in Company Name, Contact Person, and Phone number.');
      return;
    }

    setIsProcessing(true);
    try {
      await submitPlanRequestApi({
        businessName: bizName,
        contactPerson: contactName,
        email: email || user?.email || '',
        phone: contactPhone,
        industryType: industry,
        requestedPlan: selectedTier,
        businessNeeds,
      });

      // Grant trial/preview access while Admin provisions account
      await onSelectPlan(selectedTier);
      setRequestSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit plan request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInstantRazorpayPayment = async () => {
    if (selectedTier === 'trial_15_days') {
      handleNextOrSubmit();
      return;
    }

    const amountInRupees = selectedTier === 'pro_499' ? 499 : 299;
    const planName = selectedTier === 'pro_499' ? 'Pro Growth Plan (₹499/mo)' : 'Starter Plan (₹299/mo)';

    setIsProcessing(true);
    await launchRazorpayCheckout({
      amountInPaise: amountInRupees * 100,
      planId: selectedTier,
      planName,
      userEmail: user?.email || email || '',
      userName: user?.displayName || contactName || 'Subscriber',
      userPhone: contactPhone || '',
      onSuccess: async (verifyRes) => {
        setIsProcessing(false);
        await onSelectPlan(selectedTier);
        onClose();
      },
      onError: (errMsg) => {
        setIsProcessing(false);
        alert(`Payment Error: ${errMsg}`);
      },
      onDismiss: () => {
        setIsProcessing(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showBusinessDetailsForm ? 'Company Requirement Details' : 'Choose Your Plan Tier'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {showBusinessDetailsForm ? 'Tell Us About Your Business' : 'Select Your Workspace Access'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {showBusinessDetailsForm
              ? 'Provide your business requirements so our admin team can configure your dedicated workspace and WhatsApp presets.'
              : 'Start free for 15 days or request our Starter / Pro plan with custom WhatsApp automation.'}
          </p>
        </div>

        {/* STEP 1: Plan Selector */}
        {!showBusinessDetailsForm && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* OPTION 1: 15-Day Free Trial */}
              <div
                onClick={() => setSelectedTier('trial_15_days')}
                className={`rounded-2xl p-5 border-2 flex flex-col justify-between cursor-pointer transition-all ${
                  selectedTier === 'trial_15_days'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-4 ring-emerald-600/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      15-Day Free Trial
                    </span>
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-black text-slate-900">₹0</span>
                    <span className="text-xs text-slate-500 font-medium">/ 15 days</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                    Full exploratory access to test GST invoicing & WhatsApp reminders with instant activation.
                  </p>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>15 Days Full Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instant ₹0 Activation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Direct UPI QR + Invoicing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>WhatsApp Reminders</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3">
                  <div className={`w-full py-2 text-center rounded-xl text-xs font-bold transition-all ${
                    selectedTier === 'trial_15_days'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedTier === 'trial_15_days' ? 'Selected' : 'Select 15-Day Trial'}
                  </div>
                </div>
              </div>

              {/* OPTION 2: Starter Plan (₹299/mo) */}
              <div
                onClick={() => setSelectedTier('starter_299')}
                className={`rounded-2xl p-5 border-2 flex flex-col justify-between cursor-pointer transition-all ${
                  selectedTier === 'starter_299'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-600/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                      Starter Plan
                    </span>
                    <Building className="w-4 h-4 text-indigo-600" />
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-black text-slate-900">₹299</span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                    Ideal for small transport fleets, tuition centers, gyms, and retail shops.
                  </p>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Unlimited Invoices & Dues</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>WhatsApp Payment Reminders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Admin Assisted Onboarding</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3">
                  <div className={`w-full py-2 text-center rounded-xl text-xs font-bold transition-all ${
                    selectedTier === 'starter_299'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedTier === 'starter_299' ? 'Selected' : 'Select Starter Plan'}
                  </div>
                </div>
              </div>

              {/* OPTION 3: Pro Growth Plan (₹499/mo) */}
              <div
                onClick={() => setSelectedTier('pro_499')}
                className={`rounded-2xl p-5 border-2 flex flex-col justify-between cursor-pointer relative transition-all ${
                  selectedTier === 'pro_499'
                    ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-600/10'
                    : 'border-indigo-300 bg-white hover:border-indigo-400'
                }`}
              >
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full">
                  Recommended
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white">
                      Pro Growth Plan
                    </span>
                    <Zap className="w-4 h-4 text-indigo-600" />
                  </div>

                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-black text-slate-900">₹499</span>
                    <span className="text-xs text-slate-500 font-medium">/ month</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                    Full automation suite with 1-Click Meta Cloud API gateway & priority CA support.
                  </p>

                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-700 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span><strong>Everything in Starter Plan</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>1-Click Direct WhatsApp API</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Multi-Segment Custom Workflows</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3">
                  <div className={`w-full py-2 text-center rounded-xl text-xs font-bold transition-all ${
                    selectedTier === 'pro_499'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {selectedTier === 'pro_499' ? 'Selected' : 'Select Pro Plan'}
                  </div>
                </div>
              </div>
            </div>

            {/* Authentication (if guest) */}
            {!user && (
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Account Sign-In</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setAuthMethod('google'); setAuthError(null); }}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        authMethod === 'google'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Google Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMethod('email'); setAuthError(null); }}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        authMethod === 'email'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Email & Password
                    </button>
                  </div>
                </div>

                {authError && (
                  <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                    {authError}
                  </div>
                )}

                {authMethod === 'email' ? (
                  <form className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address *</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="email"
                            required
                            placeholder="you@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Password *</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setIsSignUp(!isSignUp); setAuthError(null); }}
                        className="text-indigo-600 font-bold hover:underline cursor-pointer"
                      >
                        {isSignUp ? 'Sign In with Password' : 'Create New Account'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-slate-500">
                    You will authenticate securely using your Google account.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* STEP 2: Business & Requirement Details Form (for paid plans) */}
        {showBusinessDetailsForm && (
          <div className="space-y-4 max-w-2xl mx-auto bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                  Plan Selected: {selectedTier === 'pro_499' ? 'Pro Growth (₹499/mo)' : 'Starter (₹299/mo)'}
                </span>
                <p className="text-[11px] text-slate-500">Fill in details for administrative setup & client portal onboarding</p>
              </div>
              <button
                type="button"
                onClick={() => setShowBusinessDetailsForm(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline cursor-pointer"
              >
                Change Plan
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Company / Business Name *</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mahavir Freight or FitZone Gym"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Contact Person Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">WhatsApp Mobile Phone *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="+91 98200 12345"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Business Segment</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                >
                  <option value="transport">Transport & Logistics Fleet</option>
                  <option value="gym">Gym & Fitness Studio</option>
                  <option value="coaching">Coaching & Tuition Institute</option>
                  <option value="retail">Retail Shop & Kirana / Trader</option>
                  <option value="agency">Marketing & Tech Agency</option>
                  <option value="freelancer">Freelancer / Creator</option>
                  <option value="consultant">Consultant / Advisory</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Specific Business Needs / Invoicing Volume (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Need WhatsApp reminders sent to 50 truck clients daily, or quarterly gym renewals..."
                value={businessNeeds}
                onChange={(e) => setBusinessNeeds(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            {requestSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Request sent to Admin! Loading your workspace dashboard...</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure 256-bit encrypted Razorpay checkout</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {!showBusinessDetailsForm && selectedTier !== 'trial_15_days' && (
              <button
                type="button"
                onClick={handleNextOrSubmit}
                disabled={isProcessing}
                className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer"
              >
                Request Assisted Setup
              </button>
            )}

            <button
              onClick={
                !showBusinessDetailsForm && selectedTier !== 'trial_15_days'
                  ? handleInstantRazorpayPayment
                  : handleNextOrSubmit
              }
              disabled={isProcessing}
              id="plan-modal-continue-btn"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              <span>
                {isProcessing
                  ? 'Processing...'
                  : showBusinessDetailsForm
                  ? 'Submit Details & Launch Workspace'
                  : selectedTier === 'trial_15_days'
                  ? 'Start 15-Day Free Trial'
                  : selectedTier === 'pro_499'
                  ? 'Pay ₹499 via Razorpay (Instant)'
                  : 'Pay ₹299 via Razorpay (Instant)'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

