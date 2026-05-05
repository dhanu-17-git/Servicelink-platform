import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Briefcase, Wrench, IndianRupee, ChevronLeft, ChevronRight, Zap, Droplets, Hammer, Sparkles, Star, ArrowRight, Wallet, TicketPercent } from 'lucide-react';

const iconMap = { Calendar, Briefcase, Wrench, IndianRupee };

const banners = [
  {
    id: 1,
    title: 'Summer AC Festival',
    subtitle: 'Flat 50% OFF on all AC Servicing & Repairs',
    code: 'SUMMER50',
    color: 'from-blue-600 via-cyan-500 to-teal-400',
    image: 'https://images.unsplash.com/photo-1519642918688-7e43b19245d8?w=800&h=400&fit=crop'
  },
  {
    id: 2,
    title: 'Deep Home Cleaning',
    subtitle: 'Get a sparkling home with our premium cleaners.',
    code: 'CLEAN30',
    color: 'from-emerald-500 via-green-400 to-lime-400',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop'
  },
  {
    id: 3,
    title: 'Refer & Earn ₹500',
    subtitle: 'Invite friends and earn wallet cash instantly.',
    code: 'SHARENOW',
    color: 'from-purple-600 via-fuchsia-500 to-pink-500',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop'
  }
];

const quickServices = [
  { name: 'Electrician', icon: Zap, color: 'bg-amber-100 text-amber-600' },
  { name: 'Plumber', icon: Droplets, color: 'bg-blue-100 text-blue-600' },
  { name: 'Carpenter', icon: Hammer, color: 'bg-orange-100 text-orange-600' },
  { name: 'Cleaning', icon: Sparkles, color: 'bg-emerald-100 text-emerald-600' },
];

const Overview = ({ bookings, stats }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="animate-reveal space-y-8 pb-10">
      
      {/* 1. E-Commerce Style Auto-Slider Banner */}
      <div className="relative w-full h-[220px] sm:h-[300px] rounded-[2rem] overflow-hidden group shadow-2xl shadow-blue-900/10 border border-white">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${banner.color} opacity-90 mix-blend-multiply`} />
            <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" />
            
            <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold w-max backdrop-blur-md border border-white/30 mb-3">
                <TicketPercent className="w-3.5 h-3.5" /> Special Offer
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight max-w-lg shadow-black/10 drop-shadow-lg">{banner.title}</h2>
              <p className="text-white/90 font-medium sm:text-lg mt-2 max-w-md">{banner.subtitle}</p>
              
              <div className="mt-6 flex items-center gap-3">
                <button className="px-6 py-3 bg-white text-slate-900 font-black rounded-xl text-sm hover:scale-105 transition-transform shadow-xl">
                  Book Now
                </button>
                <div className="hidden sm:flex items-center gap-2 px-4 py-3 rounded-xl bg-black/20 backdrop-blur-sm border border-white/20 text-white text-sm font-bold">
                  Use Code: <span className="text-yellow-300 font-black tracking-widest">{banner.code}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Slider Controls */}
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white/40">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-white/40">
          <ChevronRight className="w-6 h-6" />
        </button>
        
        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-y-1/2 flex gap-2 z-20">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* 2. Quick Action Categories (Flipkart/Amazon style) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Need something done?</h3>
          <Link to="/services" className="text-sm font-bold text-[#ea580c] hover:underline flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-4 gap-3 sm:gap-6">
          {quickServices.map(service => (
            <Link to="/services" key={service.name} className="flex flex-col items-center group">
              <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-[1.5rem] flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all ${service.color}`}>
                <service.icon className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <span className="mt-2 text-xs sm:text-sm font-bold text-slate-700">{service.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 3. E-commerce Style Stats & Wallet */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = iconMap[stat.icon];
          return (
            <div key={stat.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full opacity-50 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                  {Icon && <Icon className="w-5 h-5" />}
                </div>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
        {/* Wallet Card Addition */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700 p-5 shadow-xl relative overflow-hidden group lg:col-span-2">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 mb-3 border border-white/10">
                <Wallet className="w-5 h-5" />
              </div>
              <p className="text-2xl font-black text-white">₹1,250</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Wallet Balance</p>
            </div>
            <button className="px-5 py-2.5 bg-emerald-500 text-slate-900 font-bold rounded-xl text-sm shadow-lg hover:bg-emerald-400 transition-colors">
              Add Money
            </button>
          </div>
        </div>
      </div>

      {/* 4. Top Rated Pros Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Recommended for you</h3>
        </div>
        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0 relative">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" alt="Top Pro" className="w-24 h-24 rounded-2xl object-cover ring-4 ring-orange-50" />
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white flex items-center gap-1">
              <Star className="w-3 h-3 fill-white" /> 4.9
            </span>
          </div>
          <div className="text-center md:text-left flex-1">
            <h4 className="text-lg font-bold text-slate-900">Rajesh Kumar</h4>
            <p className="text-sm font-semibold text-[#ea580c]">Expert Plumber • 8 Yrs Exp</p>
            <p className="text-sm text-slate-500 mt-1">Available today for urgent repairs in your area. Book now and get 10% off your first service.</p>
          </div>
          <Link to="/services" className="px-6 py-3 bg-[#fff5eb] text-[#ea580c] font-bold rounded-xl text-sm hover:bg-[#ffedd5] transition-colors whitespace-nowrap">
            View Profile
          </Link>
        </div>
      </div>

    </div>
  );
};

export default Overview;
