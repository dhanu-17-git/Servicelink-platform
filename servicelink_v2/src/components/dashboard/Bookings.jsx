import { useState } from 'react';
import { Calendar, Clock, MapPin, Tag, X, User, IndianRupee } from 'lucide-react';

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

  return (
    <div className="animate-reveal">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-heading">My Bookings</h1>
        <p className="text-muted text-sm mt-1">Track and manage your service and tool requests.</p>
      </div>

      <div className="space-y-4">
        {bookings.length > 0 ? bookings.map((b) => (
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

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
