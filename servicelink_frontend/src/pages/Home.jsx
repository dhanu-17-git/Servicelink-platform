import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Droplets, Hammer, Paintbrush, Flame, Wrench, Users, Shield, Clock, Search, CalendarCheck, CheckCircle2, Star, Smartphone, Download, ArrowRight } from 'lucide-react';
import { categories, stats } from '../data/dummyData';
import LiveActivityFeed from '../components/LiveActivityFeed';
import heroBg from '../../images/homepage.jpeg';

const iconMap = { Zap, Droplets, Hammer, Paintbrush, Flame, Wrench };

const CountUp = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const increment = target / steps;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {started ? count.toLocaleString() : '0'}{suffix}
    </span>
  );
};

const TypewriterText = ({ text, delay = 1200, speed = 40 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);
  const [phase, setPhase] = useState('typing'); // 'typing' | 'pausing' | 'erasing'

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;

    if (phase === 'typing') {
      if (displayedText.length < text.length) {
        const timer = setTimeout(() => {
          setDisplayedText(text.slice(0, displayedText.length + 1));
        }, speed);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setPhase('erasing'), 2000);
        return () => clearTimeout(timer);
      }
    }

    if (phase === 'erasing') {
      if (displayedText.length > 0) {
        const timer = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, speed / 2);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setPhase('typing'), 500);
        return () => clearTimeout(timer);
      }
    }
  }, [started, displayedText, text, speed, phase]);

  if (!started) return <div style={{ height: '80px' }} />;

  return (
    <p
      className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed font-semibold tracking-wide"
      style={{
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        background: 'linear-gradient(135deg, #1e293b 0%, #9ca3af 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: '0.02em',
        height: '80px',
      }}
    >
      {displayedText}
      <span className="typewriter-cursor" />
    </p>
  );
};

const ScrollReveal = ({ children, className = "", delay = "0s", duration = "1s" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className={`${className} ${isVisible ? 'animate-hero-heading' : 'opacity-0'}`}
      style={{ animationDelay: delay, animationDuration: duration }}
    >
      {children}
    </div>
  );
};

