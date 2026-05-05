import { useState } from 'react';
import { Briefcase, Star, MapPin, Clock, CheckCircle2, XCircle, Filter } from 'lucide-react';

const pastJobs = [
  { id: 101, customer: 'Anjali S.', service: 'Pipe Repair', date: '2026-05-01', amount: 1800, rating: 5.0, status: 'completed', address: 'Gokulam, Mysuru', duration: '2h 15m' },
  { id: 102, customer: 'Rohit M.', service: 'Wiring Fix', date: '2026-04-28', amount: 2400, rating: 4.9, status: 'completed', address: 'Vijayanagar, Mysuru', duration: '3h 30m' },
  { id: 103, customer: 'Priya N.', service: 'Tap Installation', date: '2026-04-25', amount: 1200, rating: 4.8, status: 'completed', address: 'JP Nagar, Mysuru', duration: '1h 45m' },
  { id: 104, customer: 'Karan D.', service: 'Shelf Assembly', date: '2026-04-22', amount: 3200, rating: 5.0, status: 'completed', address: 'Hebbal, Mysuru', duration: '4h' },
  { id: 105, customer: 'Sunil P.', service: 'Fan Installation', date: '2026-04-18', amount: 800, rating: null, status: 'cancelled', address: 'Kuvempunagar, Mysuru', duration: '-' },
  { id: 106, customer: 'Meera A.', service: 'Painting Touch-up', date: '2026-04-15', amount: 4500, rating: 4.7, status: 'completed', address: 'Saraswathipuram, Mysuru', duration: '5h' },
  { id: 107, customer: 'Neha R.', service: 'Drain Cleaning', date: '2026-04-10', amount: 1500, rating: 5.0, status: 'completed', address: 'NR Mohalla, Mysuru', duration: '2h' },
  { id: 108, customer: 'Vikram J.', service: 'Switch Repair', date: '2026-04-05', amount: 600, rating: 3.8, status: 'completed', address: 'Yelwal, Mysuru', duration: '45m' },
];

const formatINR = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

const WorkerJobHistory = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const filtered = statusFilter === 'all' ? pastJobs : pastJobs.filter(j => j.status === statusFilter);
  const totalEarned = pastJobs.filter(j => j.status === 'completed').reduce((s, j) => s + j.amount, 0);
  const totalJobs = pastJobs.filter(j => j.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-5">
          <p className="text-2xl font-black text-slate-900">{totalJobs}</p>
          <p className="text-sm font-semibold text-slate-500 mt-1">Jobs completed</p>
        </div>
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-5">
          <p className="text-2xl font-black text-slate-900">{formatINR(totalEarned)}</p>
          <p className="text-sm font-semibold text-slate-500 mt-1">Total earned</p>
        </div>
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-5">
          <p className="text-2xl font-black text-slate-900">{formatINR(Math.round(totalEarned / totalJobs))}</p>
          <p className="text-sm font-semibold text-slate-500 mt-1">Avg per job</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-slate-400" />
        {['all', 'completed', 'cancelled'].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)} className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${statusFilter === f ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Job List */}
      <div className="space-y-4">
        {filtered.map(job => (
          <div key={job.id} className="bg-white rounded-[1.5rem] border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-black text-slate-900">{job.service}</h4>
                  {job.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-500 mt-1.5">{job.customer}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{job.address}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{job.duration}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xl font-black text-slate-900">{formatINR(job.amount)}</p>
                <p className="text-xs font-bold text-slate-400 mt-1">{new Date(job.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                {job.rating && (
                  <div className="flex items-center gap-1 mt-2 justify-end bg-amber-50 px-2 py-1 rounded-lg inline-flex">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-amber-700">{job.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerJobHistory;
