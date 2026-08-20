import React, { useState, useEffect } from 'react';
import { X, UserPlus, Building, Phone, Mail, MapPin } from 'lucide-react';
import { Client, IndustryType } from '../lib/types.ts';
import { toast } from '../context/ToastContext.tsx';

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
      setPaymentTermDays(clientToEdit.paymentTermDays || 7);
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
  }, [clientToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || phone.trim() === '+91') {
      toast.warning('Please provide party name and a valid phone number', 'Missing Information');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        id: clientToEdit?.id,
        name,
        companyName,
        phone,
        email,
        gstin,
        address,
        industryType,
        paymentTermDays,
        notes,
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
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                Contact Person Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
                required
              />
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
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                WhatsApp Phone Number *
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 99420"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-medium"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="accounts@rajeshlogistics.in"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
                Industry Segment
              </label>
              <select
                value={industryType}
                onChange={(e) => setIndustryType(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium"
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
                value={paymentTermDays}
                onChange={(e) => setPaymentTermDays(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-1">
              GSTIN (Optional)
            </label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              placeholder="27AABCU9603R1ZN"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono uppercase"
            />
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
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              id="submit-client-btn"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
