import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Printer, Save, Copy, FileText, ArrowLeft } from 'lucide-react';
import { Invoice, InvoiceItem } from '../types';
import { cn, formatCurrency, numberToWords } from '../lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface InvoiceFormProps {
  initialData?: Invoice | null;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
  onPrint: (invoice: Invoice) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData, onSave, onCancel, onPrint }) => {
  const [invoice, setInvoice] = useState<Invoice>(initialData || {
    id: uuidv4(),
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    companyDetails: { name: '', subtitle: '', address: '', gstin: '', panNo: '', aadhaarNo: '', epicNo: '', email: '', phone: '' },
    customerDetails: { name: '', address: '', gstin: '', email: '', phone: '' },
    bankDetails: { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '' },
    items: [{ id: uuidv4(), hsn: '', itemNo: '', description: '', quantity: 0, dozen: 0, pieces: 0, price: 0, amount: 0 }],
    notes: '',
    totalAmount: 0,
    tds: 0,
    grandTotal: 0,
    createdAt: Date.now()
  });

  useEffect(() => {
    const total = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    const tds = total * 0.01;
    const grandTotal = total - tds;

    setInvoice(prev => ({
      ...prev,
      totalAmount: total,
      tds: tds,
      grandTotal: grandTotal
    }));
  }, [invoice.items]);

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          let processedValue = value;
          if (field === 'quantity' || field === 'price' || field === 'dozen' || field === 'pieces') {
            processedValue = Number(value) || 0;
          }
          
          const updatedItem = { ...item, [field]: processedValue };
          
          if (field === 'dozen' || field === 'pieces' || field === 'price') {
            const dozen = Number(updatedItem.dozen || 0);
            const pieces = Number(updatedItem.pieces || 0);
            const price = Number(updatedItem.price || 0);
            
            // Amount = (Dozen * Rate) + ((Rate / 12) * Pieces)
            updatedItem.amount = (dozen * price) + ((price / 12) * pieces);
            // Sync quantity for any logic that depends on it
            updatedItem.quantity = dozen + (pieces / 12);
          } else if (field === 'quantity') {
            // Handle direct quantity changes (for existing data or other logic)
            updatedItem.dozen = Math.floor(updatedItem.quantity);
            updatedItem.pieces = Math.round((updatedItem.quantity % 1) * 12);
            updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.price);
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: uuidv4(), hsn: '', itemNo: '', description: '', quantity: 0, dozen: 0, pieces: 0, price: 0, amount: 0 }]
    }));
  };

  const removeItem = (id: string) => {
    if (invoice.items.length === 1) return;
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold">{initialData ? 'Edit Invoice' : 'Create New Invoice'}</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onPrint(invoice)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Printer size={18} />
            Print Preview
          </button>
          <button
            onClick={() => onSave(invoice)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Save size={18} />
            Save Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Company Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Your Company Details</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Company Name"
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
              value={invoice.companyDetails.name}
              onChange={(e) => setInvoice(prev => ({ ...prev, companyDetails: { ...prev.companyDetails, name: e.target.value } }))}
            />
            <input
              type="text"
              placeholder="Subtitle (e.g. JOB WORK FOR...)"
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
              value={invoice.companyDetails.subtitle || ''}
              onChange={(e) => setInvoice(prev => ({ ...prev, companyDetails: { ...prev.companyDetails, subtitle: e.target.value } }))}
            />
            <textarea
              placeholder="Address"
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
              value={invoice.companyDetails.address}
              onChange={(e) => setInvoice(prev => ({ ...prev, companyDetails: { ...prev.companyDetails, address: e.target.value } }))}
            />
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Phone"
                className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
                value={invoice.companyDetails.phone || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, companyDetails: { ...prev.companyDetails, phone: e.target.value } }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="PAN No"
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
                value={invoice.companyDetails.panNo || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, companyDetails: { ...prev.companyDetails, panNo: e.target.value } }))}
              />
              <input
                type="text"
                placeholder="Aadhaar No"
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
                value={invoice.companyDetails.aadhaarNo || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, companyDetails: { ...prev.companyDetails, aadhaarNo: e.target.value } }))}
              />
              <input
                type="text"
                placeholder="EPIC No"
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
                value={invoice.companyDetails.epicNo || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, companyDetails: { ...prev.companyDetails, epicNo: e.target.value } }))}
              />
            </div>
          </div>
        </div>

        {/* Invoice Info & Customer */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Info</h3>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Document Title (e.g. CHALLAN)"
                className="w-full sm:w-32 rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs font-black focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
                value={invoice.invoiceTitle || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, invoiceTitle: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Bill No"
                className="w-full sm:w-24 rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs font-black focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
                value={invoice.invoiceNumber}
                onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
              />
              <input
                type="date"
                className="w-full sm:w-32 rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
                value={invoice.date}
                onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Customer Name"
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
              value={invoice.customerDetails.name}
              onChange={(e) => setInvoice(prev => ({ ...prev, customerDetails: { ...prev.customerDetails, name: e.target.value } }))}
            />
            <textarea
              placeholder="Customer Address"
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
              value={invoice.customerDetails.address}
              onChange={(e) => setInvoice(prev => ({ ...prev, customerDetails: { ...prev.customerDetails, address: e.target.value } }))}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Customer GSTIN"
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
                value={invoice.customerDetails.gstin || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, customerDetails: { ...prev.customerDetails, gstin: e.target.value } }))}
              />
              <input
                type="text"
                placeholder="Customer Phone"
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700"
                value={invoice.customerDetails.phone || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, customerDetails: { ...prev.customerDetails, phone: e.target.value } }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 font-semibold w-12 text-xs">SL.</th>
              <th className="px-4 py-3 font-semibold w-24 text-xs">HSN Code</th>
              <th className="px-4 py-3 font-semibold w-16 text-xs">No.</th>
              <th className="px-4 py-3 font-semibold text-xs">Description</th>
              <th className="px-4 py-3 font-semibold text-xs text-center border-x border-slate-200 dark:border-slate-800" colSpan={2}>Qty</th>
              <th className="px-4 py-3 font-semibold w-32 text-xs">Rate</th>
              <th className="px-4 py-3 font-semibold w-32 text-right text-xs">Amount</th>
              <th className="px-4 py-3 font-semibold w-12"></th>
            </tr>
            <tr>
              <th className="px-4 py-3 border-t border-slate-200 dark:border-slate-800" colSpan={4}></th>
              <th className="px-2 py-1 text-[10px] font-bold text-center bg-slate-100/50 dark:bg-slate-800/50 border-x border-b border-slate-200 dark:border-slate-800">Doz.</th>
              <th className="px-2 py-1 text-[10px] font-bold text-center bg-slate-100/50 dark:bg-slate-800/50 border-r border-b border-slate-200 dark:border-slate-800">Pcs.</th>
              <th className="border-t border-slate-200 dark:border-slate-800" colSpan={3}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {invoice.items.map((item, index) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    placeholder="HSN"
                    className="w-full bg-transparent focus:outline-none text-xs"
                    value={item.hsn}
                    onChange={(e) => handleItemChange(item.id, 'hsn', e.target.value)}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    placeholder="No."
                    className="w-full bg-transparent focus:outline-none text-xs"
                    value={item.itemNo || ''}
                    onChange={(e) => handleItemChange(item.id, 'itemNo', e.target.value)}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    placeholder="Item description"
                    className="w-full bg-transparent focus:outline-none text-xs"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                  />
                </td>
                <td className="px-2 py-2 border-l border-slate-200 dark:border-slate-800">
                  <input
                    type="number"
                    placeholder="D"
                    className="w-full bg-transparent focus:outline-none text-xs text-center"
                    value={item.dozen || 0}
                    onChange={(e) => handleItemChange(item.id, 'dozen', e.target.value)}
                  />
                </td>
                <td className="px-2 py-2 border-x border-slate-200 dark:border-slate-800">
                  <input
                    type="number"
                    placeholder="P"
                    className="w-full bg-transparent focus:outline-none text-xs text-center"
                    value={item.pieces || 0}
                    onChange={(e) => handleItemChange(item.id, 'pieces', e.target.value)}
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="number"
                    className="w-full bg-transparent focus:outline-none text-xs"
                    value={item.price}
                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                  />
                </td>
                <td className="px-4 py-3 text-right font-medium text-xs">{formatCurrency(item.amount)}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4">
          <button
            onClick={addItem}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus size={18} />
            Add New Item
          </button>
        </div>
      </div>

      {/* Summary and Bank Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Bank Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Bank Name"
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 hover:border-slate-300 transition-colors"
                value={invoice.bankDetails?.bankName || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, bankDetails: { ...(prev.bankDetails || { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '' }), bankName: e.target.value } }))}
              />
              <input
                type="text"
                placeholder="A/C Holder Name"
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 hover:border-slate-300 transition-colors"
                value={invoice.bankDetails?.accountName || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, bankDetails: { ...(prev.bankDetails || { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '' }), accountName: e.target.value } }))}
              />
              <input
                type="text"
                placeholder="A/c No"
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 hover:border-slate-300 transition-colors"
                value={invoice.bankDetails?.accountNumber || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, bankDetails: { ...(prev.bankDetails || { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '' }), accountNumber: e.target.value } }))}
              />
              <input
                type="text"
                placeholder="IFSC Code"
                className="rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 hover:border-slate-300 transition-colors"
                value={invoice.bankDetails?.ifsc || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, bankDetails: { ...(prev.bankDetails || { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '' }), ifsc: e.target.value } }))}
              />
              <input
                type="text"
                placeholder="Branch"
                className="sm:col-span-2 rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 hover:border-slate-300 transition-colors"
                value={invoice.bankDetails?.branch || ''}
                onChange={(e) => setInvoice(prev => ({ ...prev, bankDetails: { ...(prev.bankDetails || { bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '' }), branch: e.target.value } }))}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Notes / Terms</label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900"
              placeholder="Enter payment terms, bank details, etc."
              value={invoice.notes}
              onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Amount in Words</p>
            <p className="mt-1 text-sm font-medium">{numberToWords(invoice.grandTotal)}</p>
          </div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Base Amount</span>
              <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">TDS (1%)</span>
              <span className="font-medium text-red-500">-{formatCurrency(invoice.tds)}</span>
            </div>
            <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>
            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total</span>
              <span className="text-blue-600 dark:text-blue-400">{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