const Home = () => {
  const howItWorks = [
    { icon: Search, title: 'Discover verified help', desc: 'Search skilled workers and quality tools with transparent pricing and trust badges.' },
    { icon: CalendarCheck, title: 'Book in minutes', desc: 'Direct-book workers or add tools to cart, then confirm dates in a polished checkout flow.' },
    { icon: CheckCircle2, title: 'Track with confidence', desc: 'Get booking status, partner actions, and service updates from a dedicated dashboard.' },
  ];

  const testimonials = [
    { name: 'Anjali S.', role: 'Home renovation', text: 'ServiceLink felt incredibly premium. I found a verified mason, booked directly, and tracked everything without calling five people.', rating: 5 },
    { name: 'Rohit M.', role: 'Tool rental', text: 'The tool checkout is clean and fast. It feels like a modern marketplace built specifically for local services.', rating: 5 },
    { name: 'Priya N.', role: 'Plumbing repair', text: 'Trust badges and reviews made choosing a worker easy. The experience felt modern, safe, and reliable.', rating: 4.9 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section — fullscreen background image */}
      <section className="relative min-h-[90vh] flex items-start justify-center px-4 pt-12 overflow-hidden">
        {/* Background image — color graded */}
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover brightness-125 contrast-105 saturate-110"
        />
        {/* Minimal overlay for text readability */}
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative max-w-7xl mx-auto z-10 w-full h-full flex flex-col items-center justify-start pt-10">
          <div className="text-center relative">
            <span className="animate-hero-badge inline-flex items-center gap-2 px-5 py-2 text-white text-sm font-bold rounded-full mb-8 shadow-xl shadow-orange-500/20 border border-white/10" style={{ background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' }}>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Trusted by 8,000+ customers
            </span>
            <h1 className="animate-hero-heading text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-4 max-w-4xl mx-auto" style={{ textShadow: 'none' }}>
              <span style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 50%, #fde68a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 2px 8px rgba(253, 230, 138, 0.3))' }}>Hire Skilled Workers &{' '}</span>
              <span className="animate-gradient-text" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316, #ef4444, #f59e0b)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 2px 10px rgba(245, 158, 11, 0.4))' }}>
                Rent Tools Easily
              </span>
            </h1>

            {/* Live Activity Feed — Nudging right bit-wise */}
            <div className="hidden lg:block absolute top-[110%] left-[50%] z-20">
              <LiveActivityFeed />
            </div>
          </div>
        </div>
      </section>

      {/* Subtitle below hero image */}
      <div className="text-center py-6 bg-surface px-4" style={{ minHeight: '100px' }}>
        <TypewriterText
          text="Connect with verified professionals and access quality tools for your projects."
          delay={1400}
          speed={35}
        />
      </div>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <h2 className="text-3xl font-bold text-heading mb-3">Browse Categories</h2>
            <p className="text-muted max-w-lg mx-auto">Find the right professional or tool for your specific needs</p>
          </ScrollReveal>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => {
              const Icon = iconMap[cat.icon];
              return (
                <ScrollReveal key={cat.id} delay={`${i * 0.1}s`}>
                  <Link to="/services" 
                    className="hover-zoom group relative p-6 bg-white rounded-2xl border border-gray-100 shadow-float hover:shadow-card-hover transition-all duration-300 text-center block h-full"
                    style={{ animation: `float 4s cubic-bezier(0.37, 0, 0.63, 1) ${i * 0.5}s infinite` }}>
                    <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-115 transition-transform duration-300`}>
                      {Icon && <Icon className="w-7 h-7 text-white" />}
                    </div>
                    <h3 className="font-semibold text-heading text-sm">{cat.name}</h3>
                    <p className="text-xs text-muted mt-1">{cat.count} available</p>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>



      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold text-heading mb-3">Why Choose ServiceLink</h2>
            <p className="text-muted max-w-lg mx-auto mb-12">We make hiring workers and renting tools simple, safe, and reliable</p>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Verified Professionals', desc: 'All workers go through a rigorous verification process ensuring quality and trust.', gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', hoverBg: 'hover:bg-blue-100' },
              { icon: Shield, title: 'Secure Payments', desc: 'Your payments are protected with our secure escrow system until the job is done.', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', hoverBg: 'hover:bg-emerald-100' },
              { icon: Clock, title: 'Fast Booking', desc: 'Book a professional or rent a tool in minutes. No hassle, no waiting.', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', hoverBg: 'hover:bg-amber-100' },
            ].map(({ icon: Icon, title, desc, gradient, bg, hoverBg }, i) => (
              <ScrollReveal key={i} delay={`${i * 0.2}s`}>
                <div
                  className={`p-8 rounded-2xl bg-white border-l-4 shadow-card hover:shadow-card-hover transition-all duration-400 group cursor-default h-full`}
                  style={{
                    borderColor: i === 0 ? '#3b82f6' : i === 1 ? '#10b981' : '#f59e0b',
                    transform: 'translateY(0)',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-heading text-lg mb-2">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="hover-zoom relative text-center rounded-2xl py-7 px-5 cursor-default overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  boxShadow: '0 8px 32px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(148, 163, 184, 0.1)',
                }}
              >
                {/* Accent top border */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{
                    background: i === 0
                      ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                      : i === 1
                      ? 'linear-gradient(90deg, #10b981, #34d399)'
                      : i === 2
                      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                      : 'linear-gradient(90deg, #8b5cf6, #a78bfa)',
                  }}
                />
                <div
                  className="text-3xl md:text-4xl font-extrabold mb-1"
                  style={{
                    background: i === 0
                      ? 'linear-gradient(135deg, #60a5fa, #93c5fd)'
                      : i === 1
                      ? 'linear-gradient(135deg, #34d399, #6ee7b7)'
                      : i === 2
                      ? 'linear-gradient(135deg, #fbbf24, #fde68a)'
                      : 'linear-gradient(135deg, #a78bfa, #c4b5fd)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  <CountUp target={parseInt(stat.value.replace(/,/g, ''))} suffix="+" duration={2000} />
                </div>
                <div className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.10),_transparent_32%),#f8fbff]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-bold mb-4">
              <Zap className="w-4 h-4" />
              Built for speed
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-heading mb-3">How ServiceLink Works</h2>
            <p className="text-muted max-w-2xl mx-auto">A premium three-step flow from discovery to confirmed work, tuned for both customers and partners.</p>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {howItWorks.map(({ icon: Icon, title, desc }, index) => (
              <ScrollReveal key={title} delay={`${index * 0.15}s`}>
                <div className="relative h-full rounded-[2rem] border border-white bg-white/80 backdrop-blur-xl p-8 shadow-2xl shadow-blue-900/10 overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary-500/10 blur-3xl group-hover:bg-primary-500/20 transition-colors" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-cyan-400 text-white flex items-center justify-center shadow-xl mb-6">
                      <Icon className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-black text-primary-600 mb-2">Step {index + 1}</p>
                    <h3 className="text-xl font-black text-heading mb-3">{title}</h3>
                    <p className="text-sm text-muted leading-6">{desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-heading">Customers talk like investors</h2>
              <p className="text-muted mt-2 max-w-xl">Realistic demo testimonials that show the trust, speed, and premium feel of the platform.</p>
            </div>
            <div className="flex items-center gap-2 text-amber-600 font-black">
              <Star className="w-5 h-5 fill-amber-400" />
              4.9 average demo rating
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-3 gap-6">
            {testimonials.map((item, index) => (
              <ScrollReveal key={item.name} delay={`${index * 0.15}s`}>
                <article className="h-full rounded-[2rem] border border-gray-100 bg-gradient-to-br from-white to-blue-50/50 p-7 shadow-card hover:shadow-card-hover transition-all duration-300">
                  <div className="flex items-center gap-1 text-amber-500 mb-5">
                    {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-4 h-4 fill-amber-400" />)}
                  </div>
                  <p className="text-heading font-semibold leading-7">"{item.text}"</p>
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <p className="font-black text-heading">{item.name}</p>
                    <p className="text-sm text-muted">{item.role}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Download App */}
      <section className="py-20 px-4">
        <ScrollReveal>
          <div className="max-w-6xl mx-auto rounded-[2rem] bg-gradient-to-br from-slate-950 via-primary-900 to-blue-700 p-8 md:p-12 shadow-2xl shadow-blue-900/25 overflow-hidden relative">
            <div className="absolute -top-24 -right-20 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl" />
            <div className="relative grid lg:grid-cols-[1fr_360px] gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-blue-100 text-sm font-bold mb-5">
                  <Smartphone className="w-4 h-4" />
                  Mobile app coming soon
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Book workers and tools from your pocket.</h2>
                <p className="text-blue-100 mt-4 max-w-2xl">A fake but polished app-launch section with store-style badges, designed to make the demo feel venture-backed and launch-ready.</p>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  {['App Store', 'Google Play'].map(store => (
                    <button key={store} className="px-5 py-3 rounded-2xl bg-white text-heading font-black flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-all shadow-xl">
                      <Download className="w-5 h-5 text-primary-600" />
                      Download on {store}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-[2rem] bg-white/10 border border-white/20 p-5 backdrop-blur-xl shadow-2xl">
                <div className="rounded-[1.5rem] bg-white p-5">
                  <div className="h-10 w-10 rounded-2xl bg-primary-600 mb-5" />
                  <p className="text-sm font-bold text-muted">Next booking</p>
                  <h3 className="text-xl font-black text-heading mt-1">Rajesh Kumar</h3>
                  <p className="text-sm text-muted mt-1">Mason • Tomorrow, 9:00 AM</p>
                  <div className="mt-5 h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary-600 to-cyan-400" />
                  </div>
                  <button className="mt-5 w-full py-3 rounded-2xl bg-primary-600 text-white font-black flex items-center justify-center gap-2">
                    Track booking <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <ScrollReveal duration="1s">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-emerald-600 via-emerald-500 to-white rounded-3xl p-12 md:p-16 shadow-2xl border border-emerald-100 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/40 rounded-full blur-3xl" />
            
            <h2 className="relative z-10 text-3xl md:text-4xl font-bold text-emerald-950 mb-4">Ready to Get Started?</h2>
            <p className="relative z-10 text-emerald-900/80 max-w-lg mx-auto mb-8 font-medium">Join thousands of satisfied customers who trust ServiceLink for their service needs.</p>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg hover:-translate-y-0.5 border border-emerald-500/20">
                Create Account
              </Link>
              <Link to="/services" className="px-8 py-3.5 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-all border border-emerald-200 shadow-sm">
                Browse Services
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};

export default Home;
