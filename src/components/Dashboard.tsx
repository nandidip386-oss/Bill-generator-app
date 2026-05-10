import React, { useState } from 'react';
import { Invoice, Template } from '../types';
import { FileText, MoreVertical, Eye, Edit2, Trash2, Copy, Search, Filter, Download, Plus } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { format } from 'date-fns';

interface DashboardProps {
  invoices: Invoice[];
  templates: Template[];
  onAction: (type: 'view' | 'edit' | 'delete' | 'duplicate', id: string) => void;
  onNewInvoice: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ invoices, templates, onAction, onNewInvoice }) => {
  const [search, setSearch] = useState('');

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.customerDetails.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Invoices', value: invoices.length, color: 'bg-blue-500' },
    { label: 'Total Amount', value: formatCurrency(invoices.reduce((sum, inv) => sum + inv.grandTotal, 0)), color: 'bg-green-500' },
    { label: 'Templates', value: templates.length, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Workspace</h2>
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Manage your business billing</p>
        </div>
        <button
          onClick={onNewInvoice}
          className="flex items-center gap-2 rounded-md bg-slate-900 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl hover:bg-slate-800 transition-all active:scale-95 dark:bg-indigo-600 dark:hover:bg-indigo-700"
        >
          <Plus size={16} />
          Create New
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className={cn("absolute right-0 top-0 h-16 w-16 translate-x-4 translate-y--4 rounded-full opacity-5", stat.color)} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="mt-2 text-3xl font-black tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
          <h3 className="font-extrabold text-sm uppercase tracking-wider">Recent Invoices</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search invoices..."
                className="rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 font-medium text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="group hover:bg-slate-50 transition-colors dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4">{invoice.customerDetails.name || 'No Name'}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(invoice.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{formatCurrency(invoice.grandTotal)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          type="button"
                          onClick={() => onAction('view', invoice.id)}
                          className="rounded-md p-2 text-slate-400 hover:bg-white hover:text-blue-600 hover:shadow-sm dark:hover:bg-slate-700" 
                          title="View/Print"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => onAction('edit', invoice.id)}
                          className="rounded-md p-2 text-slate-400 hover:bg-white hover:text-green-600 hover:shadow-sm dark:hover:bg-slate-700" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => onAction('duplicate', invoice.id)}
                          className="rounded-md p-2 text-slate-400 hover:bg-white hover:text-purple-600 hover:shadow-sm dark:hover:bg-slate-700" 
                          title="Duplicate"
                        >
                          <Copy size={16} />
                        </button>
                        <button 
                          type="button"
                          onClick={() => onAction('delete', invoice.id)}
                          className="rounded-md p-2 text-slate-400 hover:bg-white hover:text-red-600 hover:shadow-sm dark:hover:bg-slate-700" 
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                    <FileText className="mx-auto mb-4 opacity-20" size={48} />
                    <p>No invoices found. Create your first bill!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
