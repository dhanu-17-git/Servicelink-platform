import { useEffect, useState } from 'react';
import { Bell, Camera, Home, Loader2, Mail, MapPin, Phone, Save, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { API_BASE, authHeaders } from '../../api/config';
import Skeleton from '../Skeleton';
import AddressManager from '../AddressManager';

const Field = ({ label, icon: Icon, className = '', ...props }) => (
  <div className={className}>
    <label className="block text-sm font-black text-heading mb-2">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600" />
      <input
        {...props}
        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold text-heading placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-300 transition-all"
      />
    </div>
  </div>
);

const Profile = () => {
  const { user: authUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    landmark: '',
    pincode: '',
    preferredTime: 'Morning',
    instructions: '',
    notifications: true,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/profile`, {
          headers: authHeaders(),
        });
        const data = res.ok ? await res.json() : authUser || {};
        setProfile(current => ({
          ...current,
          name: data.name || authUser?.name || '',
          email: data.email || authUser?.email || '',
          phone: data.phone || authUser?.phone || '',
          address: data.address || authUser?.address || '',
          city: data.city || authUser?.city || '',
          pincode: data.pincode || authUser?.pincode || '',
        }));
      } catch (err) {
        setProfile(current => ({
          ...current,
          name: authUser?.name || '',
          email: authUser?.email || '',
          phone: authUser?.phone || '',
          address: authUser?.address || '',
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const updateField = (field, value) => {
    setProfile(current => ({ ...current, [field]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        pincode: profile.pincode,
      };

      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data.detail || Object.values(data).flat().join(', ') || 'Failed to update profile';
        throw new Error(msg);
      }

      toast.success('Profile details saved');
    } catch (err) {
      toast.info(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-44 w-full rounded-[2rem]" />
        <Skeleton className="h-96 w-full rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="animate-reveal space-y-8">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-primary-900 to-blue-700 p-6 md:p-8 text-white shadow-2xl shadow-blue-900/20">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-24 h-24 rounded-[1.75rem] bg-white/15 backdrop-blur-xl flex items-center justify-center text-white text-4xl font-black border border-white/20 shadow-2xl overflow-hidden">
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
              <button type="button" className="absolute -bottom-2 -right-2 p-2 bg-white text-primary-600 rounded-xl shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div>
              <p className="text-sm font-black text-blue-100">Customer Profile</p>
              <h1 className="text-3xl font-black mt-1">{profile.name || 'Complete your profile'}</h1>
              <p className="text-blue-100 mt-2">Manage contact details, addresses, and service preferences.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[240px]">
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <ShieldCheck className="w-5 h-5 text-emerald-300 mb-2" />
              <p className="text-xs text-blue-100">Trust Level</p>
              <p className="font-black">Verified</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
              <Bell className="w-5 h-5 text-amber-300 mb-2" />
              <p className="text-xs text-blue-100">Alerts</p>
              <p className="font-black">{profile.notifications ? 'On' : 'Off'}</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-card p-6 md:p-8 space-y-8">
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-black text-heading">Personal Details</h2>
              <p className="text-sm text-muted mt-1">These details help workers contact you and confirm bookings faster.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Full Name" icon={User} value={profile.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Your full name" />
              <Field label="Email Address" icon={Mail} type="email" value={profile.email} onChange={(e) => updateField('email', e.target.value)} placeholder="you@example.com" />
              <Field label="Mobile Number" icon={Phone} value={profile.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="9876543210" />
              <Field label="Alternate Number" icon={Phone} value={profile.alternatePhone} onChange={(e) => updateField('alternatePhone', e.target.value)} placeholder="Optional" />
            </div>
          </section>

          <section>
            <div className="mb-5">
              <h2 className="text-xl font-black text-heading">Address Details</h2>
              <p className="text-sm text-muted mt-1">Add a precise service address so partners can navigate without extra calls.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="House / Flat / Street" icon={Home} value={profile.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Flat 203, Lake View Apartments" className="md:col-span-2" />
              <Field label="City" icon={MapPin} value={profile.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Mumbai" />
              <Field label="Pincode" icon={MapPin} value={profile.pincode} onChange={(e) => updateField('pincode', e.target.value)} placeholder="400001" />
              <Field label="Landmark" icon={MapPin} value={profile.landmark} onChange={(e) => updateField('landmark', e.target.value)} placeholder="Near metro station" className="md:col-span-2" />
            </div>
          </section>

          <section>
            <div className="mb-5">
              <h2 className="text-xl font-black text-heading">Saved Addresses</h2>
              <p className="text-sm text-muted mt-1">Manage multiple service addresses for quick booking.</p>
            </div>
            <AddressManager />
          </section>

          <section>
            <div className="mb-5">
              <h2 className="text-xl font-black text-heading">Service Preferences</h2>
              <p className="text-sm text-muted mt-1">Small details that make every booking smoother.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-black text-heading mb-2">Preferred Visit Time</label>
                <select value={profile.preferredTime} onChange={(e) => updateField('preferredTime', e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/40">
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                  <option>Anytime</option>
                </select>
              </div>
              <div className="rounded-2xl bg-primary-50 border border-primary-100 p-4 flex items-center justify-between">
                <div>
                  <p className="font-black text-heading">Booking Alerts</p>
                  <p className="text-xs text-muted mt-1">Receive updates for confirmations and arrivals.</p>
                </div>
                <button type="button" onClick={() => updateField('notifications', !profile.notifications)} className={`w-12 h-7 rounded-full p-1 transition-colors ${profile.notifications ? 'bg-primary-600' : 'bg-gray-300'}`}>
                  <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${profile.notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-heading mb-2">Instructions for Workers</label>
                <textarea value={profile.instructions} onChange={(e) => updateField('instructions', e.target.value)} rows="4" placeholder="Example: Please call before arriving, parking is available near Gate 2." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-none" />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-card p-6 sticky top-24">
            <h3 className="text-lg font-black text-heading">Profile Strength</h3>
            <p className="text-sm text-muted mt-1">Complete details improve booking reliability.</p>
            <div className="mt-5 h-3 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-primary-600 to-cyan-400" />
            </div>
            <p className="mt-2 text-sm font-black text-primary-600">86% complete</p>
            <div className="mt-6 space-y-3 text-sm">
              {['Mobile number added', 'Primary address saved', 'Booking alerts enabled'].map(item => (
                <div key={item} className="flex items-center gap-2 font-bold text-heading">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {item}
                </div>
              ))}
            </div>
            <button type="submit" disabled={saving} className="mt-6 w-full py-4 bg-gradient-to-r from-primary-600 to-blue-500 text-white font-black rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Profile</>}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default Profile;
