import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Building, 
  Edit, 
  Trash2, 
  FileText, 
  MessageSquare,
  Truck,
  Briefcase,
  Megaphone,
  Laptop
} from 'lucide-react';
import { Client, IndustryType } from '../lib/types.ts';

interface ClientsViewProps {
  clients: Client[];
  onAddClient: () => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: number) => void;
  onCreateInvoiceForClient: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onCreateInvoiceForClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter((c) => {
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white dark:text-white tracking-tight">
            Client & Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-0.5">
            Manage parties, consignees, GSTIN records & payment credit terms
          </p>
        </div>

        <button
          onClick={onAddClient}
          id="clients-add-new-btn"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, company, phone, or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Showing {filteredClients.length} of {clients.length} clients
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => {
            const Icon = getIndustryIcon(client.industryType);

            return (
              <div
                key={client.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold text-sm shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{client.name}</h3>
                        {client.companyName && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">{client.companyName}</p>
                        )}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {client.industryType}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 dark:border-slate-800 pt-3">
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
                    onClick={() => onCreateInvoiceForClient(client)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Bill Client</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditClient(client)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Client"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteClient(client.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Delete Client"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No clients found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};
