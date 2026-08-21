import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Client, IndustryType } from '../lib/types.ts';
import { toast } from '../context/ToastContext.tsx';
import { isValidPhone, isValidGSTIN, EMAIL_REGEX, formatPhoneNumber } from '../lib/validators/regexPatterns.ts';
import { getStateCodeFromGstin, getStateByCode } from '../lib/gstCompliance.ts';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit: Client | null;
  onSubmit: (data: any) => Promise<void>;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  clientToEdit,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [industryType, setIndustryType] = useState<IndustryType>('transport');
  const [paymentTermDays, setPaymentTermDays] = useState<number>(7);
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name || '');
      setCompanyName(clientToEdit.companyName || '');
      setPhone(clientToEdit.phone || '');
      setEmail(clientToEdit.email || '');
      setGstin(clientToEdit.gstin || '');
      setAddress(clientToEdit.address || '');
      setIndustryType(clientToEdit.industryType || 'transport');
      setPaymentTermDays(clientToEdit.paymentTermDays ?? 7);
      setNotes(clientToEdit.notes || '');
    } else {
      setName('');
      setCompanyName('');
      setPhone('+91 ');
      setEmail('');
      setGstin('');
      setAddress('');
      setIndustryType('transport');
      setPaymentTermDays(7);
      setNotes('');
    }
    setFieldErrors({});
  }, [clientToEdit, isOpen]);

  const detectedState = React.useMemo(() => {
    const code = getStateCodeFromGstin(gstin);
    if (!code) return null;
    return getStateByCode(code);
  }, [gstin]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = 'Contact party name is required.';
    } else if (name.trim().length < 2) {
      errors.name = 'Party name must be at least 2 characters.';
    }

    const cleanPhone = phone.replace(/[\s\-()]/g, '');
    if (!cleanPhone || cleanPhone === '+91' || cleanPhone === '91') {
      errors.phone = 'WhatsApp mobile number is required.';
    } else if (!isValidPhone(phone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number (e.g. 9876543210).';
    }

    if (email.trim() && !EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (gstin.trim()) {
      const upperGstin = gstin.trim().toUpperCase();
      if (!isValidGSTIN(upperGstin)) {
        errors.gstin = 'GSTIN must be 15 alphanumeric characters (e.g. 27AAPFU0939F1ZV).';
      }
    }

    if (paymentTermDays < 0 || paymentTermDays > 365) {
      errors.paymentTermDays = 'Payment terms must be between 0 and 365 days.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.warning('Please fix the highlighted errors before saving.', 'Invalid Details');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: clientToEdit?.id,
        name: name.trim(),
        companyName: companyName.trim(),
        phone: formatPhoneNumber(phone.trim()),
        email: email.trim(),
        gstin: gstin.trim().toUpperCase(),
        address: address.trim(),
        industryType,
        paymentTermDays: Number(paymentTermDays),
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error saving party', 'Save Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full my-8 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {clientToEdit ? 'Edit Client / Party' : 'Add New Client / Party'}
              </h2>
              <p className="text-xs text-slate-500">Contact details for automated WhatsApp alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            id="close-client-modal-btn"
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs" noValidate>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                Contact Person Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Rajesh Sharma"
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-medium transition-colors ${
                  fieldErrors.name ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
              {fieldErrors.name && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {fieldErrors.name}
                </p>
              )}
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                Company / Trade Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Rajesh Logistics Corp"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                WhatsApp Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                }}
                placeholder="+91 98200 99420"
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-mono font-medium transition-colors ${
                  fieldErrors.phone ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
              {fieldErrors.phone && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {fieldErrors.phone}
                </p>
              )}
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                }}
                placeholder="accounts@rajeshlogistics.in"
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-medium transition-colors ${
                  fieldErrors.email ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {fieldErrors.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                Industry Segment
              </label>
              <select
                value={industryType}
                onChange={(e) => setIndustryType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:border-indigo-500"
              >
                <option value="transport">Transport / Logistics</option>
                <option value="agency">Agency / Marketing</option>
                <option value="freelancer">Freelancer / Developer</option>
                <option value="consultant">Consultant / Advisory</option>
                <option value="general">General Enterprise</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                Credit Term (Days)
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={paymentTermDays}
                onChange={(e) => {
                  setPaymentTermDays(Number(e.target.value));
                  if (fieldErrors.paymentTermDays) setFieldErrors(prev => ({ ...prev, paymentTermDays: '' }));
                }}
                className={`w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-mono ${
                  fieldErrors.paymentTermDays ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-500'
                }`}
              />
              {fieldErrors.paymentTermDays && (
                <p className="text-[11px] text-rose-500 font-medium mt-1">
                  {fieldErrors.paymentTermDays}
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                GSTIN (Optional)
              </label>
              {detectedState && (
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  State: {detectedState.name} ({detectedState.code})
                </span>
              )}
            </div>
            <input
              type="text"
              value={gstin}
              maxLength={15}
              onChange={(e) => {
                setGstin(e.target.value.toUpperCase());
                if (fieldErrors.gstin) setFieldErrors(prev => ({ ...prev, gstin: '' }));
              }}
              placeholder="27AABCU9603R1ZN"
              className={`w-full p-2.5 bg-slate-50 border rounded-xl text-slate-900 font-mono uppercase tracking-wider transition-colors ${
                fieldErrors.gstin ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20' : 'border-slate-200 focus:border-indigo-500'
              }`}
            />
            {fieldErrors.gstin && (
              <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {fieldErrors.gstin}
              </p>
            )}
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
              Billing Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Plot No 44, GIDC Sanand, Ahmedabad, Gujarat"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-client-btn"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
