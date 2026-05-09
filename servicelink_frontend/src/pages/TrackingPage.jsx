import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Check, Clock3, Phone, Star, UserRound, XCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const demoBooking = {
  id: 'BK-1042',
  worker: { name: 'Rajesh Kumar', skill: 'Electrician', rating: 4.8, phone: '+91 98765 43210' },
  service: 'Electrical Wiring Repair',
  address: 'Flat 203, Lake View Apartments, Gokulam, Mysuru',
  amount: 2100,
  workerStart: [12.31, 76.65],
  customerPos: [12.2958, 76.6394],
};

const statuses = ['Order Placed', 'Worker Assigned', 'On the Way', 'Arrived', 'Work Started', 'Completed'];

const createIcon = (color, label) => L.divIcon({
  className: '',
  html: `<div style="width:42px;height:42px;border-radius:999px;background:${color};border:4px solid white;box-shadow:0 16px 30px rgba(15,23,42,.3);display:grid;place-items:center;color:white;font-weight:900;font-size:13px;">${label}</div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

const formatINR = (value) => `\u20b9${Number(value).toLocaleString('en-IN')}`;

const TrackingPage = () => {
  const { bookingId } = useParams();
  const toast = useToast();
  const [workerPos, setWorkerPos] = useState(demoBooking.workerStart);
  const [eta, setEta] = useState(18);
  const [activeIndex, setActiveIndex] = useState(2);

  const workerIcon = useMemo(() => createIcon('#10b981', 'W'), []);
  const customerIcon = useMemo(() => createIcon('#0f172a', 'C'), []);

  useEffect(() => {
    const timer = setInterval(() => {
      setWorkerPos(current => {
        const [lat, lng] = current;
        const [targetLat, targetLng] = demoBooking.customerPos;
        const next = [
          lat + (targetLat - lat) * 0.18,
          lng + (targetLng - lng) * 0.18,
        ];
        const arrived = Math.abs(next[0] - targetLat) < 0.00035 && Math.abs(next[1] - targetLng) < 0.00035;
        if (arrived) {
          setActiveIndex(3);
          setEta(0);
          clearInterval(timer);
          return demoBooking.customerPos;
        }
        return next;
      });
      setEta(current => Math.max(1, current - 1));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-white lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen lg:h-screen lg:grid-cols-[390px_1fr]">
        <aside className="relative z-10 bg-slate-900 text-white p-6 lg:p-8 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Live Tracking</p>
              <h1 className="mt-3 text-3xl font-black leading-tight">{demoBooking.service}</h1>
              <p className="mt-2 text-sm font-semibold text-slate-400">Order #{bookingId || demoBooking.id}</p>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-300">
              {formatINR(demoBooking.amount)}
            </span>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-800">
                <UserRound className="h-8 w-8 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-lg font-black">{demoBooking.worker.name}</h2>
                <p className="text-sm font-semibold text-slate-400">{demoBooking.worker.skill}</p>
                <div className="mt-1 flex items-center gap-1 text-sm font-bold text-amber-300">
                  <Star className="h-4 w-4 fill-amber-300" />
                  {demoBooking.worker.rating}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-emerald-400 p-5 text-slate-950">
            <div className="flex items-center gap-3">
              <Clock3 className="h-6 w-6" />
              <div>
                <p className="text-xs font-black uppercase tracking-widest">ETA</p>
                <p className="text-2xl font-black">{eta === 0 ? 'Arrived' : `Arriving in ~${eta} minutes`}</p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-400">Status</h3>
            <div className="mt-5 space-y-4">
              {statuses.map((status, index) => {
                const complete = index < activeIndex;
                const active = index === activeIndex;
                return (
                  <div key={status} className="flex gap-3">
                    <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border ${complete ? 'border-emerald-300 bg-emerald-400 text-slate-950' : active ? 'border-emerald-300 bg-emerald-300/20 text-emerald-200' : 'border-white/15 text-slate-500'}`}>
                      {complete ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                    </div>
                    <div>
                      <p className={`text-sm font-black ${active ? 'text-emerald-200' : complete ? 'text-white' : 'text-slate-500'}`}>{status}</p>
                      {active && <p className="mt-1 text-xs font-semibold text-slate-400">Updated just now</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button onClick={() => toast.success(`Calling ${demoBooking.worker.name}...`)} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-slate-900 transition hover:bg-emerald-50">
              <Phone className="h-4 w-4" />
              Call Worker
            </button>
            <button onClick={() => toast.info('Cancellation request noted for this demo booking.')} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10">
              <XCircle className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </aside>

        <section className="relative min-h-[520px] bg-slate-100">
          <MapContainer center={demoBooking.customerPos} zoom={14} scrollWheelZoom className="h-full min-h-[520px] w-full lg:min-h-screen">
            <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={demoBooking.customerPos} icon={customerIcon} />
            <Marker position={workerPos} icon={workerIcon} />
          </MapContainer>
          <div className="absolute bottom-5 left-5 right-5 z-[500] rounded-3xl bg-white/95 p-4 shadow-2xl backdrop-blur md:left-auto md:w-[430px]">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Destination</p>
            <p className="mt-1 text-sm font-bold leading-6 text-slate-900">{demoBooking.address}</p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default TrackingPage;
