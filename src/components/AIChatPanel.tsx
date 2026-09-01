import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  User,
  Send,
  X,
  Plus,
  RefreshCw,
  FileText,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Download,
  ExternalLink,
  ChevronRight,
  Loader2,
  Trash2,
  CreditCard,
  Building,
  ArrowRight,
  Lock,
  LogIn,
} from 'lucide-react';
import {
  sendAIChatMessage,
  fetchAIConversations,
  fetchAIConversationDetail,
  deleteAIConversation,
  fetchAISuggestions,
} from '../lib/api.ts';
import { UserProfile } from '../lib/types.ts';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  isDemoUser?: boolean;
  onOpenLoginModal?: () => void;
  onOpenUpgradeModal?: () => void;
  onViewInvoice?: (invoiceId: number) => void;
  onOpenWhatsAppModal?: (invoice: any) => void;
}

interface MessageItem {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  toolsUsed?: Array<{ name: string; args: any; result: any }>;
  structuredData?: any;
  requiresConfirmation?: boolean;
  confirmationPayload?: any;
  createdAt: string;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  isOpen,
  onClose,
  currentUser,
  isDemoUser,
  onOpenLoginModal,
  onOpenUpgradeModal,
  onViewInvoice,
  onOpenWhatsAppModal,
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [pastConversations, setPastConversations] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Show me unpaid invoices from last month',
    'Create an invoice for ABC Traders for ₹50,000',
    'What is our total collection this month?',
    'Which clients have high payment delay risk?',
  ]);
  const [activeToolName, setActiveToolName] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check if visitor is unauthenticated or in Demo Workspace
  const isDemo = isDemoUser || !currentUser || currentUser.uid === 'demo-business-owner-101';

  // Check if user has Pro plan access (only for real authenticated accounts)
  const isPro =
    !isDemo &&
    (currentUser?.subscriptionPlan === 'pro_499' ||
      currentUser?.role === 'superadmin' ||
      (currentUser?.subscriptionPlan === 'trial_15_days' && currentUser?.subscriptionStatus === 'trial'));

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, activeToolName]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      loadConversations();
      loadSuggestions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    try {
      const res = await fetchAISuggestions();
      if (res.success && res.suggestions) {
        setSuggestions(res.suggestions);
      }
    } catch (err) {
      console.warn('Could not load suggestions:', err);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await fetchAIConversations();
      if (res.success && res.conversations) {
        setPastConversations(res.conversations);
      }
    } catch (err) {
      console.warn('Could not load conversations:', err);
    }
  };

  const selectConversation = async (cId: string) => {
    setIsLoading(true);
    setShowHistory(false);
    try {
      const res = await fetchAIConversationDetail(cId);
      if (res.success && res.messages) {
        setConversationId(cId);
        setMessages(
          res.messages.map((m: any) => ({
            id: m.id || Math.random().toString(),
            role: m.role === 'model' ? 'model' : 'user',
            content: m.content || '',
            toolsUsed: m.toolCalls,
            structuredData: m.structuredData,
            requiresConfirmation: m.requiresConfirmation,
            confirmationPayload: m.confirmationPayload,
            createdAt: m.createdAt || new Date().toISOString(),
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setConversationId('');
    setMessages([]);
    setShowHistory(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDeleteConversation = async (e: React.MouseEvent, cId: string) => {
    e.stopPropagation();
    try {
      await deleteAIConversation(cId);
      setPastConversations((prev) => prev.filter((c) => c.conversationId !== cId));
      if (conversationId === cId) {
        startNewConversation();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string, confirmationPayload?: any) => {
    const text = (textToSend || inputMessage).trim();
    if (!text && !confirmationPayload) return;

    if (isDemo) {
      if (onOpenLoginModal) onOpenLoginModal();
      return;
    }

    if (!isPro) {
      if (onOpenUpgradeModal) onOpenUpgradeModal();
      return;
    }

    const userMsgObj: MessageItem = {
      id: Math.random().toString(),
      role: 'user',
      content: confirmationPayload ? `Confirmed: Proceed with ${confirmationPayload.actionType || 'action'}` : text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsgObj]);
    setInputMessage('');
    setIsLoading(true);
    setActiveToolName('Analyzing request & selecting tools...');

    try {
      const res = await sendAIChatMessage({
        message: text,
        conversationId: conversationId || undefined,
        confirmationPayload,
      });

      if (res.success) {
        setConversationId(res.conversationId);

        const aiMsgObj: MessageItem = {
          id: Math.random().toString(),
          role: 'model',
          content: res.response,
          toolsUsed: res.toolsUsed,
          structuredData: res.structuredData,
          requiresConfirmation: res.requiresConfirmation,
          confirmationPayload: res.confirmationPayload,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMsgObj]);
        loadConversations();
      }
    } catch (err: any) {
      console.error('AI error:', err);
      const errMsgObj: MessageItem = {
        id: Math.random().toString(),
        role: 'model',
        content:
          err.status === 403
            ? `⚠️ ${err.message || 'KwikBill AI Agent requires an active signed-in account on the Pro Plan.'}`
            : `⚠️ ${err.message || 'Error executing AI request. Please try again.'}`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsgObj]);
    } finally {
      setIsLoading(false);
      setActiveToolName(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between border-b border-indigo-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300 shadow-inner">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-base text-white">KwikBill AI Assistant</h2>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 rounded-full">
                    PRO 2.0
                  </span>
                </div>
                <p className="text-xs text-indigo-200/80">Natural language billing & PostgreSQL automation</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHistory(!showHistory)}
                title="Conversation History"
                className={`p-2 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors ${
                  showHistory ? 'bg-white/20 text-white' : ''
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={startNewConversation}
                title="Start New Chat"
                className="p-2 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* History Drawer */}
          {showHistory && (
            <div className="bg-slate-100 dark:bg-slate-950 p-4 border-b border-slate-200 dark:border-slate-800 max-h-60 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Previous Chats</span>
                <button
                  onClick={startNewConversation}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New Chat
                </button>
              </div>
              {pastConversations.length === 0 ? (
                <div className="text-xs text-slate-400 py-3 text-center">No previous conversations found</div>
              ) : (
                <div className="space-y-1.5">
                  {pastConversations.map((c) => (
                    <div
                      key={c.conversationId}
                      onClick={() => selectConversation(c.conversationId)}
                      className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        conversationId === c.conversationId
                          ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200 dark:border-indigo-800'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{c.title || 'Untitled conversation'}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteConversation(e, c.conversationId)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sign In Banner for Demo/Unauthenticated Users */}
          {isDemo ? (
            <div className="p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border-b border-indigo-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sign In Required</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    KwikBill AI Agent is available only for registered accounts. Please sign in to use AI.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenLoginModal}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1.5 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
            </div>
          ) : !isPro ? (
            /* Upgrade Banner for Non-Pro Authenticated Users */
            <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pro Plan Required</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Upgrade to Pro Growth (₹499/mo) to execute natural language billing actions.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenUpgradeModal}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow hover:opacity-90 transition-opacity flex items-center gap-1 shrink-0"
              >
                Upgrade <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ) : null}

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {messages.length === 0 && (
              <div className="py-8 px-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-200 dark:border-indigo-800 shadow-sm">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  How can I help you today?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                  Ask me to query invoices, create drafts, calculate GST, record payments, generate PDFs, or dispatch WhatsApp reminders.
                </p>

                {/* Suggestions Grid */}
                <div className="space-y-2 max-w-md mx-auto text-left">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    Try asking:
                  </div>
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s)}
                      className="w-full text-left p-2.5 text-xs bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <span>{s}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Render Messages */}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Message Content with Markdown formatting */}
                  <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                    {m.content}
                  </div>

                  {/* Interactive Confirmation Card */}
                  {m.requiresConfirmation && m.confirmationPayload && (
                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-xl space-y-2.5">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Action Confirmation Required</span>
                      </div>

                      {m.confirmationPayload.preview && (
                        <div className="bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900 text-[11px] space-y-1">
                          {m.confirmationPayload.preview.clientName && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Party / Client:</span>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {m.confirmationPayload.preview.clientName}
                              </span>
                            </div>
                          )}
                          {m.confirmationPayload.preview.subtotal && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">Subtotal:</span>
                              <span>{m.confirmationPayload.preview.subtotal}</span>
                            </div>
                          )}
                          {m.confirmationPayload.preview.taxAmount && (
                            <div className="flex justify-between">
                              <span className="text-slate-500">GST ({m.confirmationPayload.preview.taxRate}):</span>
                              <span>{m.confirmationPayload.preview.taxAmount}</span>
                            </div>
                          )}
                          {m.confirmationPayload.preview.totalAmount && (
                            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1 font-bold text-indigo-600 dark:text-indigo-400">
                              <span>Total Amount:</span>
                              <span>{m.confirmationPayload.preview.totalAmount}</span>
                            </div>
                          )}
                          {m.confirmationPayload.preview.paymentAmount && (
                            <div className="flex justify-between font-bold text-emerald-600">
                              <span>Payment Recorded:</span>
                              <span>{m.confirmationPayload.preview.paymentAmount}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleSendMessage(undefined, m.confirmationPayload)}
                          className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirm & Proceed
                        </button>
                        <button
                          onClick={() => handleSendMessage('Cancel this action')}
                          className="py-1.5 px-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Structured Invoice Result Cards */}
                  {m.structuredData?.invoices && Array.isArray(m.structuredData.invoices) && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Invoices Found ({m.structuredData.invoices.length}):
                      </div>
                      {m.structuredData.invoices.map((inv: any) => (
                        <div
                          key={inv.id}
                          className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-indigo-400 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</span>
                              <span
                                className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                                  inv.status === 'paid'
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : inv.status === 'overdue'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {inv.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {inv.clientName} • Due: {inv.dueDate}
                            </div>
                          </div>

                          <div className="text-right flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-xs">{inv.totalAmount}</span>
                            {onViewInvoice && (
                              <button
                                onClick={() => onViewInvoice(inv.id)}
                                className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
                                title="View invoice"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Structured PDF Generation Result */}
                  {m.structuredData?.pdfUrl && (
                    <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                        <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-xs">PDF Ready</div>
                          <div className="text-[10px] text-emerald-700 dark:text-emerald-300">
                            Invoice {m.structuredData.invoiceNumber}
                          </div>
                        </div>
                      </div>
                      <a
                        href={m.structuredData.pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" /> Download PDF
                      </a>
                    </div>
                  )}

                  {/* Structured WhatsApp Send Result */}
                  {m.structuredData?.whatsappUrl && (
                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/40 border border-green-300 dark:border-green-700/60 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-900 dark:text-green-200">
                        <MessageSquare className="w-5 h-5 text-green-600 shrink-0" />
                        <div>
                          <div className="font-bold text-xs">WhatsApp Dispatch</div>
                          <div className="text-[10px] text-green-700 dark:text-green-300">
                            {m.structuredData.directApiSent ? 'Sent via Meta Cloud API' : 'Deep Link Ready'}
                          </div>
                        </div>
                      </div>
                      <a
                        href={m.structuredData.whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs"
                      >
                        Open WhatsApp <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Live Tool Execution Spinner */}
            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2.5 text-xs text-indigo-600 dark:text-indigo-400">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="font-medium">{activeToolName || 'Thinking...'}</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips */}
          {messages.length > 0 && !isLoading && (
            <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleSendMessage('Add 18% GST to this invoice')}
                className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors"
              >
                + Add 18% GST
              </button>
              <button
                onClick={() => handleSendMessage('Generate PDF')}
                className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors"
              >
                📄 Generate PDF
              </button>
              <button
                onClick={() => handleSendMessage('Send it through WhatsApp')}
                className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors"
              >
                💬 Send WhatsApp
              </button>
            </div>
          )}

          {/* Input Box */}
          <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="relative flex items-end gap-2 bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isDemo
                    ? 'Please sign in to use KwikBill AI Agent...'
                    : isPro
                    ? 'Ask AI or type billing instructions (e.g. "Create invoice for ABC Traders ₹50,000")...'
                    : 'Upgrade to Pro to use AI Agent...'
                }
                rows={1}
                disabled={isDemo || !isPro || isLoading}
                className="flex-1 max-h-32 min-h-[38px] p-2 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={isDemo || !inputMessage.trim() || isLoading || !isPro}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl shadow transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-slate-400">
              <span>Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">Enter</kbd> to send</span>
              <span>Rate limit: 10 req/min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
