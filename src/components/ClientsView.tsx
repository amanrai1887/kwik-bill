import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Building, 
  Edit, 
  FileText, 
  Truck, 
  Briefcase, 
  Megaphone, 
  Laptop,
  Power,
  PowerOff,
  UserCheck,
  UserX,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Client, IndustryType } from '../lib/types.ts';

interface ClientsViewProps {
  clients: Client[];
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onToggleClientStatus: (clientId: number, currentStatus: boolean) => void;
  onDeleteClient?: (clientId: number) => void;
  onCreateInvoiceForClient: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onAddClient,
  onEditClient,
  onToggleClientStatus,
  onDeleteClient,
  onCreateInvoiceForClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  const activeCount = clients.filter((c) => c.isActive !== false).length;
  const disabledCount = clients.filter((c) => c.isActive === false).length;

  const filteredClients = clients.filter((c) => {
    const isClientActive = c.isActive !== false;
    if (statusFilter === 'active' && !isClientActive) return false;
    if (statusFilter === 'disabled' && isClientActive) return false;

    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.gstin || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getIndustryIcon = (type: IndustryType) => {
    switch (type) {
      case 'transport':
        return Truck;
      case 'agency':
        return Megaphone;
      case 'freelancer':
        return Laptop;
      case 'consultant':
        return Briefcase;
      default:
        return Building;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Client & Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage active parties, credit terms, and toggle client status
          </p>
        </div>

        <button
          onClick={onAddClient}
          id="clients-add-new-btn"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All ({clients.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('disabled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'disabled'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Disabled ({disabledCount})
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, company, phone, or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => {
            const Icon = getIndustryIcon(client.industryType);
            const isClientActive = client.isActive !== false;

            return (
              <div
                key={client.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                  isClientActive
                    ? 'border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800/60'
                    : 'border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                          isClientActive
                            ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/50'
                            : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className={`font-bold text-sm leading-tight ${isClientActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 line-through'}`}>
                            {client.name}
                          </h3>
                        </div>
                        {client.companyName && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{client.companyName}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isClientActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                          Disabled
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {client.industryType}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{client.phone}</span>
                    </div>
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.gstin && (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">GSTIN:</span>
                        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{client.gstin}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Credit Terms:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{client.paymentTermDays || 7} Days</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (!isClientActive) {
                        if (confirm(`This client is currently disabled. Would you like to enable ${client.name} and create an invoice?`)) {
                          onToggleClientStatus(client.id, isClientActive);
                          onCreateInvoiceForClient(client);
                        }
                      } else {
                        onCreateInvoiceForClient(client);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                      isClientActive
                        ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Bill Client</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditClient(client)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                      title="Edit Client Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* Disable / Enable Toggle Action */}
                    {isClientActive ? (
                      <button
                        onClick={() => onToggleClientStatus(client.id, true)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50 transition-colors cursor-pointer"
                        title="Disable Client"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Disable</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onToggleClientStatus(client.id, false)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50 transition-colors cursor-pointer"
                        title="Enable Client"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Enable</span>
                      </button>
                    )}

                    {onDeleteClient && (
                      <button
                        onClick={() => onDeleteClient(client.id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        title="Permanently Delete Client"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            {statusFilter === 'disabled'
              ? 'No disabled clients found.'
              : statusFilter === 'active'
              ? 'No active clients found.'
              : 'No clients found matching your search.'}
          </div>
        )}
      </div>
    </div>
  );
};

