import React from 'react';
import { Invoice } from '../types';
import { formatCurrency, numberToWords } from '../lib/utils';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoicePreviewProps {
  invoice: Invoice;
  onBack: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('printable-invoice');
    if (!element) return;
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`invoice_${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950 print:bg-white print:p-0">
      <div className="no-print mb-8 mx-auto max-w-4xl flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={18} />
          Back to Editor
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <Download size={18} />
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-sm hover:bg-slate-800"
          >
            <Printer size={18} />
            Print Now
          </button>
        </div>
      </div>

      <div className="overflow-x-auto pb-8 print:pb-0 print:overflow-visible">
        <div id="printable-invoice" className="a4-container mx-auto bg-white shadow-2xl text-black relative p-[10mm] font-sans flex flex-col print:shadow-none print:m-0 print:w-[210mm] print:h-auto print:pt-[15mm] print:min-h-0 print:max-w-none">
          <div className="flex-1 flex flex-col">
            <div className="flex justify-center relative z-10 w-full">
              <div className="bg-[#1e3a8a] text-white px-8 py-1 text-sm font-bold tracking-widest uppercase text-center shadow-sm">
                {invoice.invoiceTitle || 'CHALLAN'}
              </div>
            </div>
            
            <div className="border-2 border-[#1e3a8a] -mt-[14px] pt-[14px] mb-4 flex-1 flex flex-col relative w-full">
          {/* Header Row: Company | Customer */}
          <div className="grid grid-cols-2 border-b-2 border-[#1e3a8a]">
             {/* Left (Company) */}
             <div className="p-4 border-r-2 border-[#1e3a8a]">
               <h2 className="text-xl font-bold text-red-600 uppercase mb-1 tracking-wider">{invoice.companyDetails.name || 'COMPANY NAME'}</h2>
               {invoice.companyDetails.subtitle && <p className="text-xs font-bold text-emerald-700 uppercase mb-2 tracking-wide">{invoice.companyDetails.subtitle}</p>}
               <p className="text-xs font-medium uppercase leading-relaxed whitespace-pre-line mb-1">{invoice.companyDetails.address}</p>
               <div className="flex flex-wrap gap-x-4 gap-y-1 mb-2">
                 <p className="text-xs font-medium uppercase text-slate-700">MOB : {invoice.companyDetails.phone}</p>
               </div>
               
               <div className="mt-3 pt-3 border-t border-slate-300 text-xs font-medium uppercase space-y-1 text-slate-700">
                  {invoice.companyDetails.epicNo && <p>EPIC NO : {invoice.companyDetails.epicNo}</p>}
                  {invoice.companyDetails.aadhaarNo && <p>AADHAAR NO : {invoice.companyDetails.aadhaarNo}</p>}
                  {invoice.companyDetails.panNo && <p>PAN NO : {invoice.companyDetails.panNo}</p>}
               </div>
             </div>
             {/* Right (Customer) */}
             <div className="p-4 bg-[#f8fafc] flex flex-col">
               <p className="text-xs font-medium uppercase text-slate-600">Bill to :</p>
               <h3 className="text-lg font-bold text-[#1e3a8a] uppercase mt-2 mb-1 tracking-wide">Name: {invoice.customerDetails.name}</h3>
               <p className="text-xs font-medium uppercase leading-relaxed whitespace-pre-line mb-3 tracking-wide">Address : {invoice.customerDetails.address}</p>
               
               <div className="mt-auto pt-3 border-t border-slate-300 space-y-1">
                 {invoice.customerDetails.gstin && (
                   <p className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wide">GST IN : {invoice.customerDetails.gstin}</p>
                 )}
                 {invoice.customerDetails.phone && (
                   <p className="text-xs font-medium uppercase text-slate-700">Phone : {invoice.customerDetails.phone}</p>
                 )}
               </div>
             </div>
          </div>

          {/* Sub Header: Bill No | Date */}
          <div className="grid grid-cols-2 border-b-2 border-[#1e3a8a] bg-[#f8fafc]">
             <div className="p-2 px-4 text-sm font-bold text-slate-800 border-r-2 border-[#1e3a8a]">
              Bill No : {invoice.invoiceNumber}
            </div>
            <div className="p-2 px-4 text-sm font-bold text-slate-800">
              Date: {invoice.date ? invoice.date.split('-').reverse().join('-') : ''}
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-center border-collapse border-b-2 border-[#1e3a8a]">
            <thead>
              <tr className="border-b-2 border-[#1e3a8a] text-[10px] font-bold bg-slate-100 uppercase tracking-wider text-slate-700">
                <th className="p-1 border-r-2 border-[#1e3a8a] w-[40px] py-3">SL.</th>
                <th className="p-1 border-r-2 border-[#1e3a8a] w-[80px] py-3">HSN Code</th>
                <th className="p-1 border-r-2 border-[#1e3a8a] w-[60px] py-3">No</th>
                <th className="p-1 border-r-2 border-[#1e3a8a] py-3">DESCRIPTION</th>
                <th className="p-1 border-r-2 border-[#1e3a8a] w-[100px] py-3">Quantity</th>
                <th className="p-1 border-r-2 border-[#1e3a8a] w-[80px] py-3 text-right pr-2">RATE</th>
                <th className="p-1 w-[110px] py-3 text-right pr-2">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {/* Render items and empty rows */}
              {Array.from({ length: Math.max(16, invoice.items.length) }).map((_, i) => {
                const item = invoice.items[i];
                const hideInPrint = !item && i >= 13;
                return (
                  <tr key={i} className={`text-[11px] border-b border-[#1e3a8a] last:border-b-0 even:bg-[#f8fafc] ${hideInPrint ? 'print:hidden' : ''}`}>
                    <td className="p-1 border-r-2 border-[#1e3a8a] h-7 font-bold text-slate-600">{item ? i + 1 + '.' : ''}</td>
                    <td className="p-1 border-r-2 border-[#1e3a8a] font-medium text-slate-700">{item?.hsn || ''}</td>
                    <td className="p-1 border-r-2 border-[#1e3a8a] font-medium text-slate-700">{item?.itemNo || ''}</td>
                    <td className="p-1 border-r-2 border-[#1e3a8a] font-bold uppercase text-slate-800 px-2">{item?.description || ''}</td>
                    <td className="p-1 border-r-2 border-[#1e3a8a] font-bold text-[#1e3a8a] whitespace-nowrap">
                      {item ? `${item.dozen || 0}D ${item.pieces || 0}P` : ''}
                    </td>
                    <td className="p-1 border-r-2 border-[#1e3a8a] font-medium text-slate-700 text-right pr-2">{item ? (Number(item.price).toFixed(2)) : ''}</td>
                    <td className="p-1 font-bold text-slate-800 text-right pr-2 whitespace-nowrap">{item ? formatCurrency(item.amount).replace(/[^0-9.,]/g, '').replace('₹', '').trim() : ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex-1"></div>

          {/* Totals & Words */}
          <div className="grid grid-cols-[1fr_auto] border-t-2 border-[#1e3a8a] mt-auto">
             {/* Words */}
             <div className="p-4 flex items-start flex-col justify-start border-r-2 border-[#1e3a8a]">
               <p className="text-[13px] font-extrabold italic text-slate-800 leading-tight">Rupees in words: <span className="text-[11px] font-bold not-italic text-slate-700 ml-1">{numberToWords(invoice.grandTotal)}</span></p>
             </div>
             
             {/* Totals */}
             <div className="w-[320px]">
               <div className="grid grid-cols-[1fr_130px] border-b border-[#1e3a8a80] bg-slate-50">
                 <div className="p-3 text-sm font-bold text-slate-600 border-r-2 border-[#1e3a8a] uppercase tracking-wider">TOTAL</div>
                 <div className="p-3 text-sm font-bold text-right text-slate-800 whitespace-nowrap">{formatCurrency(invoice.totalAmount).replace(/[^0-9.,]/g, '').trim()}</div>
               </div>
               <div className="grid grid-cols-[1fr_130px] border-b-2 border-[#1e3a8a] bg-slate-50">
                 <div className="p-3 text-sm font-bold text-slate-600 border-r-2 border-[#1e3a8a] uppercase tracking-wider">TDS</div>
                 <div className="p-3 text-sm font-bold text-right text-slate-800 whitespace-nowrap">{formatCurrency(invoice.tds).replace(/[^0-9.,]/g, '').trim()}</div>
               </div>
               <div className="grid grid-cols-[1fr_130px] bg-white">
                 <div className="p-3 text-sm font-black uppercase text-[#1e3a8a] border-r-2 border-[#1e3a8a] tracking-wider">GRAND TOTAL</div>
                 <div className="p-3 text-sm font-black text-right text-[#1e3a8a] whitespace-nowrap border-b border-transparent">{formatCurrency(invoice.grandTotal).replace(/[^0-9.,]/g, '').trim()}</div>
               </div>
             </div>
          </div>

          {/* Footer / Bank / Signature */}
          <div className="p-4 flex justify-between border-t-2 border-[#1e3a8a] bg-slate-50">
            <div className="text-xs font-medium space-y-[2px] text-slate-800">
              <p className="font-black uppercase tracking-widest text-[#1e3a8a] mb-2">:BANK DETAILS:</p>
              <p><span className="text-slate-500">Bank Name:</span> {invoice.bankDetails?.bankName}</p>
              <p><span className="text-slate-500">A/C Holder Name :</span> {invoice.bankDetails?.accountName}</p>
              <p><span className="text-slate-500">A/c No:</span> {invoice.bankDetails?.accountNumber}</p>
              <p><span className="text-slate-500">IFSC Code :</span> {invoice.bankDetails?.ifsc}</p>
              <p><span className="text-slate-500">Branch :</span> {invoice.bankDetails?.branch}</p>
            </div>
            
            <div className="flex items-end gap-12 pr-4 text-sm font-bold uppercase tracking-wider text-slate-800">
               <div className="text-center font-black pb-4 text-slate-600">
                 signature
               </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
  );
};
