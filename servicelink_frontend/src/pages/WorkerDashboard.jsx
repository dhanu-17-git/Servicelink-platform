import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, BadgeCheck, Briefcase, Calendar, CheckCircle2, Clock, HelpCircle, Loader2, MapPin, Navigation, Phone, Power, Route, ShieldCheck, Sparkles, UserRound, X, XCircle } from 'lucide-react';
import { API_BASE, authHeaders } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import Skeleton from '../components/Skeleton';

import WorkerCalendar from './worker/WorkerCalendar';
import WorkerInsights from './worker/WorkerInsights';
import WorkerPartnerHub from './worker/WorkerPartnerHub';
import WorkerReviews from './worker/WorkerReviews';
import WorkerJobHistory from './worker/WorkerJobHistory';
import ChatDrawer from '../components/ChatDrawer';

const TABS = [
  { key: 'jobs', label: 'Jobs', icon: Briefcase },
  { key: 'hub', label: 'Partner Hub', icon: Sparkles },
  { key: 'insights', label: 'Insights', icon: ShieldCheck },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
  { key: 'history', label: 'History', icon: Clock },
  { key: 'reviews', label: 'Reviews', icon: CheckCircle2 },
];

const stageConfig = [
  { key: 'pending', label: 'Accept' },
  { key: 'confirmed', label: 'Navigate' },
  { key: 'navigating', label: 'Arrived' },
  { key: 'arrived', label: 'Work' },
  { key: 'working', label: 'Complete' },
  { key: 'completed', label: 'Done' },
];

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  confirmed: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  navigating: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  arrived: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  working: 'bg-fuchsia-50 text-fuchsia-700 ring-1 ring-fuchsia-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  cancelled: 'bg-red-50 text-red-700 ring-1 ring-red-200',
};

const formatCurrency = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;
const getCustomerName = (b) => b.user?.name || b.user?.email || 'Customer';
const getStage = (b) => b.localStage || b.status || 'pending';
const getStageIndex = (s) => { const i = stageConfig.findIndex(c => c.key === s); return i === -1 ? 0 : i; };
const getMapsUrl = (addr) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr || 'India')}`;

const Timeline = ({ stage }) => {
  const idx = getStageIndex(stage);
  return (
    <div className="grid grid-cols-5 gap-2">
      {stageConfig.slice(0, 5).map((item, i) => (
        <div key={item.key}>
          <div className={`h-2 rounded-full ${idx >= i ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-slate-200'}`} />
          <p className={`mt-1.5 text-[10px] sm:text-xs font-semibold truncate ${idx >= i ? 'text-slate-800' : 'text-slate-400'}`}>{item.label}</p>
        </div>
      ))}
    </div>
  );
};

const WorkerDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { addNotification } = useNotifications();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [showSupport, setShowSupport] = useState(false);
  const [chatBooking, setChatBooking] = useState(null);

  // Use actual worker name from auth
  const workerName = user?.name || user?.worker?.name || 'Worker';

  const ownWorkerId = user?.worker_id || user?.worker?.id || bookings.find(b => b.worker?.id)?.worker?.id || user?.id;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setError('');
        const res = await fetch(`${API_BASE}/bookings/worker`, { headers: authHeaders() });
        if (!res.ok) throw new Error('Failed to load worker bookings');
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        setBookings(list.map(b => ({ ...b, localStage: b.status })));
      } catch { setError('Failed to load jobs. Please check that the backend server is running.'); }
      finally { setLoading(false); }
    };
    fetchBookings();
  }, []);

  const patchStatus = async (id, status) => {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
    if (!res.ok) { const d = await res.json(); throw new Error(d.detail || Object.values(d).flat().join(', ') || 'Failed'); }
  };

  const updateLocal = (id, updates) => {
    setBookings(cur => cur.map(b => b.id === id ? { ...b, ...updates } : b));
    setSelectedJob(cur => cur?.id === id ? { ...cur, ...updates } : cur);
  };

  const handleStage = async (booking) => {
    const stage = getStage(booking);
    setUpdatingId(booking.id);
    try {
      if (stage === 'pending') {
        await patchStatus(booking.id, 'confirmed');
        updateLocal(booking.id, { status: 'confirmed' });
        addNotification({ type: 'worker', title: 'Job Accepted', message: `You accepted job #${booking.id} from ${getCustomerName(booking)}.` });
        toast.success('Job accepted.');
      } else if (stage === 'confirmed') {
        await patchStatus(booking.id, 'navigating');
        window.open(getMapsUrl(booking.address), '_blank', 'noopener,noreferrer');
        updateLocal(booking.id, { status: 'navigating' });
        toast.success('Navigation started.');
      } else if (stage === 'navigating') {
        await patchStatus(booking.id, 'arrived');
        updateLocal(booking.id, { status: 'arrived' });
        toast.success('Marked arrived.');
      } else if (stage === 'arrived') {
        await patchStatus(booking.id, 'working');
        updateLocal(booking.id, { status: 'working' });
        toast.success('Started work.');
      } else if (stage === 'working') {
        await patchStatus(booking.id, 'completed');
        updateLocal(booking.id, { status: 'completed' });
        toast.success('Job completed!');
      }
    } catch (err) { toast.info(err.message); }
    finally { setUpdatingId(null); }
  };

  const rejectBooking = async (booking) => {
    setUpdatingId(booking.id);
    try {
      await patchStatus(booking.id, 'cancelled');
      updateLocal(booking.id, { status: 'cancelled', localStage: 'cancelled' });
      toast.success('Job rejected');
    } catch (err) { toast.info(err.message); }
    finally { setUpdatingId(null); }
  };

  const removeBooking = (id) => {
    setBookings(cur => cur.filter(b => b.id !== id));
    if (selectedJob?.id === id) setSelectedJob(null);
  };

  const callCustomer = (b) => {
    const phone = b.user?.phone || b.user?.mobile || '';
    if (phone) window.location.href = `tel:${phone}`;
    else toast.info(`No phone number available for ${getCustomerName(b)}.`);
  };

  const navigateToClient = (b) => {
    window.open(getMapsUrl(b.address), '_blank', 'noopener,noreferrer');
    if (getStage(b) === 'confirmed') updateLocal(b.id, { localStage: 'navigating' });
  };

  const stats = [
    { title: "Today's Jobs", value: bookings.filter(b => b.status !== 'cancelled').length, color: 'bg-slate-900 text-white' },
    { title: 'To Accept', value: bookings.filter(b => getStage(b) === 'pending').length, color: 'bg-amber-50 text-amber-600' },
    { title: 'Active', value: bookings.filter(b => ['confirmed', 'navigating', 'arrived', 'working'].includes(getStage(b))).length, color: 'bg-blue-50 text-blue-600' },
    { title: 'Done', value: bookings.filter(b => b.status === 'completed').length, color: 'bg-emerald-50 text-emerald-600' },
  ];

  if (loading) return (
    <div className="min-h-screen pt-24 pb-16 bg-[#f4f6f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    </div>
  );

  const getActionLabel = (stage) => {
    switch (stage) {
      case 'pending': return 'Accept Job';
      case 'confirmed': return 'Start Navigation';
      case 'navigating': return 'Mark Arrived';
      case 'arrived': return 'Start Work';
      case 'working': return 'Mark as Completed';
      default: return 'Done';
    }
  };

  const renderJobs = () => (
    <>
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.title} className="bg-white rounded-[1.5rem] border border-gray-100 p-5 hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${s.color}`}>{s.value}</div>
            <p className="text-sm text-slate-500 mt-3 font-semibold">{s.title}</p>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-[1.5rem] border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Active Queue</h2>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">Live</span>
        </div>
        {bookings.length === 0 ? (
          <div className="p-16 text-center">
            <Sparkles className={`w-12 h-12 mx-auto mb-4 ${isOnline ? 'text-emerald-500' : 'text-slate-300'}`} />
            <p className="text-lg font-bold text-slate-900">{isOnline ? 'Waiting for jobs...' : 'You are offline'}</p>
            <p className="text-sm text-slate-500 mt-2">{isOnline ? 'New requests will appear here.' : 'Go online to receive jobs.'}</p>
          </div>
        ) : (
          <div className="p-5 grid xl:grid-cols-2 gap-4">
            {bookings.map(booking => {
              const stage = getStage(booking);
              const isUpdating = updatingId === booking.id;
              return (
                <article key={booking.id} onClick={() => setSelectedJob(booking)} className="rounded-2xl border border-gray-100 bg-slate-50/50 p-5 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-bold text-slate-900">{getCustomerName(booking)}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusStyles[stage] || statusStyles.pending}`}>{stage}</span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-500" />{booking.address || 'Address pending'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">{formatCurrency(booking.total_price)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">#{booking.id}</p>
                    </div>
                  </div>
                  <div className="mt-4"><Timeline stage={stage} /></div>
                  {stage !== 'cancelled' && (
                    <div className="flex gap-2 mt-5">
                      <button onClick={e => { e.stopPropagation(); callCustomer(booking); }} className="flex-1 py-2.5 rounded-xl bg-white border border-gray-200 text-slate-700 text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />Call
                      </button>
                      <button onClick={e => { e.stopPropagation(); setChatBooking(booking); }} className="flex-1 py-2.5 rounded-xl bg-white border border-gray-200 text-slate-700 text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                        Chat
                      </button>
                      <button onClick={e => { e.stopPropagation(); navigateToClient(booking); }} className="flex-1 py-2.5 rounded-xl bg-white border border-gray-200 text-slate-700 text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5" />Maps
                      </button>
                    </div>
                  )}
                  <div className="flex gap-3 mt-3">
                    {stage !== 'completed' && stage !== 'cancelled' && (
                      <button onClick={e => { e.stopPropagation(); handleStage(booking); }} disabled={isUpdating} className="flex-1 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                        {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : (stage === 'working' ? <CheckCircle2 className="w-4 h-4" /> : <Route className="w-4 h-4" />)}
                        {getActionLabel(stage)}
                      </button>
                    )}
                    {stage === 'pending' && (
                      <button onClick={e => { e.stopPropagation(); rejectBooking(booking); }} disabled={isUpdating} className="py-3 px-5 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                        <XCircle className="w-4 h-4" />Reject
                      </button>
                    )}
                    {(stage === 'cancelled' || stage === 'completed') && (
                      <button onClick={e => { e.stopPropagation(); removeBooking(booking.id); }} className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                        <X className="w-4 h-4" />{stage === 'completed' ? 'Clear Job' : 'Remove Order'}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#f4f6f5]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="bg-slate-900 rounded-[2rem] p-6 md:p-8 mb-6 text-white mt-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div>
              <button onClick={() => setIsOnline(!isOnline)} className={`text-sm font-bold mb-3 flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isOnline ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                <Power className={`w-4 h-4 ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`} />
                {isOnline ? 'Online' : 'Offline'}
              </button>
              <h1 className="text-2xl md:text-3xl font-black">Welcome, {workerName}</h1>
              <p className="text-slate-400 text-sm mt-2">Manage your operations from one place.</p>
            </div>
            <div className="flex items-center gap-3">
              {ownWorkerId && (
                <Link to={`/workers/${ownWorkerId}`} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-400 text-slate-900 text-sm font-bold hover:bg-emerald-300 transition-colors">
                  Public Profile<ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-50 border border-gray-100 hover:text-slate-900'}`}>
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'jobs' && renderJobs()}
        {activeTab === 'hub' && <WorkerPartnerHub />}
        {activeTab === 'insights' && <WorkerInsights />}
        {activeTab === 'calendar' && <WorkerCalendar />}
        {activeTab === 'history' && <WorkerJobHistory />}
        {activeTab === 'reviews' && <WorkerReviews />}
      </main>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />
          <div className="relative w-full md:max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="bg-slate-900 text-white p-6 md:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-emerald-300 text-xs font-bold">Job #{selectedJob.id}</p>
                  <h2 className="text-2xl font-black mt-2">{getCustomerName(selectedJob)}</h2>
                </div>
                <button onClick={() => setSelectedJob(null)} className="p-2 rounded-xl hover:bg-white/10"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-6 md:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="rounded-2xl bg-slate-50 p-4"><Timeline stage={getStage(selectedJob)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Date</p>
                  <p className="text-base font-bold text-slate-900 mt-1">{selectedJob.date || 'Pending'}</p>
                </div>
                <div className="rounded-2xl border border-gray-100 p-4">
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Earnings</p>
                  <p className="text-base font-bold text-slate-900 mt-1">{formatCurrency(selectedJob.total_price)}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Address</p>
                <p className="text-base font-bold text-slate-900 mt-1">{selectedJob.address || 'Pending'}</p>
              </div>
              {getStage(selectedJob) !== 'cancelled' && getStage(selectedJob) !== 'completed' && (
                <div className="grid grid-cols-3 gap-3">
                  <button onClick={() => callCustomer(selectedJob)} className="py-3 rounded-xl bg-white border border-gray-200 text-sm font-bold text-slate-900 flex items-center justify-center gap-2 hover:bg-gray-50"><Phone className="w-4 h-4" />Call</button>
                  <button onClick={() => { setChatBooking(selectedJob); setSelectedJob(null); }} className="py-3 rounded-xl bg-slate-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-800">Chat</button>
                  <button onClick={() => navigateToClient(selectedJob)} className="py-3 rounded-xl bg-white border border-gray-200 text-sm font-bold text-slate-900 flex items-center justify-center gap-2 hover:bg-gray-50"><Navigation className="w-4 h-4" />Nav</button>
                </div>
              )}
              {(getStage(selectedJob) === 'cancelled' || getStage(selectedJob) === 'completed') && (
                <button onClick={() => removeBooking(selectedJob.id)} className="w-full py-4 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <X className="w-5 h-5" />{getStage(selectedJob) === 'completed' ? 'Clear Job' : 'Remove Order'}
                </button>
              )}
              {getStage(selectedJob) !== 'completed' && getStage(selectedJob) !== 'cancelled' && (
                <button onClick={() => handleStage(selectedJob)} disabled={updatingId === selectedJob.id} className="w-full py-4 rounded-xl bg-emerald-500 text-slate-900 text-sm font-black hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
                  {updatingId === selectedJob.id ? <Loader2 className="w-5 h-5 animate-spin" /> : (getStage(selectedJob) === 'working' ? <CheckCircle2 className="w-5 h-5" /> : <Route className="w-5 h-5" />)}
                  {getActionLabel(getStage(selectedJob))}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Support FAB */}
      <button onClick={() => setShowSupport(!showSupport)} className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-slate-800 transition-colors z-50">
        <HelpCircle className="w-6 h-6" />
      </button>
      {showSupport && (
        <div className="fixed bottom-24 right-8 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50">
          <h3 className="text-base font-bold text-slate-900 mb-2">Need Help?</h3>
          <p className="text-sm text-slate-500 mb-4">Reach out to our support team for any issues.</p>
          <div className="space-y-3">
            <button className="w-full py-3 rounded-xl bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">Payment Issue</button>
            <button className="w-full py-3 rounded-xl bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">Job Dispute</button>
            <button className="w-full py-3 rounded-xl bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors">App Problem</button>
            <button className="w-full py-3 rounded-xl bg-emerald-500 text-sm font-bold text-slate-900 hover:bg-emerald-400 transition-colors">Chat with Support</button>
          </div>
        </div>
      )}

      {/* Chat Drawer */}
      <ChatDrawer isOpen={!!chatBooking} onClose={() => setChatBooking(null)} booking={chatBooking || {}} />
    </div>
  );
};

export default WorkerDashboard;
