import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Eye, EyeOff, Hammer, Loader2, Lock, Mail, Phone, ShieldCheck, User, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_BASE } from '../api/config';
import { playSuccessPing } from '../utils/sound';
import logo from '../../images/logo.jpeg';

const roleConfig = {
  user: {
    label: 'Hire Service',
    headline: 'Create your trusted hiring account.',
    note: 'Browse workers, rent tools, and track bookings from one polished dashboard.',
    accent: 'from-primary-600 to-blue-500',
    icon: Users,
  },
  worker: {
    label: 'Join as Partner',
    headline: 'Launch your professional worker profile.',
    note: 'Get discovered by customers and manage job requests with confidence.',
    accent: 'from-emerald-600 to-cyan-500',
    icon: BriefcaseBusiness,
  },
};

const Field = ({ label, name, type = 'text', icon: Icon, placeholder, value, onChange, error, show, setShow }) => (
  <div>
    <label className="block text-sm font-semibold text-heading mb-1.5">{label}</label>
    <div className={`flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl border ${error ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'} focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all`}>
      <Icon className="w-5 h-5 text-gray-400" />
      <input type={type === 'password' ? (show ? 'text' : 'password') : type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full bg-transparent text-sm focus:outline-none" />
      {type === 'password' && (
        <button type="button" onClick={() => setShow(!show)} className="text-gray-400 hover:text-gray-600">
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Register = () => {
  const [role, setRole] = useState('user');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', skill: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const active = roleConfig[role];
  const ActiveIcon = active.icon;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone) e.phone = 'Phone is required';
    else if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter 10-digit number';
    if (role === 'worker' && !form.skill.trim()) e.skill = 'Primary skill is required';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords don\'t match';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        is_worker: role === 'worker',
      };

      if (role === 'worker') {
        payload.skill = form.skill;
      }

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(role === 'worker' ? 'Partner profile created!' : 'Welcome to ServiceLink!');
        playSuccessPing();
        login({ ...data.user, is_worker: role === 'worker' || data.user?.is_worker }, data.access, data.refresh);
      } else {
        const msg = data.detail
          || Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ')
          || 'Registration failed';
        setErrors({ general: msg });
      }
    } catch (err) {
      setErrors({ general: 'Server connection failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen px-4 pt-24 pb-12 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.14),_transparent_34%),linear-gradient(135deg,#f8fbff_0%,#ffffff_48%,#eef7ff_100%)] ${role === 'worker' ? 'bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_34%),linear-gradient(135deg,#f5fffb_0%,#ffffff_48%,#eefbff_100%)]' : ''}`}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-center">
        <form onSubmit={handleSubmit} className="relative overflow-hidden bg-white/85 backdrop-blur-2xl rounded-[2rem] border border-white shadow-2xl shadow-blue-900/10 p-6 md:p-8 space-y-4">
          <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${active.accent}`} />
          <div className="flex rounded-2xl bg-gray-100 p-1 mb-2">
            {Object.entries(roleConfig).map(([key, item]) => {
              const Icon = item.icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRole(key)}
                  className={`flex-1 rounded-xl px-3 py-3 text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === key ? `bg-white shadow-md ${key === 'worker' ? 'text-emerald-700' : 'text-primary-700'}` : 'text-muted hover:text-heading'}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-heading">{active.headline}</h1>
            <p className="text-sm text-muted mt-1">{active.note}</p>
          </div>

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {errors.general}
            </div>
          )}
          <Field label="Full Name" name="name" icon={User} placeholder="Rajesh Kumar" value={form.name} onChange={(name, val) => setForm({ ...form, [name]: val })} error={errors.name} />
          <Field label="Email" name="email" type="email" icon={Mail} placeholder="you@example.com" value={form.email} onChange={(name, val) => setForm({ ...form, [name]: val })} error={errors.email} />
          <Field label="Phone Number" name="phone" type="tel" icon={Phone} placeholder="9876543210" value={form.phone} onChange={(name, val) => setForm({ ...form, [name]: val })} error={errors.phone} />
          {role === 'worker' && (
            <Field label="Primary Skill" name="skill" icon={Hammer} placeholder="Plumber, Mason, Electrician..." value={form.skill} onChange={(name, val) => setForm({ ...form, [name]: val })} error={errors.skill} />
          )}
          <Field label="Password" name="password" type="password" icon={Lock} placeholder="••••••••" value={form.password} onChange={(name, val) => setForm({ ...form, [name]: val })} error={errors.password} show={show} setShow={setShow} />
          <Field label="Confirm Password" name="confirm" type="password" icon={Lock} placeholder="••••••••" value={form.confirm} onChange={(name, val) => setForm({ ...form, [name]: val })} error={errors.confirm} show={show} setShow={setShow} />
          <button type="submit" disabled={loading} className={`w-full py-4 bg-gradient-to-r ${active.accent} text-white font-bold rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-70`}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
          </button>
          <p className="text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className={`${role === 'worker' ? 'text-emerald-600' : 'text-primary-600'} font-bold hover:underline`}>Sign in</Link>
          </p>
        </form>

        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/50 backdrop-blur-2xl shadow-2xl shadow-blue-900/10 p-8 md:p-10">
          <div className={`absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl ${role === 'worker' ? 'bg-emerald-500/20' : 'bg-primary-500/20'}`} />
          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-2 mb-10">
              <img src={logo} alt="ServiceLink" className="h-11 w-11 rounded-2xl object-cover shadow-lg" />
              <span className="text-2xl font-bold text-heading">Service<span className={role === 'worker' ? 'text-emerald-600' : 'text-primary-600'}>Link</span></span>
            </Link>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${active.accent} text-white flex items-center justify-center shadow-xl mb-6`}>
              <ActiveIcon className="w-7 h-7" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-heading leading-tight">
              {role === 'worker' ? 'Your craft deserves a premium storefront.' : 'Find help that feels already vetted.'}
            </h2>
            <p className="text-muted text-lg mt-5 max-w-xl">
              ServiceLink brings marketplace polish to everyday hiring: trust signals, clean booking flows, and role-aware dashboards from the first click.
            </p>
            <div className="mt-10 grid sm:grid-cols-2 gap-4">
              {['Verified badge ready', 'Skill-led discovery', 'Transparent pricing', 'Fast job actions'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/70 bg-white/60 px-4 py-4 shadow-card flex items-center gap-3">
                  <ShieldCheck className={`w-5 h-5 ${role === 'worker' ? 'text-emerald-600' : 'text-primary-600'}`} />
                  <span className="text-sm font-bold text-heading">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
