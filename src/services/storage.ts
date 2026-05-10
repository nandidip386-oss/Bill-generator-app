import { Invoice, Template } from '../types';

const INVOICES_KEY = 'sb_invoices';
const TEMPLATES_KEY = 'sb_templates';

export const storage = {
  getInvoices: (): Invoice[] => {
    const data = localStorage.getItem(INVOICES_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveInvoices: (invoices: Invoice[]) => {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  },
  saveInvoice: (invoice: Invoice) => {
    const invoices = storage.getInvoices();
    const index = invoices.findIndex((i) => i.id === invoice.id);
    if (index > -1) {
      invoices[index] = invoice;
    } else {
      invoices.unshift(invoice);
    }
    storage.saveInvoices(invoices);
  },
  deleteInvoice: (id: string) => {
    const invoices = storage.getInvoices().filter((i) => i.id !== id);
    storage.saveInvoices(invoices);
  },
  getTemplates: (): Template[] => {
    const data = localStorage.getItem(TEMPLATES_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveTemplates: (templates: Template[]) => {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  },
  saveTemplate: (template: Template) => {
    const templates = storage.getTemplates();
    const index = templates.findIndex((t) => t.id === template.id);
    if (index > -1) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    storage.saveTemplates(templates);
  },
  deleteTemplate: (id: string) => {
    const templates = storage.getTemplates().filter((t) => t.id !== id);
    storage.saveTemplates(templates);
  },
  exportData: () => {
    const data = {
      invoices: storage.getInvoices(),
      templates: storage.getTemplates(),
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_bill_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  },
  importData: (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.invoices) storage.saveInvoices(data.invoices);
          if (data.templates) storage.saveTemplates(data.templates);
          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  },
};
