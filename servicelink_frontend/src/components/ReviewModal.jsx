import { useEffect, useState } from 'react';
import { Check, Loader2, Star, X } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useToast } from '../context/ToastContext';

const tags = ['On Time', 'Professional', 'Clean Work', 'Good Value', 'Friendly', 'Would Rebook'];

const ReviewModal = ({ isOpen, onClose, booking }) => {
  const toast = useToast();
  const { addNotification } = useNotifications();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [review, setReview] = useState('');
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHovered(0);
      setSelectedTags([]);
      setReview('');
      setStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const workerName = booking?.worker?.name || booking?.worker || 'your professional';
  const service = booking?.service || 'Service booking';

  const toggleTag = (tag) => {
    setSelectedTags(current => current.includes(tag) ? current.filter(item => item !== tag) : [...current, tag]);
  };

  const submitReview = () => {
    setStatus('loading');
    setTimeout(() => {
      setStatus('success');
      toast.success('Review submitted! Thank you.');
      addNotification({ title: 'Review Submitted', message: `Your review for ${service} has been saved.` });
      setTimeout(onClose, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-reveal">
        {status === 'success' && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 18 }).map((_, index) => (
              <span key={index} className="review-confetti absolute h-2 w-2 rounded-full bg-emerald-400" style={{ left: `${8 + index * 5}%`, animationDelay: `${index * 35}ms` }} />
            ))}
          </div>
        )}
        <div className="bg-slate-900 p-6 pb-8 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-300">Rate Service</p>
              <h2 className="mt-2 text-2xl font-black">{service}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-400">Worker: {workerName}</p>
            </div>
            <button onClick={onClose} className="rounded-xl bg-white/10 p-2 transition hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="-mt-4 rounded-t-[2rem] bg-white p-6">
          {status === 'success' ? (
            <div className="py-10 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <Check className="h-10 w-10" />
              </div>
              <h3 className="mt-5 text-2xl font-black text-slate-950">Thank you</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">Your feedback helps keep ServiceLink quality high.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(value => (
                  <button key={value} onMouseEnter={() => setHovered(value)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(value)} className="rounded-2xl p-2 text-amber-400 transition hover:bg-amber-50">
                    <Star className="h-9 w-9" fill={(hovered || rating) >= value ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)} className={`rounded-full border px-4 py-2 text-sm font-black transition ${selectedTags.includes(tag) ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                    {tag}
                  </button>
                ))}
              </div>

              <textarea value={review} onChange={(event) => setReview(event.target.value)} placeholder="Tell us about your experience..." className="mt-5 h-32 w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" />

              <button onClick={submitReview} disabled={!rating || status === 'loading'} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300">
                {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
                Submit Review
              </button>
            </>
          )}
        </div>
        <style>{`@keyframes reviewConfetti{0%{transform:translateY(-20px) rotate(0);opacity:1}100%{transform:translateY(560px) rotate(540deg);opacity:0}}.review-confetti{top:-12px;animation:reviewConfetti 1.4s ease-in forwards}`}</style>
      </div>
    </div>
  );
};

export default ReviewModal;
