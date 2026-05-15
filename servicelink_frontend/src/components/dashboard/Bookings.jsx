import { useState } from 'react';
import { Calendar, Clock, MapPin, X, User, Repeat2, Navigation, Star, FileText, MessageSquare, Pencil, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_BASE, authHeaders } from '../../api/config';
import { useNavigate } from 'react-router-dom';
import ReviewModal from '../ReviewModal';
import InvoiceModal from '../InvoiceModal';
import ChatDrawer from '../ChatDrawer';
import ChangeRequestModal from '../ChangeRequestModal';

const statusConfig = {
  pending:   { label: 'Pending',   dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',   bar: 'bg-gradient-to-r from-amber-400 to-orange-400' },
  confirmed: { label: 'Confirmed', dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',     bar: 'bg-gradient-to-r from-blue-500 to-indigo-500' },
  navigating:{ label: 'On the way',dot: 'bg-indigo-500',  badge: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',bar: 'bg-gradient-to-r from-indigo-500 to-purple-500' },
  arrived:   { label: 'Arrived',   dot: 'bg-cyan-500',    badge: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',     bar: 'bg-gradient-to-r from-cyan-400 to-teal-400' },
  completed: { label: 'Completed', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', bar: 'bg-gradient-to-r from-emerald-400 to-green-400' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400',     badge: 'bg-red-50 text-red-700 ring-1 ring-red-200',        bar: 'bg-gradient-to-r from-red-400 to-rose-400' },
};

const Bookings = ({ bookings }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [reviewBooking, setReviewBooking] = useState(null);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);
  const [changeRequestBooking, setChangeRequestBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [editAddress, setEditAddress] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const [localBookings, setLocalBookings] = useState(bookings);

  const handleChangeSubmitted = (id, request) => {
    setLocalBookings(prev => prev.map(b =>
      b.id === id ? { ...b, changeRequestStatus: 'pending', changeRequestField: request.fieldName, changeRequestValue: request.newValue } : b
    ));
  };

  const handleDirectEdit = async () => {
    if (!editAddress.trim()) { toast.info('Address cannot be empty'); return; }
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_BASE}/bookings/${editingBooking.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ address: editAddress.trim() }),
      });
      if (!res.ok) throw new Error('Failed to update booking');
      setLocalBookings(prev => prev.map(b => b.id === editingBooking.id ? { ...b, address: editAddress.trim() } : b));
      toast.success('Address updated successfully.');
      setEditingBooking(null);
    } catch (err) { toast.info(err.message || 'Could not update address'); }
    finally { setSavingEdit(false); }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) { toast.info('Please select a reason'); return; }
    try {
      const response = await fetch(`${API_BASE}/bookings/${cancellingId}/status`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ status: 'cancelled', reason: cancelReason }),
      });
      if (response.ok) {
        setLocalBookings(prev => prev.map(b => b.id === cancellingId ? { ...b, status: 'cancelled' } : b));
        toast.success('Booking cancelled successfully');
        setShowCancelModal(false); setCancellingId(null); setCancelReason(''); setSelectedBooking(null);
      } else { toast.info('Failed to cancel booking'); }
    } catch { toast.info('Failed to cancel. Please try again.'); }
  };

  return (
    <div className="animate-reveal">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="text-slate-500 text-sm mt-1">Track and manage your service and tool requests.</p>
      </div>

      <div className="space-y-5">
        {localBookings.length > 0 ? localBookings.map((b) => {
          const st = statusConfig[b.status?.toLowerCase()] || statusConfig.pending;
          return (
            <div key={b.id} className="bg-white rounded-[1.75rem] shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden group">

              {/* Status bar at very top */}
              <div className={`h-1 w-full ${st.bar}`} />

              <div className="p-6">
                {/* Header row: title + status badge top-right */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Order #{b.id}</span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">{b.service}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />{b.worker || '—'}
                    </p>
                  </div>
                  {/* Status badge — top right corner */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex-shrink-0 ${st.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot} animate-pulse`} />
                    {st.label}
                  </div>
                </div>

                {/* Info chips */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-semibold text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {b.date || new Date(b.createdAt).toLocaleDateString()}
                  </div>
                  {b.time && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-semibold text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {b.time}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-xs font-semibold text-slate-600 max-w-[260px] truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{b.address || 'Location pending'}</span>
                  </div>
                </div>

                {/* Change request alerts */}
                {b.changeRequestStatus === 'pending' && (
                  <div className="mb-4 px-4 py-2.5 rounded-xl bg-cyan-50 border border-cyan-100 text-xs font-bold text-cyan-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    Address change request sent — waiting for worker to respond.
                  </div>
                )}
                {b.changeRequestStatus === 'rejected' && (
                  <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100 text-xs font-bold text-red-700">
                    Worker declined your change request.
                  </div>
                )}

                {/* Footer: amount + actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-gray-100">
                  <p className="text-xl font-black text-slate-900">
                    ₹{b.amount ? Number(b.amount).toLocaleString('en-IN') : 'TBD'}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {/* View Details */}
                    <button onClick={() => setSelectedBooking(b)}
                      className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                      View Details
                    </button>

                    {/* Pending: Edit Address */}
                    {b.status?.toLowerCase() === 'pending' && (
                      <button onClick={() => { setEditingBooking(b); setEditAddress(b.address || ''); }}
                        className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5">
                        <Pencil className="w-3.5 h-3.5" /> Edit Address
                      </button>
                    )}

                    {/* Confirmed/Navigating: Request Change */}
                    {['confirmed', 'navigating'].includes(b.status?.toLowerCase()) && (
                      <button onClick={() => setChangeRequestBooking(b)}
                        className="px-4 py-2 rounded-xl bg-cyan-50 text-cyan-700 text-xs font-bold hover:bg-cyan-100 border border-cyan-100 transition-colors flex items-center gap-1.5">
                        <Repeat2 className="w-3.5 h-3.5" /> Request Change
                      </button>
                    )}

                    {/* Navigating/Arrived: Track Live */}
                    {['navigating', 'arrived'].includes(b.status?.toLowerCase()) && (
                      <button onClick={() => navigate(`/track/${b.id}`)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 shadow-sm transition-colors flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5" /> Track Live
                      </button>
                    )}

                    {/* Completed: Rate */}
                    {b.status?.toLowerCase() === 'completed' && (
                      <button onClick={() => setReviewBooking(b)}
                        className="px-4 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100 hover:bg-amber-100 transition-colors flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5" /> Rate Worker
                      </button>
                    )}

                    {/* Pending/Confirmed: Cancel */}
                    {['pending', 'confirmed'].includes(b.status?.toLowerCase()) && (
                      <button onClick={() => { setCancellingId(b.id); setShowCancelModal(true); }}
                        className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 hover:bg-red-100 transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="bg-white p-16 rounded-[2rem] border border-dashed border-gray-200 text-center">
            <MapPin className="w-10 h-10 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No bookings yet. Book a service to get started.</p>
          </div>
        )}
      </div>

      {/* ── Edit Address Modal ── */}
      {editingBooking && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setEditingBooking(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-reveal">
            <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
              <div>
                <p className="text-emerald-400 text-xs font-bold tracking-wider uppercase mb-1">Order #{editingBooking.id}</p>
                <h2 className="text-xl font-black">Edit Service Address</h2>
                <p className="text-slate-400 text-xs mt-1">Your booking is still pending — you can update the address freely.</p>
              </div>
              <button onClick={() => setEditingBooking(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Address</p>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-600">{editingBooking.address || 'Not set'}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Address</p>
                <textarea
                  rows={3}
                  value={editAddress}
                  onChange={e => setEditAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none font-medium"
                  placeholder="Enter the updated service address..."
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditingBooking(null)}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-slate-600 text-sm font-bold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDirectEdit} disabled={savingEdit}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-white text-sm font-black hover:bg-emerald-600 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                  {savingEdit ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Address'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Booking Detail Modal ── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-reveal">
            <div className={`h-1.5 w-full ${(statusConfig[selectedBooking.status?.toLowerCase()] || statusConfig.pending).bar}`} />
            <div className="bg-slate-900 text-white p-6 pb-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full mb-3 ${(statusConfig[selectedBooking.status?.toLowerCase()] || statusConfig.pending).badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${(statusConfig[selectedBooking.status?.toLowerCase()] || statusConfig.pending).dot}`} />
                    {(statusConfig[selectedBooking.status?.toLowerCase()] || statusConfig.pending).label}
                  </div>
                  <h2 className="text-2xl font-black">{selectedBooking.service}</h2>
                  <p className="text-slate-400 text-xs font-semibold tracking-wider mt-1 uppercase">Order #{selectedBooking.id}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 bg-white -mt-4 rounded-t-[2rem] relative space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Professional</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedBooking.worker || '—'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <Calendar className="w-4 h-4 text-emerald-500 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-sm font-bold text-slate-900">{selectedBooking.date || '—'}</p>
                </div>
                <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <Clock className="w-4 h-4 text-blue-500 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                  <p className="text-sm font-bold text-slate-900">{selectedBooking.time || 'Flexible'}</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                <MapPin className="w-4 h-4 text-amber-500 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Service Address</p>
                <p className="text-sm font-bold text-slate-900 leading-relaxed">{selectedBooking.address || 'Not provided'}</p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-500">Total Amount</p>
                <p className="text-xl font-black text-slate-900">₹{selectedBooking.amount ? Number(selectedBooking.amount).toLocaleString('en-IN') : 'TBD'}</p>
              </div>
              {selectedBooking.status?.toLowerCase() === 'pending' && (
                <p className="text-xs font-medium text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                  Payment is collected only after the service is completed.
                </p>
              )}
              <div className="pt-2 grid grid-cols-2 gap-3">
                <button onClick={() => { setChatBooking(selectedBooking); setSelectedBooking(null); }}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors">
                  <MessageSquare className="w-4 h-4" /> Chat
                </button>
                {selectedBooking.status?.toLowerCase() === 'completed' ? (
                  <button onClick={() => { setInvoiceBooking(selectedBooking); setSelectedBooking(null); }}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors">
                    <FileText className="w-4 h-4" /> Invoice
                  </button>
                ) : (
                  <button onClick={() => navigate(`/track/${selectedBooking.id}`)}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors">
                    <Navigation className="w-4 h-4" /> Track Live
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancellation Modal ── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-reveal">
            <div className="bg-red-600 p-6">
              <h3 className="text-xl font-black text-white">Cancel Booking?</h3>
              <p className="text-red-200 text-sm mt-1">This action cannot be undone.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Reason for cancellation</label>
                <select value={cancelReason} onChange={e => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30">
                  <option value="">Select a reason</option>
                  <option value="Change of plans">Change of plans</option>
                  <option value="Found a cheaper option">Found a cheaper option</option>
                  <option value="Worker not responding">Worker not responding</option>
                  <option value="Incorrect booking">Incorrect booking</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  Go Back
                </button>
                <button onClick={handleCancelBooking}
                  className="flex-1 py-3 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors">
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Modals */}
      <ReviewModal isOpen={!!reviewBooking} onClose={() => setReviewBooking(null)} booking={reviewBooking || {}} />
      <InvoiceModal isOpen={!!invoiceBooking} onClose={() => setInvoiceBooking(null)} booking={invoiceBooking || {}} />
      <ChatDrawer isOpen={!!chatBooking} onClose={() => setChatBooking(null)} booking={chatBooking || {}} />
      <ChangeRequestModal
        isOpen={!!changeRequestBooking}
        booking={changeRequestBooking}
        onClose={() => setChangeRequestBooking(null)}
        onSubmitted={handleChangeSubmitted}
      />
    </div>
  );
};

export default Bookings;
