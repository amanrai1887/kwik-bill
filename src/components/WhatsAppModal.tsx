import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  AlertTriangle,
  QrCode,
  Zap
} from 'lucide-react';
import { Invoice, UserProfile } from '../lib/types.ts';
import { getPlanLimits } from '../lib/planConfig.ts';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  profile: UserProfile | null;
  onSendSuccess: (data: any) => Promise<void>;
}

type TemplateType = 'polite' | 'standard' | 'urgent' | 'overdue';

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  invoice,
  profile,
  onSendSuccess,
}) => {
  if (!isOpen || !invoice) return null;

  const planLimits = getPlanLimits(profile);
  const isPro = planLimits.canUseEscalationTemplates;
  const [templateType, setTemplateType] = useState<TemplateType>('standard');
  const [copied, setCopied] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const clientName = invoice.client?.name || 'Valued Customer';
  const companyName = invoice.client?.companyName || '';
  const clientPhone = (invoice.client?.phone || '').replace(/\D/g, '');
  const invoiceNumber = invoice.invoiceNumber;
  const balanceDue = Math.max(0, (parseFloat(invoice.totalAmount) || 0) - (parseFloat(invoice.paidAmount) || 0));
  const amountFormatted = `₹${balanceDue.toLocaleString('en-IN')}`;
  const dueDate = invoice.dueDate;
  const upiId = profile?.upiId || 'speedytrans@okaxis';
  const businessName = profile?.businessName || 'KwikBill Pro';

  // UPI deep link
  const upiPayLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${balanceDue}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoiceNumber}`)}`;

  // 4 Escalation Templates
  const getMessageTemplate = (type: TemplateType) => {
    switch (type) {
      case 'polite':
        return `Hello *${clientName}* (${companyName || 'Business Partner'}),\n\nGreetings from *${businessName}*! ✨\n\nThis is a friendly reminder that Invoice *#${invoiceNumber}* for *${amountFormatted}* is scheduled for payment on *${dueDate}*.\n\n📱 *Instant UPI Payment Link:*\n${upiPayLink}\n\nThank you for your continued partnership!`;

      case 'standard':
        return `Dear *${clientName}*,\n\nInvoice *#${invoiceNumber}* for *${amountFormatted}* is due for settlement on *${dueDate}*.\n\nKindly process the payment to ensure uninterrupted service delivery.\n\n💳 *Direct UPI ID:* \`${upiId}\`\n🔗 *Pay Instantly:* ${upiPayLink}\n\nPlease share the payment screenshot once transferred.\n\nRegards,\n*${businessName}*`;

      case 'urgent':
        return `⚠️ *URGENT PAYMENT REMINDER*\n\nDear *${clientName}*,\n\nWe noticed that payment for Invoice *#${invoiceNumber}* amounting to *${amountFormatted}* is currently overdue (Due date: *${dueDate}*).\n\nPlease settle this outstanding balance today to prevent any delay in ongoing shipments/services.\n\n⚡ *Instant UPI Settlement:* ${upiPayLink}\n\nThank you,\n*${businessName}*`;

      case 'overdue':
        return `🚨 *FINAL NOTICE: OVERDUE SETTLEMENT*\n\nAttention: *${clientName}* / *${companyName || 'Accounts Team'}*,\n\nDespite previous reminders, Invoice *#${invoiceNumber}* for *${amountFormatted}* remains unpaid.\n\nKindly clear the outstanding dues immediately via UPI or bank transfer to avoid late fee penalties or service hold.\n\n📌 *UPI ID:* \`${upiId}\`\n🔗 *Click to Pay:* ${upiPayLink}\n\n*${businessName} Accounts Department*`;
    }
  };

  const currentMessage = getMessageTemplate(templateType);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const [sendMethod, setSendMethod] = useState<'direct' | 'wame'>('direct');
  const [directSuccess, setDirectSuccess] = useState<string | null>(null);

  const handleSendReminder = async () => {
    setIsLogging(true);
    setDirectSuccess(null);
    try {
      let phoneWithCountry = clientPhone;
      if (phoneWithCountry.length === 10) {
        phoneWithCountry = `91${phoneWithCountry}`;
      }

      // 1. Dispatch reminder through server (handles direct background API or wa.me logging)
      const res: any = await onSendSuccess({
        invoiceId: invoice.id,
        clientId: invoice.clientId,
        templateType,
        messageContent: currentMessage,
        recipientPhone: invoice.client?.phone || '',
        sendMethod,
      });

      if (sendMethod === 'direct') {
        if (res?.directApiSent) {
          setDirectSuccess(`Message successfully delivered directly to +${phoneWithCountry} via Meta Cloud API!`);
        } else {
          setDirectSuccess(`Reminder recorded and logged for +${phoneWithCountry}. (Configure Meta API credentials in Settings for automatic server-side delivery)`);
        }
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        // 2. Open WhatsApp Web or Mobile App via wa.me
        const waUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(currentMessage)}`;
        window.open(waUrl, '_blank');
        onClose();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch reminder');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full my-8 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-emerald-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">WhatsApp Payment Reminder</h2>
              <p className="text-xs text-slate-500">1-Click Direct Automated Send or Manual wa.me</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-whatsapp-modal-btn"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs">
          {/* Target Recipient Info */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Recipient</span>
              <span className="font-bold text-slate-900 text-sm">{clientName}</span>
              <span className="text-slate-500 ml-1.5 font-mono">({invoice.client?.phone})</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Balance Due</span>
              <span className="font-bold text-emerald-600 text-sm font-mono">{amountFormatted}</span>
            </div>
          </div>

          {/* Delivery Method Selection */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
              Sending Mode:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!isPro && !profile?.whatsappPhoneNumberId) {
                    alert('1-Click Direct Meta API background sending is a Pro Plan feature. Upgrade to Pro (₹499/mo) or configure Meta API credentials in Settings.');
                    return;
                  }
                  setSendMethod('direct');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  sendMethod === 'direct'
                    ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>1-Click Direct Send</span>
                  </div>
                  {!isPro && (
                    <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-purple-100 text-purple-700 rounded uppercase">
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Sends in the background instantly via Meta API
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSendMethod('wame')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  sendMethod === 'wame'
                    ? 'bg-indigo-50 border-indigo-600 ring-2 ring-indigo-600/20 text-indigo-900'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Open via wa.me</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Opens WhatsApp Web or Mobile app to review and send
                </p>
              </button>
            </div>
          </div>

          {/* 4 Escalation Tiers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                Select Reminder Escalation Tier:
              </label>
              {!isPro && (
                <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Urgent & Overdue tiers unlocked in PRO
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType('polite')}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  templateType === 'polite'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div>1. Polite</div>
                <span className="text-[10px] font-normal text-slate-500">Upcoming Due</span>
              </button>

              <button
                type="button"
                onClick={() => setTemplateType('standard')}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  templateType === 'standard'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-800 ring-2 ring-indigo-400/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div>2. Standard</div>
                <span className="text-[10px] font-normal text-slate-500">Due Today</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isPro) {
                    alert('Urgent legal escalation template is a Pro Plan feature. Upgrade to Pro (₹499/mo) to unlock.');
                    return;
                  }
                  setTemplateType('urgent');
                }}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  templateType === 'urgent'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-400/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>3. Urgent</span>
                  {!isPro && <span className="text-[8px] bg-purple-100 text-purple-700 px-1 rounded font-bold">PRO</span>}
                </div>
                <span className="text-[10px] font-normal text-slate-500">3-7 Days Late</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isPro) {
                    alert('Final Legal Overdue notice template is a Pro Plan feature. Upgrade to Pro (₹499/mo) to unlock.');
                    return;
                  }
                  setTemplateType('overdue');
                }}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  templateType === 'overdue'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-400/20'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span>4. Overdue</span>
                  {!isPro && <span className="text-[8px] bg-purple-100 text-purple-700 px-1 rounded font-bold">PRO</span>}
                </div>
                <span className="text-[10px] font-normal text-slate-500">Final Hold</span>
              </button>
            </div>
          </div>

          {/* Live Formatted WhatsApp Chat Bubble */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                WhatsApp Message Preview
              </label>
              <button
                type="button"
                onClick={handleCopy}
                id="copy-whatsapp-text-btn"
                className="text-indigo-600 hover:text-indigo-700 font-bold inline-flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>
            </div>

            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl relative shadow-inner overflow-hidden">
              <div className="bg-white p-3.5 rounded-xl border border-emerald-100 shadow-xs whitespace-pre-wrap break-words break-all font-sans text-xs text-slate-800 leading-relaxed overflow-x-hidden">
                {currentMessage}
              </div>
            </div>

          </div>

          {directSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{directSuccess}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {sendMethod === 'direct' ? 'Direct background delivery & audit log' : 'Opens wa.me deep link'}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSendReminder}
              disabled={isLogging}
              id="send-whatsapp-confirm-btn"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              {sendMethod === 'direct' ? (
                <>
                  <Zap className="w-4 h-4 text-emerald-200 fill-current" />
                  <span>{isLogging ? 'Sending in Background...' : '1-Click Send Reminder'}</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  <span>{isLogging ? 'Opening...' : 'Open in WhatsApp (wa.me)'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

