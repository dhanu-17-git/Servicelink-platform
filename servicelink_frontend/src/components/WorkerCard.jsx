import { ArrowRight, BadgeCheck, Briefcase, Clock, MapPin, Star, Heart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useFavourites } from '../context/FavouritesContext';

const WorkerCard = ({ worker }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { toggleFavourite, isFavourite } = useFavourites();
  const [loading, setLoading] = useState(false);

  const openProfile = () => {
    navigate(`/workers/${worker.id}`, { state: { worker } });
  };

  const handleHire = (event) => {
    event.stopPropagation();
    setLoading(true);
    toast.info(`Direct booking ${worker.name}`);
    navigate('/checkout', {
      state: {
        directItem: { ...worker, type: 'WORKER', cartId: `direct-worker-${worker.id}` },
      },
    });
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openProfile}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') openProfile();
      }}
      className="group text-left w-full bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-2xl hover:shadow-orange-900/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      <div className="relative p-6 pb-4">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-orange-50 via-white to-primary-50 opacity-80" />
        <button
          onClick={(e) => { e.stopPropagation(); toggleFavourite(worker.id); }}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 transition-all z-10"
        >
          <Heart className={`w-4 h-4 transition-colors ${isFavourite(worker.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
        </button>
        <span
          className={`absolute top-4 right-4 px-2.5 py-1 text-xs font-bold rounded-full backdrop-blur-sm ${
            worker.available
              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              : 'bg-gray-50 text-gray-500 ring-1 ring-gray-200'
          }`}
        >
          {worker.available ? 'Available' : 'Busy'}
        </span>

        <div className="relative flex items-start gap-4">
          <div className="relative">
            <img
              src={worker.image}
              alt={worker.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg group-hover:ring-primary-100 transition-all duration-300"
            />
            {worker.available && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-heading text-base truncate group-hover:text-[#D2691E] transition-colors">
              {worker.name}
            </h3>
            <p className="text-sm text-[#D2691E] font-semibold mt-0.5 flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-primary-600" />
              {worker.skill}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold text-heading">{worker.rating}</span>
              <span className="text-xs text-muted">({worker.reviews} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-3 flex flex-wrap gap-x-4 gap-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="w-3.5 h-3.5" />
          {worker.location}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Clock className="w-3.5 h-3.5" />
          {worker.experience}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Briefcase className="w-3.5 h-3.5" />
          {worker.completedJobs} jobs
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/50">
        <div>
          <span className="text-lg font-bold text-heading">₹{worker.pricePerHour}</span>
          <span className="text-xs text-muted">/hour</span>
        </div>
        <button
          onClick={handleHire}
          className={`px-5 py-2 text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 ${
            worker.available && !loading
              ? 'bg-gradient-to-r from-primary-600 to-blue-500 text-white hover:shadow-lg hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          disabled={!worker.available || loading}
        >
          {worker.available ? <>Book Now <ArrowRight className="w-4 h-4" /></> : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default WorkerCard;
