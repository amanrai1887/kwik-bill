import React from 'react';
import { MessageSquare, Heart, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';

export const LandingFooter: React.FC<{ 
  onLaunchDemo: () => void;
  onSelectPricing: () => void;
}> = ({ onLaunchDemo, onSelectPricing }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo.png" 
                alt="KwikBill Logo" 
                className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-slate-700 shadow-sm"
              />
              <span className="text-lg font-bold text-white tracking-tight">
                Kwik<span className="text-indigo-400">Bill</span> Pro
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Automated Invoicing & WhatsApp Payment Reminder Engine for Indian SMBs, transport fleets, agencies, and independent consultants.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Target Segments</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#target-industries" className="hover:text-indigo-400 transition-colors">Transport Companies</a></li>
              <li><a href="#target-industries" className="hover:text-indigo-400 transition-colors">Marketing Agencies</a></li>
              <li><a href="#target-industries" className="hover:text-indigo-400 transition-colors">Independent Freelancers</a></li>
              <li><a href="#target-industries" className="hover:text-indigo-400 transition-colors">Business Consultants</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Core Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Instant GST Invoicing</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">WhatsApp 1-Click Reminders</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Payment Settlement & QR</a></li>
              <li><a href="#calculator" className="hover:text-indigo-400 transition-colors">Monthly Revenue Trends</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">Workspace Access</h4>
            <p className="text-xs text-slate-400 mb-3">
              Experience the live interactive workspace with real-time PostgreSQL database synchronization.
            </p>
            <button
              onClick={onLaunchDemo}
              id="footer-open-workspace-btn"
              className="w-full py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Launch Live Demo Workspace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>


        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} KwikBill Pro. Designed with Professional Polish for Indian Enterprise.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cloud SQL Postgres Secured
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
