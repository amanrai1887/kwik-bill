import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { LandingPage } from './landing/LandingPage.tsx';
import { Sidebar, AppTab } from './components/Sidebar.tsx';
import { AppHeader } from './components/AppHeader.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { InvoicesView } from './components/InvoicesView.tsx';
import { ClientsView } from './components/ClientsView.tsx';
import { RemindersLogView } from './components/RemindersLogView.tsx';
import { MonthlyReportsView } from './components/MonthlyReportsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { AdminTenantsView } from './components/AdminTenantsView.tsx';
import { RecurringInvoicesView } from './components/RecurringInvoicesView.tsx';
import { InvoiceCreatorModal } from './components/InvoiceCreatorModal.tsx';
import { InvoiceDetailModal } from './components/InvoiceDetailModal.tsx';
import { WhatsAppModal } from './components/WhatsAppModal.tsx';
import { PaymentRecordModal } from './components/PaymentRecordModal.tsx';
import { ClientModal } from './components/ClientModal.tsx';
import { PlanSelectionModal } from './components/PlanSelectionModal.tsx';
import { ShortcutsModal } from './components/ShortcutsModal.tsx';
import { SkeletonCard, SkeletonTable } from './components/SkeletonLoader.tsx';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.ts';

import { ToastProvider, toast } from './context/ToastContext.tsx';

import {
  fetchProfile,
  updateProfile,
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
  toggleClientStatus,
  fetchInvoices,
  createInvoice,
  deleteInvoice,
  createRecurringProfile,
  recordPayment,
  sendWhatsAppReminder,
  fetchReminderLogs,
  fetchAnalytics,
} from './lib/api.ts';
import { AnalyticsData, Client, Invoice, ReminderLog, UserProfile } from './lib/types.ts';
import { getPlanLimits, isSuperAdminUser } from './lib/planConfig.ts';

import { LoginModal } from './components/LoginModal.tsx';
import { PublicInvoicePayView } from './components/PublicInvoicePayView.tsx';
import { AccountSuspendedView } from './components/AccountSuspendedView.tsx';
import { TrialExpiredView } from './components/TrialExpiredView.tsx';

