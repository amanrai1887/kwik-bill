import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  IndianRupee, 
  Search, 
  Filter, 
  RefreshCw,
  Zap,
  Building,
  Check,
  UserPlus,
  X,
  Mail,
  Phone,
  Briefcase
} from 'lucide-react';
import { 
  fetchAdminTenants, 
  createAdminTenant, 
  updateAdminTenantSubscription,
  fetchAdminPlanRequests,
  updateAdminPlanRequestStatus
} from '../lib/api.ts';
import { isSuperAdminUser } from '../lib/planConfig.ts';
import { toast } from '../context/ToastContext.tsx';

export const AdminTenantsView: React.FC = () => {
  const [activeAdminTab, setActiveAdminTab] = useState<'tenants' | 'requests'>('tenants');
  const [tenants, setTenants] = useState<any[]>([]);
  const [planRequests, setPlanRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Onboard modal state
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [newBizName, setNewBizName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newUpiId, setNewUpiId] = useState('');
  const [newIndustry, setNewIndustry] = useState('transport');
  const [newPlan, setNewPlan] = useState('pro_499');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tenantsData, requestsData] = await Promise.all([
        fetchAdminTenants().catch(() => ({ tenants: [] })),
        fetchAdminPlanRequests().catch(() => ({ requests: [] })),
      ]);
      if (tenantsData.tenants) setTenants(tenantsData.tenants);
      if (requestsData.requests) setPlanRequests(requestsData.requests);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createAdminTenant({
        businessName: newBizName,
        email: newEmail,
        phone: newPhone,
        upiId: newUpiId,
        industryType: newIndustry,
        subscriptionPlan: newPlan,
      });
      setIsOnboardModalOpen(false);
      setNewBizName('');
      setNewEmail('');
      setNewPhone('');
      setNewUpiId('');
      toast.success(`Business "${newBizName}" onboarded and active!`, 'Tenant Created');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to onboard business', 'Onboarding Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubscription = async (tenantId: number, newPlan: string, newStatus: string) => {
    setUpdatingId(tenantId);
    try {
      await updateAdminTenantSubscription(tenantId, newPlan, newStatus);
      toast.success('Tenant subscription plan and status updated.', 'Subscription Updated');
      await loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update subscription', 'Update Error');
    } finally {
      setUpdatingId(null);
    }
  };


  const filteredTenants = tenants.filter(t => {
    const matchesSearch = 
      (t.businessName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.phone || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || t.subscriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate SaaS business metrics for you as the owner
  const payingTenants = tenants.filter(t => t.role !== 'superadmin');
  const totalSubscribers = payingTenants.length;
  const activeSubscribers = payingTenants.filter(t => t.subscriptionStatus === 'active').length;
  
  // Calculate MRR (Monthly Recurring Revenue)
  const estimatedMRR = payingTenants.reduce((sum, t) => {
    if (t.subscriptionStatus !== 'active') return sum;
    if (t.subscriptionPlan === 'pro_499') return sum + 499;
    return sum + 299;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header & Owner badge */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SuperAdmin Master Console</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Client Companies & Subscription Directory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            As the SaaS Platform Owner, manage all small businesses subscribed to your platform, provision new client accounts, and track your revenue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOnboardModalOpen(true)}
            id="admin-onboard-company-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Onboard New Company</span>
          </button>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Admin Sub-Tabs Navigation */}
      <div className="flex bg-slate-200/80 p-1 rounded-2xl max-w-md text-xs font-bold">
        <button
          onClick={() => setActiveAdminTab('tenants')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeAdminTab === 'tenants'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Client Companies ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('requests')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeAdminTab === 'requests'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Paid Plan Inquiries ({planRequests.filter(r => r.status === 'pending').length})</span>
        </button>
      </div>

      {/* TAB 1: TENANTS */}
      {activeAdminTab === 'tenants' && (
        <>
          {/* SaaS Business Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Estimated MRR */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Monthly MRR</div>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono text-emerald-600">
                  ₹{estimatedMRR.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Recurring subscription revenue</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>

            {/* Total Registered Businesses */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subscribed Companies</div>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {totalSubscribers}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Active business client tenants</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building className="w-6 h-6" />
              </div>
            </div>

            {/* Active Paying Ratio */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Paying Tiers</div>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono text-indigo-600">
                  {activeSubscribers} / {totalSubscribers}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                  {totalSubscribers > 0 ? Math.round((activeSubscribers / totalSubscribers) * 100) : 0}% Active Ratio
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by company name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
              >
                <option value="all">All Companies</option>
                <option value="active">Active Accounts</option>
                <option value="trial">Trial Accounts</option>
                <option value="inactive">Suspended Accounts</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: PLAN INQUIRY REQUESTS */}
      {activeAdminTab === 'requests' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">New Paid Subscription Inquiries & Business Requests</h2>
              <p className="text-xs text-slate-500">Businesses that selected Starter (₹299) or Pro (₹499) plans and submitted their needs</p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-full text-xs">
              {planRequests.length} Total Inquiries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Company & Contact</th>
                  <th className="py-3 px-4">Phone / WhatsApp</th>
                  <th className="py-3 px-4">Requested Tier</th>
                  <th className="py-3 px-4">Segment & Needs</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {planRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No plan inquiries received yet. When users select paid plans, their requirements appear here!
                    </td>
                  </tr>
                ) : (
                  planRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{req.businessName}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{req.contactPerson}</div>
                        <div className="text-[11px] text-slate-400">{req.email}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-indigo-600 font-bold">
                        <a href={`https://wa.me/${req.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:underline inline-flex items-center gap-1">
                          <span>{req.phone}</span>
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                          {req.requestedPlan === 'pro_499' ? 'Pro Growth (₹499)' : 'Starter (₹299)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="capitalize font-semibold text-slate-700">{req.industryType}</div>
                        <div className="text-[11px] text-slate-500 truncate" title={req.businessNeeds}>
                          {req.businessNeeds || 'Standard invoicing requirements'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          req.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === 'pending' && (
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={async () => {
                                await updateAdminPlanRequestStatus(req.id, {
                                  status: 'approved',
                                  approveAsSubscriber: true,
                                  userId: req.userId,
                                  requestedPlan: req.requestedPlan,
                                });
                                await loadData();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors cursor-pointer"
                            >
                              Approve Plan
                            </button>
                            <button
                              onClick={async () => {
                                await updateAdminPlanRequestStatus(req.id, { status: 'rejected' });
                                await loadData();
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Tenants Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Client Company Details</th>
                <th className="py-3 px-4">Industry Segment</th>
                <th className="py-3 px-4">Assigned Subscription Tier</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-right">Owner Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No companies onboarded yet. Click "+ Onboard New Company" to provision your first business client!
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => {
                  const isOwner = isSuperAdminUser(t);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{t.businessName || 'Unnamed Company'}</div>
                        <div className="text-[11px] text-slate-500">{t.email}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{t.phone || 'No phone'}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {t.industryType || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isOwner ? (
                          <span className="font-bold text-indigo-700">Platform Owner</span>
                        ) : (
                          <select
                            value={t.subscriptionPlan}
                            disabled={updatingId === t.id}
                            onChange={(e) => handleUpdateSubscription(t.id, e.target.value, t.subscriptionStatus)}
                            className="py-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-indigo-700"
                          >
                            <option value="trial_15_days">15-Day Free Trial (₹0)</option>
                            <option value="starter_299">Starter (₹299/mo)</option>
                            <option value="pro_499">Pro Growth (₹499/mo)</option>
                          </select>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isOwner ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                            SuperAdmin
                          </span>
                        ) : (
                          <select
                            value={t.subscriptionStatus}
                            disabled={updatingId === t.id}
                            onChange={(e) => handleUpdateSubscription(t.id, t.subscriptionPlan, e.target.value)}
                            className={`py-1 px-2 border rounded-lg text-xs font-bold ${
                              t.subscriptionStatus === 'active' || t.subscriptionStatus === 'trial'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            <option value="active">Active (Paid)</option>
                            <option value="trial">Trial Access</option>
                            <option value="suspended">Suspended Access</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          isOwner ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isOwner ? 'SuperAdmin' : 'Subscriber'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isOwner && (
                          <div className="inline-flex items-center gap-1.5">
                            {t.subscriptionStatus === 'active' || t.subscriptionStatus === 'trial' ? (
                              <button
                                onClick={() => handleUpdateSubscription(t.id, t.subscriptionPlan, 'suspended')}
                                disabled={updatingId === t.id}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-semibold text-[11px] border border-slate-200 transition-colors"
                              >
                                Suspend Access
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpdateSubscription(t.id, t.subscriptionPlan, 'active')}
                                disabled={updatingId === t.id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Company Modal */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Onboard New Business Client</h3>
                  <p className="text-[11px] text-slate-500">Provision a new company workspace under your SaaS</p>
                </div>
              </div>
              <button
                onClick={() => setIsOnboardModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                  Company / Trade Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahavir Freight Logistics"
                  value={newBizName}
                  onChange={(e) => setNewBizName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Company Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="billing@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    WhatsApp Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98201 23456"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Industry Type
                  </label>
                  <select
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                  >
                    <option value="transport">Transport & Fleet Logistics</option>
                    <option value="agency">Digital & Creative Agency</option>
                    <option value="freelancer">Freelancer / Developer</option>
                    <option value="consultant">Consultant / Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                    Initial Plan Tier
                  </label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-indigo-700"
                  >
                    <option value="trial_15_days">15-Day Free Trial (₹0)</option>
                    <option value="starter_299">Starter (₹299/mo)</option>
                    <option value="pro_499">Pro Growth (₹499/mo)</option>
                  </select>
                </div>

              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                  Default Business UPI ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="company@okhdfcbank"
                  value={newUpiId}
                  onChange={(e) => setNewUpiId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
