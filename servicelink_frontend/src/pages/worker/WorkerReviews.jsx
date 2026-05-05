import { Star, CheckCircle2, Filter, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useState } from 'react';

const allReviews = [
  { id: 1, name: 'Anjali S.', rating: 5.0, text: 'Very professional, punctual, and clear about the work. The final finish looked better than expected.', date: '2026-05-01', service: 'Plumbing' },
  { id: 2, name: 'Rohit M.', rating: 4.9, text: 'Handled the job with confidence and kept the site clean. I would happily book again.', date: '2026-04-28', service: 'Electrical' },
  { id: 3, name: 'Priya N.', rating: 4.8, text: 'Quick diagnosis, fair pricing, and excellent communication throughout the booking.', date: '2026-04-25', service: 'Plumbing' },
  { id: 4, name: 'Karan D.', rating: 5.0, text: 'Arrived on time and completed everything neatly. Highly recommended for any home repair.', date: '2026-04-22', service: 'Carpentry' },
  { id: 5, name: 'Meera A.', rating: 4.7, text: 'Reliable worker with strong attention to detail. The experience felt premium and stress-free.', date: '2026-04-18', service: 'Painting' },
  { id: 6, name: 'Sunil P.', rating: 4.5, text: 'Good work overall. Could improve slightly on time management but quality was great.', date: '2026-04-15', service: 'Electrical' },
  { id: 7, name: 'Neha R.', rating: 5.0, text: 'Exceptional service. Very transparent about costs upfront and delivered exactly as promised.', date: '2026-04-10', service: 'Plumbing' },
  { id: 8, name: 'Vikram J.', rating: 3.8, text: 'Decent work but arrived 30 minutes late. The actual repair was fine though.', date: '2026-04-05', service: 'Electrical' },
];

const WorkerReviews = () => {
  const [filter, setFilter] = useState('all');
  const avg = (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1);
  const fiveStars = allReviews.filter(r => r.rating >= 4.8).length;

  const filtered = filter === 'all' ? allReviews
    : filter === 'high' ? allReviews.filter(r => r.rating >= 4.5)
    : allReviews.filter(r => r.rating < 4.5);

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-5 text-center">
          <p className="text-3xl font-black text-slate-900">{avg}</p>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(avg) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />)}
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wider">Average rating</p>
        </div>
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-5 text-center">
          <p className="text-3xl font-black text-slate-900">{allReviews.length}</p>
          <p className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wider">Total reviews</p>
        </div>
        <div className="bg-white rounded-[1.5rem] border border-gray-100 p-5 text-center">
          <p className="text-3xl font-black text-emerald-600">{fiveStars}</p>
          <p className="text-xs font-semibold text-slate-500 mt-2 uppercase tracking-wider">5-star reviews</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-slate-400" />
        {[
          { key: 'all', label: 'All' },
          { key: 'high', label: '4.5+ Stars' },
          { key: 'low', label: 'Below 4.5' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === f.key ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filtered.map(review => (
          <div key={review.id} className="bg-white rounded-[1.5rem] border border-gray-100 p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-lg font-black text-slate-600">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-slate-900">{review.name}</p>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">{review.service} · {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-black text-amber-700">{review.rating}</span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkerReviews;
