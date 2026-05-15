import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Menu, Calendar, Briefcase, Wrench, IndianRupee, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Skeleton from '../components/Skeleton';
import { API_BASE, authHeaders } from '../api/config';

// Sub-components
import Overview from '../components/dashboard/Overview';
import Bookings from '../components/dashboard/Bookings';
import Profile from '../components/dashboard/Profile';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${API_BASE}/bookings/user`, {
          headers: authHeaders(),
        });

        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        // Django returns a list (or paginated { results: [...] })
        const bookingList = Array.isArray(data) ? data : data.results || [];

        // Map Django snake_case to frontend format
        const formatted = bookingList.map(b => ({
          id: b.id,
          service: b.worker?.skill || b.tool?.name || 'Service',
          worker: b.worker?.name || '—',
          date: b.date,
          time: b.time,
          status: b.status,
          amount: b.total_price,
          bookingType: b.booking_type,
          address: b.address,
          createdAt: b.created_at,
          changeRequestStatus: b.change_request_status,
          changeRequestField: b.change_request_field,
          changeRequestValue: b.change_request_value,
        }));

        setBookings(formatted);
      } catch (err) {
        setError('Failed to load bookings. Is the server running?');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const stats = [
    { title: "Total Bookings", value: bookings.length, icon: "Calendar", color: "bg-blue-50 text-blue-600" },
    { title: "Pending", value: bookings.filter(b => b.status === 'pending').length, icon: "Briefcase", color: "bg-amber-50 text-amber-600" },
    { title: "Active", value: bookings.filter(b => b.status === 'confirmed').length, icon: "Wrench", color: "bg-purple-50 text-purple-600" },
    { title: "Completed", value: bookings.filter(b => b.status === 'completed').length, icon: "IndianRupee", color: "bg-emerald-50 text-emerald-600" },
  ];

  if (loading) return (
    <div className="min-h-screen pt-24 bg-gray-50/50">
      <div className="max-w-6xl mx-auto px-4 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(item => <Skeleton key={item} className="h-36 w-full" />)}
        </div>
        <Skeleton className="h-80 w-full rounded-[2rem]" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-16 bg-gray-50/50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-[calc(100vh-4rem)]">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden mb-6 p-2.5 rounded-xl bg-white border border-gray-100 hover:bg-gray-50 text-muted shadow-sm transition-all">
          <Menu className="w-5 h-5" />
        </button>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-reveal">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <Routes>
          <Route path="/" element={<Overview bookings={bookings} stats={stats} />} />
          <Route path="/bookings" element={<Bookings bookings={bookings} />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
