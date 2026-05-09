import { X, Download } from 'lucide-react';

const formatINR = (value) => `\u20b9${Number(value).toLocaleString('en-IN')}`;

const InvoiceModal = ({ isOpen, onClose, booking = {} }) => {
  if (!isOpen) return null;

  const baseAmount = Number(booking.amount || 2100);
  const platformFee = Math.round(baseAmount * 0.05);
  const gst = Math.round((baseAmount + platformFee) * 0.18);
  const total = baseAmount + platformFee + gst;
  const worker = booking.worker?.name || booking.worker || 'Assigned Professional';
  const skill = booking.worker?.skill || booking.skill || 'Service Provider';
  const customer = booking.customer?.name || booking.customerName || 'ServiceLink Customer';
  const address = booking.address || booking.customer?.address || 'Customer address on booking record';
  const service = booking.service || 'Home service';
  const date = booking.date || new Date().toLocaleDateString('en-IN');
  const invoiceNumber = `SL-2026-${booking.id || 'BK-1042'}`;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm print:static print:block print:bg-white print:p-0">
      <div className="absolute inset-0 print:hidden" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 print:hidden">
          <h2 className="text-lg font-black text-slate-950">Invoice Preview</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-800">
              <Download className="h-4 w-4" />
              Download as PDF
            </button>
            <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <section className="invoice-content bg-white p-8 text-slate-900 sm:p-10">
          <header className="flex flex-col gap-6 border-b-2 border-slate-900 pb-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-3xl font-black tracking-tight">ServiceLink</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">Mysuru, Karnataka, India</p>
              <p className="text-sm font-semibold text-slate-600">support@servicelink.demo</p>
            </div>
            <div className="text-left sm:text-right">
              <h1 className="text-2xl font-black uppercase tracking-widest">Tax Invoice</h1>
              <p className="mt-3 text-sm font-bold">Invoice #: {invoiceNumber}</p>
              <p className="mt-1 text-sm font-bold">Date: {date}</p>
              <span className="mt-4 inline-flex rounded-full bg-emerald-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-700">Paid</span>
            </div>
          </header>

          <div className="grid gap-6 border-b border-slate-200 py-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Bill To</p>
              <p className="mt-3 text-base font-black">{customer}</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{address}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Service Provider</p>
              <p className="mt-3 text-base font-black">{worker}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">{skill}</p>
            </div>
          </div>

          <table className="mt-8 w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-y border-slate-300 bg-slate-50">
                {['Service Description', 'Hours/Qty', 'Rate', 'Amount'].map(head => (
                  <th key={head} className="px-4 py-3 font-black uppercase tracking-wider text-slate-600">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="px-4 py-5 font-bold">{service}</td>
                <td className="px-4 py-5 font-semibold">1</td>
                <td className="px-4 py-5 font-semibold">{formatINR(baseAmount)}</td>
                <td className="px-4 py-5 font-black">{formatINR(baseAmount)}</td>
              </tr>
            </tbody>
          </table>

          <div className="ml-auto mt-8 w-full max-w-sm space-y-3 text-sm">
            <div className="flex justify-between"><span className="font-semibold text-slate-600">Subtotal</span><span className="font-bold">{formatINR(baseAmount)}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-slate-600">Platform Fee (5%)</span><span className="font-bold">{formatINR(platformFee)}</span></div>
            <div className="flex justify-between"><span className="font-semibold text-slate-600">GST (18%)</span><span className="font-bold">{formatINR(gst)}</span></div>
            <div className="flex justify-between border-t-2 border-slate-900 pt-4 text-lg"><span className="font-black">Total</span><span className="font-black">{formatINR(total)}</span></div>
          </div>

          <footer className="mt-12 border-t border-slate-200 pt-5 text-center text-xs font-semibold text-slate-500">
            This is a computer-generated invoice. No signature required.
          </footer>
        </section>
      </div>
      <style>{`@media print{body *{visibility:hidden}.invoice-content,.invoice-content *{visibility:visible}.invoice-content{position:absolute;left:0;top:0;width:100%;padding:32px!important}}`}</style>
    </div>
  );
};

export default InvoiceModal;