function AppContent() {
  const { user, loading } = useAuth();

  // Check if current browser URL is a public client payment link (/pay/:id)
  const isPayRoute = window.location.pathname.startsWith('/pay/');
  if (isPayRoute) {
    return <PublicInvoicePayView />;
  }

  // App view state: initialize from localStorage or check user session
  const [currentView, setCurrentView] = useState<'landing' | 'app'>(() => {
    const saved = localStorage.getItem('kwikbill_current_view');
    if (saved === 'app' || saved === 'landing') return saved;
    return 'landing';
  });

  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    const saved = localStorage.getItem('kwikbill_active_tab');
    if (saved) return saved as AppTab;
    return 'dashboard';
  });

  // Modal States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<Invoice | null>(null);
  const [selectedInvoiceForWhatsApp, setSelectedInvoiceForWhatsApp] = useState<Invoice | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Global Desktop Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onNewInvoice: () => {
      if (currentView === 'app') setIsCreateInvoiceOpen(true);
    },
    onNavigate: (tab: string) => {
      if (currentView === 'app') setActiveTab(tab as AppTab);
    },
    onSearchFocus: () => {
      const searchInput = document.getElementById('invoices-search-input');
      if (searchInput) {
        if (activeTab !== 'invoices') setActiveTab('invoices');
        setTimeout(() => searchInput.focus(), 50);
      }
    },
    onToggleShortcutsModal: () => setIsShortcutsModalOpen((prev) => !prev),
    onCloseModals: () => {
      setIsCreateInvoiceOpen(false);
      setIsClientModalOpen(false);
      setIsShortcutsModalOpen(false);
      setSelectedInvoiceForDetail(null);
      setSelectedInvoiceForWhatsApp(null);
      setSelectedInvoiceForPayment(null);
      setIsLoginModalOpen(false);
      setIsPlanModalOpen(false);
    },
  });

  // Persist view state in localStorage
  useEffect(() => {
    localStorage.setItem('kwikbill_current_view', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('kwikbill_active_tab', activeTab);
  }, [activeTab]);

  const prevUserRef = useRef(user);

  // Sync view state on login / logout transitions
  useEffect(() => {
    if (prevUserRef.current && !user) {
      // User just logged out: redirect to landing and reset state
      setCurrentView('landing');
      setProfile(null);
      setClients([]);
      setInvoices([]);
      setAnalytics(null);
      setReminderLogs([]);
      localStorage.removeItem('kwikbill_current_view');
      localStorage.removeItem('kwikbill_active_tab');
    } else if (!prevUserRef.current && user) {
      // User just logged in: navigate to workspace
      setCurrentView('app');
    }
    prevUserRef.current = user;
  }, [user]);

  // Application Data States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load all data from PostgreSQL via backend API
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileRes, clientsRes, invoicesRes, analyticsRes, logsRes] = await Promise.all([
        fetchProfile().catch((err) => {
          if (err?.code === 'ACCOUNT_SUSPENDED' || err?.status === 403) {
            setProfile((prev) => prev ? { ...prev, subscriptionStatus: 'suspended' } : null);
          }
          return null;
        }),
        fetchClients().catch(() => ({ clients: [] })),
        fetchInvoices().catch(() => ({ invoices: [] })),
        fetchAnalytics().catch(() => null),
        fetchReminderLogs().catch(() => ({ logs: [] })),
      ]);

      const loadedProfile = profileRes?.user || profileRes?.data?.user || (profileRes?.id ? profileRes : null);
      if (loadedProfile) setProfile(loadedProfile);

      if (Array.isArray(clientsRes?.clients)) setClients(clientsRes.clients);
      else if (Array.isArray(clientsRes)) setClients(clientsRes);

      if (Array.isArray(invoicesRes?.invoices)) setInvoices(invoicesRes.invoices);
      else if (Array.isArray(invoicesRes)) setInvoices(invoicesRes);

      if (analyticsRes) setAnalytics(analyticsRes);
      if (Array.isArray(logsRes?.logs)) setReminderLogs(logsRes.logs);
      else if (Array.isArray(logsRes)) setReminderLogs(logsRes);

      return loadedProfile;
    } catch (err) {
      console.error('Error loading initial data', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'app') {
      loadAllData();
    }
  }, [loadAllData, user, currentView]);

  // Re-verify profile when tab comes into focus
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchProfile()
          .then((res: any) => {
            const fresh = res?.user || res?.data?.user || (res?.id ? res : null);
            if (fresh) setProfile(fresh);
          })
          .catch((err) => {
            if (err?.code === 'ACCOUNT_SUSPENDED' || err?.status === 403) {
              setProfile((prev) => prev ? { ...prev, subscriptionStatus: 'suspended' } : null);
            }
          });
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  // When a user logs in:
  // If they are superadmin -> direct to Admin Console
  // If they already have an active subscription or trial -> direct to Dashboard
  // If brand new user with no plan selected -> prompt Plan Selection Modal
  const handlePostAuthSuccess = useCallback(async () => {
    const freshProfile = await loadAllData();
    if (!freshProfile) return;

    const isSuperAdmin = isSuperAdminUser(freshProfile);

    if (isSuperAdmin) {
      setActiveTab('admin');
      setCurrentView('app');
      return;
    }

    const hasActiveSubscription =
      (freshProfile.subscriptionStatus === 'active' || freshProfile.subscriptionStatus === 'trial') &&
      freshProfile.subscriptionPlan;

    if (hasActiveSubscription) {
      setCurrentView('app');
      setActiveTab('dashboard');
    } else {
      // Show plan selection popup after successful login for new user
      setIsPlanModalOpen(true);
    }
  }, [loadAllData]);

  // If superadmin logs in, lock view to Master Admin Console
  useEffect(() => {
    const isSuperAdmin = isSuperAdminUser(profile) || isSuperAdminUser(user);

    if (isSuperAdmin && activeTab !== 'admin') {
      setActiveTab('admin');
    }
  }, [profile, user, activeTab]);




  // Handler: Create Invoice & optional Recurring schedule
  const handleCreateInvoice = async (invoiceData: any) => {
    try {
      await createInvoice(invoiceData);

      const planLimits = getPlanLimits(profile);
      const isPro = planLimits.canUseRecurringBilling;

      // If user checked "Also Save as Automated Recurring Schedule"
      if (invoiceData.isRecurring && isPro) {
        try {
          await createRecurringProfile({
            clientId: invoiceData.clientId,
            title: `Recurring: ${invoiceData.items[0]?.description || 'Retainer Contract'}`,
            frequency: invoiceData.recurringFrequency || 'monthly',
            startDate: invoiceData.issueDate || new Date().toISOString().split('T')[0],
            autoSendWhatsApp: invoiceData.autoSendWhatsApp ?? true,
            currency: 'INR',
            subtotal: invoiceData.subtotal,
            taxRate: invoiceData.taxRate,
            taxAmount: invoiceData.taxAmount,
            tdsRate: invoiceData.tdsRate,
            tdsAmount: invoiceData.tdsAmount,
            discountAmount: invoiceData.discountAmount,
            totalAmount: invoiceData.totalAmount,
            items: invoiceData.items,
            industryDetails: invoiceData.industryDetails,
            notes: invoiceData.notes,
            terms: invoiceData.terms,
          });
          toast.success('Invoice & automated recurring schedule created successfully!', 'Schedule Saved');
        } catch (err: any) {
          console.error('Failed to create recurring profile:', err);
          toast.error(err.message || 'Invoice created, but recurring setup failed', 'Recurring Error');
        }
      } else {
        toast.success(`Created invoice #${invoiceData.invoiceNumber} successfully!`, 'Invoice Saved');
      }

      await loadAllData();
      setIsCreateInvoiceOpen(false);
      if (invoiceData.isRecurring && isPro) {
        setActiveTab('recurring');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create invoice', 'Creation Error');
    }
  };


  // Handler: Delete Invoice
  const handleDeleteInvoice = async (invoiceId: number) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    await deleteInvoice(invoiceId);
    await loadAllData();
  };

  // Handler: Record Settlement
  const handleRecordPayment = async (paymentData: any) => {
    await recordPayment(paymentData);
    await loadAllData();
    setSelectedInvoiceForPayment(null);
    if (selectedInvoiceForDetail && selectedInvoiceForDetail.id === paymentData.invoiceId) {
      const updatedInv = invoices.find((i) => i.id === paymentData.invoiceId);
      if (updatedInv) setSelectedInvoiceForDetail(updatedInv);
    }
  };

  // Handler: Send WhatsApp Reminder
  const handleSendWhatsAppReminder = async (reminderData: any) => {
    await sendWhatsAppReminder(reminderData);
    await loadAllData();
  };

  // Handler: Save Client (Create or Update)
  const handleSaveClient = async (clientData: any) => {
    try {
      if (clientData.id) {
        await updateClient(clientData.id, clientData);
        toast.success(`Updated party "${clientData.name}" successfully.`);
      } else {
        await createClient(clientData);
        toast.success(`Added new party "${clientData.name}" to ledger.`);
      }
      await loadAllData();
      setIsClientModalOpen(false);
      setClientToEdit(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save party');
    }
  };

  // Handler: Toggle Client Active/Disabled Status
  const handleToggleClientStatus = async (clientId: number, currentStatus: boolean) => {
    const actionText = currentStatus ? 'disable' : 'enable';
    try {
      await toggleClientStatus(clientId, !currentStatus);
      await loadAllData();
      toast.success(
        currentStatus
          ? 'Client disabled. They will be excluded from new invoices and risk scoring.'
          : 'Client re-enabled and active for invoicing.',
        currentStatus ? 'Client Disabled' : 'Client Enabled'
      );
    } catch (err: any) {
      toast.error(err.message || `Failed to ${actionText} client`);
    }
  };

  // Handler: Delete Client
  const handleDeleteClient = async (clientId: number) => {
    try {
      await deleteClient(clientId);
      await loadAllData();
      toast.success('Client and associated records removed successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete client');
    }
  };

  // Handler: Update Business Profile
  const handleUpdateProfile = async (profileData: any) => {
    try {
      const updated = await updateProfile(profileData);
      setProfile(updated);
      await loadAllData();
      toast.success('Business settings & compliance profile updated successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update business settings');
    }
  };

  // Handler: Select Plan / Start Trial
  const handleSelectPlan = async (plan: 'trial_15_days' | 'starter_299' | 'pro_499') => {
    const isTrial = plan === 'trial_15_days';
    const trialDays = 15;
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();

    await updateProfile({
      subscriptionPlan: plan,
      subscriptionStatus: isTrial ? 'trial' : 'active',
      ...(isTrial ? { trialEndsAt } : {}),
    });
    await loadAllData();
    setCurrentView('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on Landing Page view
  if (currentView === 'landing') {
    return (
      <>
        <LandingPage
          onLaunchDemo={() => {
            setCurrentView('app');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectPricing={() => {
            if (user) {
              handlePostAuthSuccess();
            } else {
              setIsLoginModalOpen(true);
            }
          }}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => {
            handlePostAuthSuccess();
          }}
        />
        <PlanSelectionModal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          onSelectPlan={handleSelectPlan}
        />
      </>
    );
  }




  const isSuperAdmin = isSuperAdminUser(profile) || isSuperAdminUser(user);
  const isSuspended =
    !isSuperAdmin &&
    Boolean(profile?.subscriptionStatus && ['suspended', 'inactive', 'cancelled'].includes(profile.subscriptionStatus));

  const isTrial = profile?.subscriptionStatus === 'trial' || profile?.subscriptionPlan === 'trial_15_days';
  const isTrialEnded =
    !isSuperAdmin &&
    profile?.subscriptionStatus !== 'active' &&
    (profile?.subscriptionStatus === 'expired' ||
      Boolean(isTrial && profile?.trialEndsAt && new Date(profile.trialEndsAt).getTime() <= Date.now()));

  if (isSuspended) {
    return (
      <>
        <AccountSuspendedView
          profile={profile}
          onOpenPlanRequest={() => setIsPlanModalOpen(true)}
          onViewLanding={() => setCurrentView('landing')}
        />
        <PlanSelectionModal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          onSelectPlan={handleSelectPlan}
        />
      </>
    );
  }

  if (isTrialEnded) {
    return (
      <>
        <TrialExpiredView
          profile={profile}
          onOpenPlanRequest={() => setIsPlanModalOpen(true)}
          onViewLanding={() => setCurrentView('landing')}
        />
        <PlanSelectionModal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          onSelectPlan={handleSelectPlan}
        />
      </>
    );
  }

  const requireAuthAction = (actionName: string, actionFn?: () => void) => {
    if (!user) {
      toast.info(`Please sign in or register to ${actionName}. Demo workspace is read-only.`, 'Sign In Required');
      setIsLoginModalOpen(true);
      return;
    }
    if (actionFn) actionFn();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onCreateInvoice={() => requireAuthAction('create new invoices', () => setIsCreateInvoiceOpen(true))}
          onViewLanding={() => setCurrentView('landing')}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          profile={profile}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-white dark:bg-slate-900 z-10 shadow-2xl h-full">
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              onCreateInvoice={() => {
                requireAuthAction('create new invoices', () => {
                  setIsCreateInvoiceOpen(true);
                  setIsMobileMenuOpen(false);
                });
              }}
              onViewLanding={() => {
                setCurrentView('landing');
                setIsMobileMenuOpen(false);
              }}
              onOpenShortcuts={() => {
                setIsShortcutsModalOpen(true);
                setIsMobileMenuOpen(false);
              }}
              profile={profile}
            />
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Demo Workspace Visitor Notice Banner */}
        {!user && (
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white px-4 py-2 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs border-b border-indigo-700/50 shadow-xs z-40">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-[10px] font-black uppercase tracking-wider">
                Live Demo Mode
              </span>
              <span>You are previewing sample transport data in read-only mode.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-1 rounded-lg bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 transition-colors shadow-xs cursor-pointer"
              >
                Sign In / Register Free
              </button>
              <button
                onClick={() => setCurrentView('landing')}
                className="text-indigo-200 hover:text-white underline cursor-pointer"
              >
                Exit Demo
              </button>
            </div>
          </div>
        )}

        <AppHeader
          activeTab={activeTab}
          profile={profile}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onCreateInvoice={() => requireAuthAction('create new invoices', () => setIsCreateInvoiceOpen(true))}
          onViewLanding={() => setCurrentView('landing')}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenPlanModal={() => setIsPlanModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isLoading ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <SkeletonTable rows={6} />
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  analytics={analytics}
                  invoices={invoices}
                  profile={profile}
                  onCreateInvoice={() => requireAuthAction('create new invoices', () => setIsCreateInvoiceOpen(true))}
                  onOpenInvoice={(inv) => setSelectedInvoiceForDetail(inv)}
                  onSendReminder={(inv) => requireAuthAction('send live WhatsApp payment reminders', () => setSelectedInvoiceForWhatsApp(inv))}
                  onViewAllInvoices={() => setActiveTab('invoices')}
                  onOpenPlanModal={() => setIsPlanModalOpen(true)}
                />
              )}

              {activeTab === 'invoices' && (
                <InvoicesView
                  invoices={invoices}
                  onCreateInvoice={() => requireAuthAction('create new invoices', () => setIsCreateInvoiceOpen(true))}
                  onOpenInvoice={(inv) => setSelectedInvoiceForDetail(inv)}
                  onSendReminder={(inv) => requireAuthAction('send live WhatsApp payment reminders', () => setSelectedInvoiceForWhatsApp(inv))}
                  onRecordPayment={(inv) => requireAuthAction('record invoice payments', () => setSelectedInvoiceForPayment(inv))}
                  onDeleteInvoice={(id) => requireAuthAction('delete invoices', () => handleDeleteInvoice(id))}
                />
              )}

              {activeTab === 'recurring' && (
                <RecurringInvoicesView
                  clients={clients}
                  profile={profile}
                  onUpgrade={() => setIsPlanModalOpen(true)}
                  onCreateRecurring={() => requireAuthAction('create automated recurring schedules', () => setIsCreateInvoiceOpen(true))}
                />
              )}

              {activeTab === 'clients' && (
                <ClientsView
                  clients={clients}
                  onAddClient={() => {
                    requireAuthAction('add new clients to directory', () => {
                      setClientToEdit(null);
                      setIsClientModalOpen(true);
                    });
                  }}
                  onEditClient={(client) => {
                    requireAuthAction('edit client details', () => {
                      setClientToEdit(client);
                      setIsClientModalOpen(true);
                    });
                  }}
                  onToggleClientStatus={(id, currentStatus) => {
                    requireAuthAction('modify client status', () => handleToggleClientStatus(id, currentStatus));
                  }}
                  onDeleteClient={(id) => {
                    requireAuthAction('delete clients', () => handleDeleteClient(id));
                  }}
                  onCreateInvoiceForClient={(client) => {
                    requireAuthAction('create invoices for clients', () => setIsCreateInvoiceOpen(true));
                  }}
                />
              )}

              {activeTab === 'reminders' && (
                <RemindersLogView logs={reminderLogs} onRefresh={loadAllData} />
              )}

              {activeTab === 'reports' && (
                <MonthlyReportsView
                  analytics={analytics}
                  invoices={invoices}
                  profile={profile}
                  onUpgrade={() => setIsPlanModalOpen(true)}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsView
                  profile={profile}
                  onUpdateProfile={(data) => {
                    requireAuthAction('save business profile settings', () => handleUpdateProfile(data));
                  }}
                />
              )}

              {activeTab === 'admin' && (
                <AdminTenantsView />
              )}
            </>
          )}
        </main>
      </div>

      {/* MODALS */}
      {/* 0. Standalone Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          loadAllData();
        }}
      />

      {/* 1. Create Invoice Modal */}
      <InvoiceCreatorModal
        isOpen={isCreateInvoiceOpen}
        onClose={() => setIsCreateInvoiceOpen(false)}
        clients={clients}
        profile={profile}
        onSubmit={handleCreateInvoice}
        onQuickAddClient={() => {
          setClientToEdit(null);
          setIsClientModalOpen(true);
        }}
      />

      {/* 2. Invoice Detail / Print Modal */}
      <InvoiceDetailModal
        isOpen={!!selectedInvoiceForDetail}
        onClose={() => setSelectedInvoiceForDetail(null)}
        invoice={selectedInvoiceForDetail}
        profile={profile}
        onSendReminder={(inv) => {
          setSelectedInvoiceForDetail(null);
          setSelectedInvoiceForWhatsApp(inv);
        }}
        onRecordPayment={(inv) => {
          setSelectedInvoiceForDetail(null);
          setSelectedInvoiceForPayment(inv);
        }}
      />

      {/* 3. WhatsApp 1-Click Reminder Modal */}
      <WhatsAppModal
        isOpen={!!selectedInvoiceForWhatsApp}
        onClose={() => setSelectedInvoiceForWhatsApp(null)}
        invoice={selectedInvoiceForWhatsApp}
        profile={profile}
        onSendSuccess={handleSendWhatsAppReminder}
      />

      {/* 4. Payment Settlement Modal */}
      <PaymentRecordModal
        isOpen={!!selectedInvoiceForPayment}
        onClose={() => setSelectedInvoiceForPayment(null)}
        invoice={selectedInvoiceForPayment}
        onSubmit={handleRecordPayment}
      />

      {/* 5. Client Add/Edit Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setClientToEdit(null);
        }}
        clientToEdit={clientToEdit}
        onSubmit={handleSaveClient}
      />

      {/* 6. Keyboard Shortcuts Cheat-Sheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

