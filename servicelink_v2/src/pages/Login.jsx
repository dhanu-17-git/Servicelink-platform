import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Eye, EyeOff, Loader2, Lock, Mail, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { API_BASE } from '../api/config';
import { playSuccessPing } from '../utils/sound';
import logo from '../../images/logo.jpeg';

const roleCopy = {
  user: {
    label: 'Hire Service',
    title: 'Hire verified pros without the chaos.',
    subtitle: 'Book skilled workers and rent tools with clear pricing, trusted profiles, and instant tracking.',
    accent: 'from-primary-600 to-blue-500',
    glow: 'bg-primary-500/20',
    icon: Users,
  },
  worker: {
    label: 'Join as Partner',
    title: 'Turn your skill into booked jobs.',
    subtitle: 'Manage incoming requests, build trust with reviews, and keep your schedule moving.',
    accent: 'from-emerald-600 to-cyan-500',
    glow: 'bg-emerald-500/20',
    icon: BriefcaseBusiness,
  },
};

const Login = () => {
  const [role, setRole] = useState('user');
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const active = roleCopy[role];
  const ActiveIcon = active.icon;

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        if (role === 'worker' && !data.user?.is_worker) {
          setErrors({ general: 'This account is not registered as a worker. Switch to Hire mode to continue.' });
          return;
        }
        if (role === 'user' && data.user?.is_worker) {
          setErrors({ general: 'This is a partner account. Choose the Partner login card to continue.' });
          return;
        }
        toast.success(role === 'worker' ? 'Welcome back, partner!' : 'Welcome back to ServiceLink!');
        playSuccessPing();
        login(data.user, data.access, data.refresh);
      } else {
        const msg = data.detail || Object.values(data).flat().join(', ') || 'Login failed';
        setErrors({ general: msg });
      }
    } catch (err) {
      setErrors({ general: 'Server connection failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen px-4 pt-24 pb-12 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.14),_transparent_34%),linear-gradient(135deg,#f8fbff_0%,#ffffff_48%,#eef7ff_100%)] ${role === 'worker' ? 'bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_34%),linear-gradient(135deg,#f5fffb_0%,#ffffff_48%,#eefbff_100%)]' : ''}`}>
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/50 backdrop-blur-2xl shadow-2xl shadow-blue-900/10 p-8 md:p-10">
          <div className={`absolute -top-24 -right-20 w-72 h-72 rounded-full blur-3xl ${active.glow}`} />
          <div className="relative">
            <Link to="/" className="inline-flex items-center gap-2 mb-10">
              <img src={logo} alt="ServiceLink" className="h-11 w-11 rounded-2xl object-cover shadow-lg" />
              <span className="text-2xl font-bold text-heading">Service<span className={role === 'worker' ? 'text-emerald-600' : 'text-primary-600'}>Link</span></span>
            </Link>

            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${active.accent} text-white flex items-center justify-center shadow-xl mb-6`}>
              <ActiveIcon className="w-7 h-7" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-heading leading-tight">{active.title}</h1>
            <p className="text-muted text-lg mt-5 max-w-xl">{active.subtitle}</p>

            <div className="grid md:grid-cols-2 gap-4 mt-10">
              {Object.entries(roleCopy).map(([key, item]) => {
                const Icon = item.icon;
                const selected = role === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRole(key)}
                    className={`relative overflow-hidden rounded-[1.5rem] border p-5 text-left transition-all duration-300 ${
                      selected
                        ? 'bg-white shadow-2xl shadow-blue-900/15 border-white scale-[1.02]'
                        : 'bg-white/55 border-white/70 hover:bg-white/80 hover:-translate-y-1'
                    }`}
                  >
                    <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl ${key === 'worker' ? 'bg-emerald-400/20' : 'bg-primary-400/20'}`} />
                    <div className="relative">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.accent} text-white flex items-center justify-center shadow-lg mb-4`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-black text-heading">{key === 'worker' ? 'Partner Login' : 'Customer Login'}</h3>
                      <p className="text-sm text-muted mt-2">{key === 'worker' ? 'Manage jobs, earnings, and your public profile.' : 'Hire workers, rent tools, and track bookings.'}</p>
                      <div className={`mt-4 inline-flex items-center gap-2 text-xs font-black ${key === 'worker' ? 'text-emerald-700' : 'text-primary-700'}`}>
                        {selected ? 'Selected' : 'Choose this app'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="relative overflow-hidden bg-white/80 backdrop-blur-2xl rounded-[2rem] border border-white shadow-2xl shadow-blue-900/10 p-6 md:p-8 space-y-5">
          <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${active.accent}`} />
          <div className="flex rounded-2xl bg-gray-100 p-1">
            {Object.entries(roleCopy).map(([key, item]) => {
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
            <h2 className="text-2xl font-bold text-heading">Welcome back</h2>
            <p className="text-sm text-muted mt-1">{role === 'worker' ? 'Sign in to manage jobs and profile trust.' : 'Sign in to book workers and tools faster.'}</p>
          </div>

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {errors.general}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-heading mb-1.5">Email</label>
            <div className={`flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl border ${errors.email ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'} focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all`}>
              <Mail className="w-5 h-5 text-gray-400" />
              <input type="email" placeholder={role === 'worker' ? 'rajesh.kumar@gmail.com' : 'demo@gmail.com'} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-transparent text-sm focus:outline-none" />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-heading mb-1.5">Password</label>
            <div className={`flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-2xl border ${errors.password ? 'border-red-300 ring-1 ring-red-200' : 'border-gray-200'} focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all`}>
              <Lock className="w-5 h-5 text-gray-400" />
              <input type={show ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-transparent text-sm focus:outline-none" />
              <button type="button" onClick={() => setShow(!show)} className="text-gray-400 hover:text-gray-600">
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className={`w-full py-4 bg-gradient-to-r ${active.accent} text-white font-bold rounded-2xl hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70`}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5" /> Sign In <ArrowRight className="w-5 h-5" /></>}
          </button>

          <p className="text-center text-sm text-muted">
            New to ServiceLink?{' '}
            <Link to="/register" className={`${role === 'worker' ? 'text-emerald-600' : 'text-primary-600'} font-bold hover:underline`}>Create account</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
