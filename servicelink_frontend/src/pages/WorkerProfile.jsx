import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Briefcase, CalendarCheck, CheckCircle2, Clock, Languages, MapPin, Phone, ShieldCheck, Sparkles, Star, Timer, Wrench } from 'lucide-react';
import { API_BASE } from '../api/config';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';

const galleryImages = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&h=700&fit=crop',
  'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=900&h=700&fit=crop',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&h=700&fit=crop',
  'https://images.unsplash.com/photo-1513467655676-561b7d489a88?w=900&h=700&fit=crop',
];

const reviewTemplates = [
  { name: 'Anjali S.', rating: 5.0, text: 'Very professional, punctual, and clear about the work. The final finish looked better than expected.' },
  { name: 'Rohit M.', rating: 4.9, text: 'Handled the job with confidence and kept the site clean. I would happily book again.' },
  { name: 'Priya N.', rating: 4.8, text: 'Quick diagnosis, fair pricing, and excellent communication throughout the booking.' },
  { name: 'Karan D.', rating: 5.0, text: 'Arrived on time and completed everything neatly. ServiceLink should highlight pros like this.' },
  { name: 'Meera A.', rating: 4.7, text: 'Reliable worker with strong attention to detail. The experience felt premium and stress-free.' },
];

const WorkerProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  
  const [workerData, setWorkerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = id === 'me' || (user && user.worker && user.worker.id?.toString() === id);

  useEffect(() => {
    const fetchWorker = async () => {
      // For own profile, use auth context data
      if (isOwnProfile) {
        if (user?.worker) {
          setWorkerData({ ...user.worker, user: { name: user.name, city: user.city } });
        }
        setLoading(false);
        return;
      }

      // For other workers, always fetch fresh from API
      try {
        setError('');
        const res = await fetch(`${API_BASE}/workers/${id}/`);
        if (!res.ok) throw new Error('Failed to load worker');
        const data = await res.json();
        setWorkerData(data);
      } catch (err) {
        setError('Unable to load this worker profile right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [id, user, isOwnProfile]);

  const sourceData = workerData || {};

  let workerName = isOwnProfile ? (user?.name || sourceData?.name || sourceData?.user?.name || 'Worker') : (sourceData?.name || sourceData?.user?.name || 'Worker');
  if (workerName === 'Amit Sharma' || workerName === 'Partner') workerName = 'Rajesh Kumar';

  const worker = {
    id: sourceData.id || id,
    name: workerName,
    skill: sourceData.skill || 'Skilled Professional',
    rating: sourceData.rating || 4.8,
    reviews: sourceData.reviews || 96,
    pricePerHour: sourceData.pricePerHour || sourceData.price_per_hour || 500,
    location: sourceData.location || sourceData.city || sourceData.user?.city || user?.city || 'Your city',
    experience: sourceData.experience || '5 years',
    available: sourceData.available ?? sourceData.availability ?? true,
    completedJobs: sourceData.completedJobs || sourceData.completed_jobs || 180,
    languages: sourceData.languages || [],
    specializations: sourceData.specializations || '',
    serviceAreas: sourceData.service_areas || sourceData.serviceAreas || [],
    responseTimeMinutes: sourceData.response_time_minutes || sourceData.responseTimeMinutes || 15,
    isIdVerified: sourceData.is_id_verified ?? sourceData.isIdVerified ?? true,
    workingHoursStart: sourceData.working_hours_start || sourceData.workingHoursStart || null,
    workingHoursEnd: sourceData.working_hours_end || sourceData.workingHoursEnd || null,
    bio: sourceData.bio || sourceData.description || `A highly skilled and verified professional known for punctual work, transparent communication, and clean execution across residential and commercial bookings.`,
  };

  worker.image = sourceData.image || sourceData.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=0f172a&color=34d399&size=256`;
  const languageList = Array.isArray(worker.languages) ? worker.languages.filter(Boolean) : [];
  const specializationList = typeof worker.specializations === 'string'
    ? worker.specializations.split(',').map(item => item.trim()).filter(Boolean)
    : Array.isArray(worker.specializations) ? worker.specializations.filter(Boolean) : [];
  const serviceAreaList = Array.isArray(worker.serviceAreas) ? worker.serviceAreas.filter(Boolean) : [];
  const responseTimeLabel = worker.responseTimeMinutes ? `~${worker.responseTimeMinutes} min` : 'Usually fast';

  // Format working hours from start/end time fields
  const formatTime12h = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = String(timeStr).split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };
  const workingHoursFormatted = worker.workingHoursStart && worker.workingHoursEnd
    ? `${formatTime12h(worker.workingHoursStart)} – ${formatTime12h(worker.workingHoursEnd)}`
    : null;

  const bookNow = () => {
    navigate('/checkout', {
      state: {
        directItem: { ...worker, type: 'WORKER', cartId: `direct-worker-${worker.id}` },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 bg-[#f4f6f5]">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-[1.5rem]" />
            <Skeleton className="h-40 w-full rounded-[1.5rem]" />
          </div>
          <Skeleton className="h-80 w-full rounded-[1.5rem]" />
        </div>
      </div>
    );
  }

  if (error && !isOwnProfile) {
    return (
      <div className="min-h-screen pt-20 px-4 flex items-center justify-center bg-[#f4f6f5]">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md shadow-sm">
          <h1 className="text-xl font-bold text-slate-900">Profile unavailable</h1>
          <p className="text-slate-500 mt-2 text-sm">{error || 'This worker could not be found.'}</p>
          <button onClick={() => navigate('/services')} className="mt-6 px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800">Back to Services</button>
        </div>
      </div>
    );
  }

  const skillTags = [worker.skill, 'Verified Pro', 'On-time Service', 'Clean Finish'];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-[#f4f6f5]">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/services')} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to workers
        </button>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          <div className="space-y-6">
            {/* Header Profile Card */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-slate-900 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center text-white">
                <img src={worker.image} alt={worker.name} className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white/10 shadow-xl shrink-0" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-black">{worker.name}</h1>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold border border-white/10">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {worker.rating}
                    </span>
                    {worker.isIdVerified && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-400/15 text-emerald-200 text-xs font-bold border border-emerald-300/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        ID Verified
                      </span>
                    )}
                  </div>
                  <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 bg-emerald-300 rounded-full px-3 py-1 mt-3">
                    <BadgeCheck className="w-4 h-4" />
                    {worker.skill}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-4 text-sm font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" />{worker.rating} Rating</span>
                    <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-emerald-300" />{worker.completedJobs} Jobs Done</span>
                    <span className="flex items-center gap-1.5"><Timer className="w-4 h-4 text-cyan-300" />{responseTimeLabel}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-rose-300" />{worker.location}</span>
                  </div>
                  {languageList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {languageList.map((language) => (
                        <span key={language} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/10">
                          <Languages className="w-3.5 h-3.5 text-emerald-200" />
                          {language}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-50 border-t border-gray-100 p-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: `${worker.rating} Rating`, icon: Star, color: 'text-amber-600' },
                  { label: `${worker.completedJobs} Jobs Done`, icon: Briefcase, color: 'text-blue-600' },
                  { label: `Responds in ${responseTimeLabel}`, icon: Timer, color: 'text-emerald-600' },
                  { label: worker.location, icon: MapPin, color: 'text-rose-600' },
                ].map(({ label, icon: Icon, color }) => (
                  <div key={label} className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <span className="font-bold text-slate-700 text-xs sm:text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* About & Details */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900">About this professional</h2>
              {worker.bio && (
                <div className="mt-3 rounded-2xl bg-slate-50 border border-gray-100 p-5">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{worker.bio}"</p>
                </div>
              )}

              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gray-100 bg-white p-4">
                  <Timer className="w-5 h-5 text-emerald-500 mb-2" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Response Time</p>
                  <p className="text-sm font-bold text-slate-900 mt-1">Usually responds in {responseTimeLabel}</p>
                </div>
                {workingHoursFormatted && (
                  <div className="rounded-2xl border border-gray-100 bg-white p-4">
                    <Clock className="w-5 h-5 text-blue-500 mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Working Hours</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{workingHoursFormatted}</p>
                  </div>
                )}
              </div>

              {/* Specialization Tags */}
              <div className="flex flex-wrap gap-2 mt-5">
                {[...skillTags, ...specializationList].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages & Service Areas */}
            {(languageList.length > 0 || serviceAreaList.length > 0) && (
              <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6 sm:p-8 grid sm:grid-cols-2 gap-6">
                {languageList.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                      <Languages className="w-4 h-4 text-indigo-500" /> Languages Spoken
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {languageList.map((lang) => (
                        <span key={lang} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {serviceAreaList.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-rose-500" /> Service Areas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {serviceAreaList.map((area) => (
                        <span key={area} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Work Portfolio</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {galleryImages.map((src, index) => (
                  <img key={src} src={src} alt={`Work sample ${index + 1}`} className="h-48 w-full object-cover rounded-2xl border border-gray-100 shadow-sm hover:scale-[1.02] transition-transform duration-300" />
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900">Customer Reviews</h2>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  {worker.rating}/5
                </span>
              </div>
              <div className="space-y-4">
                {reviewTemplates.map((review) => (
                  <article key={review.name} className="p-5 rounded-2xl border border-gray-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-slate-900 text-sm">{review.name}</p>
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {review.rating}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">"{review.text}"</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Booking Sidebar */}
          <aside className="lg:sticky lg:top-24 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between pb-5 border-b border-gray-100">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Service Rate</p>
                <p className="text-3xl font-black text-slate-900">₹{worker.pricePerHour}<span className="text-sm font-bold text-slate-400">/hr</span></p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                <Wrench className="w-6 h-6" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
                <CalendarCheck className="w-5 h-5 text-slate-400 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience</p>
                <p className="font-bold text-slate-900 text-sm">{worker.experience}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-slate-50 p-4">
                <ShieldCheck className="w-5 h-5 text-emerald-500 mb-2" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                <p className="font-bold text-emerald-700 text-sm">{worker.available ? 'Available' : 'Busy'}</p>
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <button 
                onClick={bookNow} 
                disabled={!worker.available || isOwnProfile} 
                className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold shadow-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOwnProfile ? 'This is Your Profile' : 'Book Directly'}
              </button>
              
              {!isOwnProfile && (
                <button 
                  onClick={() => toast.info('Direct call feature is simulated.')} 
                  className="w-full py-4 rounded-xl bg-white border border-gray-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call Partner
                </button>
              )}
            </div>
            
            <div className="mt-5 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                ServiceLink verifies all professionals. You only pay after confirming the booking details.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default WorkerProfile;
