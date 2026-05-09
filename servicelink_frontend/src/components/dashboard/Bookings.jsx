import { useState } from 'react';
import { Calendar, Clock, MapPin, Tag, X, User, IndianRupee } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { API_BASE, authHeaders } from '../../api/config';
import { useNavigate } from 'react-router-dom';
import ReviewModal from '../ReviewModal';
import InvoiceModal from '../InvoiceModal';
import ChatDrawer from '../ChatDrawer';

const statusColor = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  confirmed: 'bg-blue-50 text-blue-700 border-blue-100',
  navigating: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  arrived: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  cancelled: 'bg-red-50 text-red-700 border-red-100',
};

const Bookings = ({ bookings }) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [reviewBooking, setReviewBooking] = useState(null);
  const [invoiceBooking, setInvoiceBooking] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();
  const [localBookings, setLocalBookings] = useState(bookings);

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      toast.info('Please select a reason');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/bookings/${cancellingId}/status`,
        {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ status: 'cancelled', reason: cancelReason }),
        }
      );

      if (response.ok) {
        // Update local bookings
        setLocalBookings(prev =>
          prev.map(b =>
            b.id === cancellingId
              ? { ...b, status: 'cancelled', cancellationReason: cancelReason }
              : b
          )
        );
        toast.success('Booking cancelled successfully');
        setShowCancelModal(false);
        setCancellingId(null);
        setCancelReason('');
        setSelectedBooking(null);
      } else {
        toast.info('Failed to cancel booking');
      }
    } catch (err) {
      toast.info('Failed to cancel. Please try again.');
    }
  };

  return (
    <div className="animate-reveal">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-heading">My Bookings</h1>
        <p className="text-muted text-sm mt-1">Track and manage your service and tool requests.</p>
      </div>

      <div className="space-y-4">
        {localBookings.length > 0 ? localBookings.map((b) => (
          <div key={b.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${b.bookingType === 'worker' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-heading text-lg">
                  {b.service}
                </h3>
                <p className="text-sm font-semibold text-slate-500 mb-2">Worker: {b.worker}</p>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-sm text-muted">
                    <Calendar className="w-4 h-4" />
                    {b.date || new Date(b.createdAt).toLocaleDateString()}
                  </div>
                  {b.time && (
                    <div className="flex items-center gap-1.5 text-sm text-muted">
                      <Clock className="w-4 h-4" />
                      {b.time}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-muted">
                    <MapPin className="w-4 h-4" />
                    {b.address || 'Location pending'}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-black text-slate-900">
                    ₹{b.amount ? b.amount.toLocaleString() : 'TBD'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 md:mt-0">
              <span className={`px-4 py-2 text-xs font-bold rounded-full border uppercase tracking-wider ${statusColor[b.status?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                {b.status || 'Pending'}
              </span>
              <button onClick={() => setSelectedBooking(b)} className="text-sm font-semibold text-muted hover:text-heading px-4 py-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                View Details
              </button>
              {['pending', 'confirmed'].includes(b.status?.toLowerCase()) && (
                <button
                  onClick={() => { setCancellingId(b.id); setShowCancelModal(true); }}
                  className="text-sm font-semibold text-red-500 hover:text-red-700 px-4 py-2 rounded-lg border border-red-100 hover:bg-red-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              {['navigating', 'arrived'].includes(b.status?.toLowerCase()) && (
                <button
                  onClick={() => navigate(`/track/${b.id}`)}
                  className="text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg shadow-sm transition-colors"
                >
                  Track Live
                </button>
              )}
              {b.status?.toLowerCase() === 'completed' && (
                <button
                  onClick={() => setReviewBooking(b)}
                  className="text-sm font-semibold text-amber-600 hover:text-amber-700 px-4 py-2 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
                >
                  Rate Worker
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
            <p className="text-muted">No bookings found in your history.</p>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-reveal">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 pb-8">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border mb-3 ${statusColor[selectedBooking.status?.toLowerCase()] || 'bg-white/10 text-white border-white/20'}`}>
                    {selectedBooking.status || 'Pending'}
                  </span>
                  <h2 className="text-2xl font-black">{selectedBooking.service}</h2>
                  <p className="text-slate-400 text-xs font-semibold tracking-wider mt-1 uppercase">Order #{selectedBooking.id}</p>
                </div>
                <button onClick={() => setSelectedBooking(null)} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 bg-white -mt-4 rounded-t-[2rem] relative">
              <div className="space-y-4">
                
                {/* Worker Info */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Assigned Professional</p>
                    <p className="text-sm font-bold text-slate-900">{selectedBooking.worker}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <Calendar className="w-5 h-5 text-emerald-500 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                    <p className="text-sm font-bold text-slate-900">{selectedBooking.date || new Date(selectedBooking.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                    <Clock className="w-5 h-5 text-blue-500 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                    <p className="text-sm font-bold text-slate-900">{selectedBooking.time || 'Flexible'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <MapPin className="w-5 h-5 text-amber-500 mb-2" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Service Address</p>
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">{selectedBooking.address || 'Address not provided'}</p>
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-500">Total Amount</p>
                    <p className="text-xl font-black text-slate-900">₹{selectedBooking.amount ? selectedBooking.amount.toLocaleString() : 'TBD'}</p>
                  </div>
                  {selectedBooking.status?.toLowerCase() === 'pending' && (
                    <p className="text-xs font-medium text-amber-600 mt-2 bg-amber-50 p-2 rounded-lg border border-amber-100">
                      Payment is collected only after the service is completed.
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setChatBooking(selectedBooking); setSelectedBooking(null); }}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
                  >
                    Chat with Worker
                  </button>
                  {selectedBooking.status?.toLowerCase() === 'completed' ? (
                    <button 
                      onClick={() => { setInvoiceBooking(selectedBooking); setSelectedBooking(null); }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors"
                    >
                      Download Invoice
                    </button>
                  ) : (
                    <button 
                      onClick={() => { navigate(`/track/${selectedBooking.id}`); }}
                      className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition-colors"
                    >
                      Live Tracking
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-reveal">
            
            <div className="bg-red-50 border-b border-red-100 p-6">
              <h3 className="text-lg font-bold text-red-900">Cancel Booking?</h3>
              <p className="text-sm text-red-700 mt-1">This action cannot be undone.</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-heading mb-2">Reason for cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-transparent"
                >
                  <option value="">Select a reason</option>
                  <option value="Change of plans">Change of plans</option>
                  <option value="Found a cheaper option">Found a cheaper option</option>
                  <option value="Worker not responding">Worker not responding</option>
                  <option value="Incorrect booking">Incorrect booking</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelBooking}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Modals */}
      <ReviewModal isOpen={!!reviewBooking} onClose={() => setReviewBooking(null)} booking={reviewBooking || {}} />
      <InvoiceModal isOpen={!!invoiceBooking} onClose={() => setInvoiceBooking(null)} booking={invoiceBooking || {}} />
      <ChatDrawer isOpen={!!chatBooking} onClose={() => setChatBooking(null)} booking={chatBooking || {}} />
    </div>
  );
};

export default Bookings;
