export interface InvoiceItem {
  id: string;
  hsn: string;
  itemNo?: string;
  description: string;
  quantity: number;
  dozen?: number;
  pieces?: number;
  quantityUnit?: string;
  price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceTitle?: string;
  invoiceNumber: string;
  date: string;
  companyDetails: {
    name: string;
    subtitle?: string;
    address: string;
    gstin: string;
    panNo?: string;
    aadhaarNo?: string;
    epicNo?: string;
    email: string;
    phone: string;
  };
  customerDetails: {
    name: string;
    address: string;
    gstin: string;
    email: string;
    phone: string;
  };
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifsc: string;
    branch: string;
  };
  items: InvoiceItem[];
  notes: string;
  totalAmount: number;
  tds: number;
  grandTotal: number;
  createdAt: number;
}

export interface Template {
  id: string;
  name: string;
  canvasData: string; // Fabric.js JSON string
  createdAt: number;
}
