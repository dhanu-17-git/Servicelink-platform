import { useState } from 'react';
import { CalendarClock, FileText, Home, Loader2, Send, X } from 'lucide-react';
import { API_BASE, authHeaders } from '../api/config';
import { useToast } from '../context/ToastContext';

const changeOptions = [
  { value: 'date_time', label: 'Date & Time', icon: CalendarClock },
  { value: 'address', label: 'Address', icon: Home },
  { value: 'special_instructions', label: 'Special Instructions', icon: FileText },
];

const ChangeRequestModal = ({ booking, isOpen, onClose, onSubmitted }) => {
  const toast = useToast();
  const [fieldName, setFieldName] = useState('date_time');
  const [value, setValue] = useState({ date: '', time: '', address: '', instructions: '' });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !booking) return null;

  const getNewValue = () => {
    if (fieldName === 'date_time') return `${value.date} ${value.time}`.trim();
    if (fieldName === 'address') return value.address.trim();
    return value.instructions.trim();
  };

  const submit = async () => {
    const newValue = getNewValue();
    if (!newValue) {
      toast.info('Please enter the requested change');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/bookings/${booking.id}/change-request/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ field_name: fieldName, new_value: newValue }),
      });
      if (!res.ok) throw new Error('Failed to send request');
      toast.success('Request sent. Waiting for worker to respond.');
      onSubmitted?.(booking.id, { fieldName, newValue });
      onClose();
    } catch (err) {
      toast.info(err.message || 'Could not send change request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-reveal">
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black">Request Booking Change</h2>
            <p className="text-sm text-slate-400 mt-1">Order #{booking.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm font-bold text-slate-900 mb-3">What do you want to change?</p>
            <div className="grid sm:grid-cols-3 gap-2">
              {changeOptions.map(({ value: optionValue, label, icon: Icon }) => (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() => setFieldName(optionValue)}
                  className={`p-3 rounded-xl border text-sm font-bold flex flex-col items-center gap-2 ${fieldName === optionValue ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {fieldName === 'date_time' && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Date</label>
                <input type="date" value={value.date} onChange={(e) => setValue({ ...value, date: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Time</label>
                <input type="time" value={value.time} onChange={(e) => setValue({ ...value, time: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
              </div>
            </div>
          )}

          {fieldName === 'address' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Address</label>
              <textarea rows="4" value={value.address} onChange={(e) => setValue({ ...value, address: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
            </div>
          )}

          {fieldName === 'special_instructions' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Special Instructions</label>
              <textarea rows="4" value={value.instructions} onChange={(e) => setValue({ ...value, instructions: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none" />
            </div>
          )}

          <button onClick={submit} disabled={submitting} className="w-full py-3.5 rounded-xl bg-emerald-500 text-white text-sm font-black hover:bg-emerald-600 disabled:opacity-60 flex items-center justify-center gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeRequestModal;
