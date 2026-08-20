import React from 'react';
import { MessageSquare, ArrowRight, LogIn, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/AuthContext.tsx';

interface LandingHeaderProps {
  onLaunchDemo: () => void;
  onSelectPricing: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ onLaunchDemo, onSelectPricing }) => {
  const { user, signInWithGoogle } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img 
            src="/logo.png" 
            alt="KwikBill Logo" 
            className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-slate-200 shadow-sm"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Kwik<span className="text-indigo-600">Bill</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 rounded border border-indigo-100 uppercase tracking-wider">
                Pro
              </span>
            </div>
          </div>
        </div>


        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">Core Features</a>
          <a href="#mobile-app" className="hover:text-indigo-600 transition-colors flex items-center gap-1 text-indigo-600 font-semibold">
            <span>Mobile App</span>
            <span className="px-1.5 py-0.2 text-[9px] bg-emerald-100 text-emerald-700 font-bold rounded">New</span>
          </a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing (₹299/₹499)</a>
        </nav>


        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Direct Live Demo Workspace (No Popup) */}
          <button
            onClick={onLaunchDemo}
            id="landing-header-demo-btn"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <span>Live Demo Workspace</span>
          </button>

          {/* Sign In / Subscribe */}
          <button
            onClick={async () => {
              if (user) {
                onLaunchDemo();
              } else {
                onSelectPricing();
              }
            }}
            id="landing-header-action-btn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02] cursor-pointer"
          >
            {user ? (
              <>
                <LayoutDashboard className="w-4 h-4" />
                <span>Open Dashboard</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

