import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoicePreview } from './components/InvoicePreview';
import { TemplateDesigner } from './components/TemplateDesigner';
import { storage } from './services/storage';
import { Invoice, Template } from './types';
import { v4 as uuidv4 } from 'uuid';
import { Download, Upload, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    setInvoices(storage.getInvoices());
    setTemplates(storage.getTemplates());
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveInvoice = (invoice: Invoice) => {
    storage.saveInvoice(invoice);
    setInvoices(storage.getInvoices());
    setActiveView('dashboard');
    setCurrentInvoice(null);
    triggerToast('Invoice saved locally');
  };

  const handleSaveTemplate = (template: Template) => {
    storage.saveTemplate(template);
    setTemplates(storage.getTemplates());
    setActiveView('dashboard');
    setCurrentTemplate(null);
    triggerToast('Template saved');
  };

  const handleInvoiceAction = (type: 'view' | 'edit' | 'delete' | 'duplicate', id: string) => {
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) return;

    if (type === 'view') {
      setCurrentInvoice(invoice);
      setActiveView('preview');
    } else if (type === 'edit') {
      setCurrentInvoice(invoice);
      setActiveView('new-invoice');
    } else if (type === 'delete') {
      storage.deleteInvoice(id);
      setInvoices(storage.getInvoices());
      triggerToast('Invoice deleted');
    } else if (type === 'duplicate') {
      const newInvoice = {
        ...invoice,
        id: uuidv4(),
        invoiceNumber: `${invoice.invoiceNumber}-copy`,
        createdAt: Date.now()
      };
      storage.saveInvoice(newInvoice);
      setInvoices(storage.getInvoices());
      triggerToast('Invoice duplicated');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await storage.importData(file);
        setInvoices(storage.getInvoices());
        setTemplates(storage.getTemplates());
        triggerToast('Data imported successfully!');
      } catch (err) {
        triggerToast('Failed to import data');
      }
    }
  };

  const renderView = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {(() => {
            switch (activeView) {
              case 'dashboard':
              case 'my-bills':
                return (
                  <Dashboard 
                    invoices={invoices} 
                    templates={templates} 
                    onAction={handleInvoiceAction}
                    onNewInvoice={() => {
                      setCurrentInvoice(null);
                      setActiveView('new-invoice');
                    }}
                  />
                );
              case 'new-invoice':
                return (
                  <InvoiceForm 
                    initialData={currentInvoice}
                    onSave={handleSaveInvoice}
                    onCancel={() => {
                      setActiveView('dashboard');
                      setCurrentInvoice(null);
                    }}
                    onPrint={(invoice) => {
                      storage.saveInvoice(invoice);
                      setInvoices(storage.getInvoices());
                      setCurrentInvoice(invoice);
                      setActiveView('preview');
                    }}
                  />
                );
              case 'preview':
                return currentInvoice && (
                  <InvoicePreview 
                    invoice={currentInvoice} 
                    onBack={() => setActiveView('new-invoice')} 
                  />
                );
              case 'designer':
                return (
                  <TemplateDesigner 
                    onSave={handleSaveTemplate}
                    onCancel={() => {
                      setActiveView('dashboard');
                      setCurrentTemplate(null);
                    }}
                    initialTemplate={currentTemplate}
                  />
                );
              case 'settings':
                return (
                  <div className="max-w-2xl space-y-8 pb-20">
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Administration</h2>
                    <div className="grid gap-6">
                      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20">
                            <Download size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm uppercase tracking-wider">Backup Data</h3>
                            <p className="text-xs text-slate-500">Download archives of all invoices & templates.</p>
                          </div>
                        </div>
                        <button 
                          onClick={storage.exportData}
                          className="w-full rounded-lg bg-slate-900 px-4 py-3 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-200 shadow-lg"
                        >
                          Export Backup
                        </button>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
                            <Upload size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm uppercase tracking-wider">Restore Archive</h3>
                            <p className="text-xs text-slate-500">Resume from a previously exported JSON file.</p>
                          </div>
                        </div>
                        <label className="block w-full cursor-pointer rounded-lg border border-dashed border-slate-200 p-6 text-center hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                          <span className="text-xs font-black uppercase tracking-widest text-slate-400">Select Backup File</span>
                          <input type="file" className="hidden" accept=".json" onChange={handleImport} />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-900 p-8 text-white dark:bg-slate-800 border border-slate-800 overflow-hidden relative">
                      <ShieldCheck className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10" />
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="text-emerald-400" size={20} />
                          <h4 className="font-black uppercase tracking-widest text-xs">Privacy Protocol</h4>
                        </div>
                        <p className="text-xs font-medium text-slate-400 max-w-lg leading-relaxed">
                          Your data is processed strictly at the edge. No external server requests are made. SmartBill Gen v1.0 operates in a full Zero-Trust environment using local persistence only.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {/* Mobile Menu Toggle */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-lg bg-white p-2 shadow-lg dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
          >
            <div className="flex flex-col gap-1 w-5">
              <span className={cn("h-0.5 w-full bg-slate-600 transition-all", isSidebarOpen && "rotate-45 translate-y-1.5")}></span>
              <span className={cn("h-0.5 w-full bg-slate-600 transition-all", isSidebarOpen && "opacity-0")}></span>
              <span className={cn("h-0.5 w-full bg-slate-600 transition-all", isSidebarOpen && "-rotate-45 -translate-y-1.5")}></span>
            </div>
          </button>
        </div>

        <Sidebar 
          activeView={activeView} 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onViewChange={(view) => {
            setActiveView(view);
            setIsSidebarOpen(false);
            if (view !== 'new-invoice') setCurrentInvoice(null);
          }} 
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        
        <main className={cn(
          "flex-1 transition-all duration-300 min-w-0",
          activeView === 'preview' ? "ml-0" : "md:ml-64 p-4 md:p-8"
        )}>
          {renderView()}
        </main>

        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 100, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 100, x: '-50%' }}
              className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-2xl"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
                <CheckCircle2 size={12} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{toastMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
