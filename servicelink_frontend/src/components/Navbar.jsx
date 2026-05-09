import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BadgeCheck, Bell, BriefcaseBusiness, LogIn, LogOut, Menu, ShoppingCart, TrendingUp, UserPlus, X, Moon, Sun, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import SearchOverlay from './SearchOverlay';
import logo from '../../images/logo.jpeg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const notifRef = useRef(null);
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const isPartner = Boolean(user?.is_worker);
  const ownWorkerId = user?.worker_id || user?.worker?.id || user?.id;

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const customerLinks = [
    ...(!user ? [{ name: 'Home', path: '/' }] : []),
    ...(user ? [
      { name: 'Services', path: '/services' },
      { name: 'Tools', path: '/tools' },
      { name: 'Dashboard', path: '/dashboard' },
    ] : []),
  ];

  const partnerLinks = [
    { name: 'Dashboard', path: '/worker-dashboard', icon: BriefcaseBusiness },
    ...(ownWorkerId ? [{ name: 'Public Profile', path: `/workers/${ownWorkerId}`, icon: BadgeCheck }] : []),
  ];

  const navLinks = isPartner ? partnerLinks : customerLinks;
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const isHome = location.pathname === '/';
  const isServices = location.pathname.startsWith('/services');
  const isTools = location.pathname.startsWith('/tools');

  let navStyle = 'fixed top-0 left-0 right-0 z-50 border-b shadow-nav transition-colors duration-300 ';
  let btnClass = 'bg-primary-600 text-white hover:bg-primary-700';
  let loginHover = 'hover:text-primary-600';
  let logoSpan = 'text-primary-600';

  if (isPartner) {
    navStyle += 'bg-slate-950/90 backdrop-blur-2xl border-white/10';
    btnClass = 'bg-emerald-500 text-slate-950 hover:bg-emerald-400';
    loginHover = 'hover:text-emerald-300 text-slate-100';
    logoSpan = 'text-emerald-300';
  } else if (isHome) {
    navStyle += 'bg-[#FFF5EB]/95 backdrop-blur-md border-[#f97316]/20';
    btnClass = 'bg-[#f97316] text-white hover:bg-[#ea580c]';
    loginHover = 'hover:text-[#f97316]';
    logoSpan = 'text-[#f97316]';
  } else if (isServices) {
    navStyle += 'bg-[#FFF5EB]/95 backdrop-blur-md border-[#D2691E]/20';
    btnClass = 'bg-[#D2691E] text-white hover:bg-[#B35919]';
    loginHover = 'hover:text-[#D2691E]';
    logoSpan = 'text-[#D2691E]';
  } else if (isTools) {
    navStyle += 'bg-[#F0FFFA]/95 backdrop-blur-md border-[#7FFFD4]/40';
    btnClass = 'bg-[#7FFFD4] text-[#006060] hover:bg-[#66E0C0]';
    loginHover = 'hover:text-[#006060]';
    logoSpan = 'text-[#006060]';
  } else {
    navStyle += 'glass border-gray-100';
  }

  const logoTarget = isPartner ? '/worker-dashboard' : '/';

  return (
    <nav className={navStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link to={logoTarget} className="flex items-center gap-2 group">
            <img src={logo} alt="ServiceLink" className="h-8 w-8 rounded-lg object-cover shadow-sm group-hover:shadow-md transition-shadow" />
            <span className={`text-lg font-bold tracking-tight ${isPartner ? 'text-white' : 'text-heading'}`}>
              Service<span className={logoSpan}>{isPartner ? 'Partner' : 'Link'}</span>
            </span>
            {isPartner && (
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-200 text-[10px] font-bold ring-1 ring-emerald-300/20">
                Partner
              </span>
            )}
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const activeClass = isPartner ? 'bg-white/10 text-white' : 'bg-primary-50 text-primary-700';
              const hoverClass = isPartner ? 'hover:text-white hover:bg-white/10 text-slate-300' : 'hover:text-primary-600 hover:bg-gray-50 text-gray-900';
              return (
                <Link key={`${link.name}-${link.path}`} to={link.path} className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 inline-flex items-center gap-1.5 ${isActive(link.path) ? activeClass : hoverClass}`}>
                  {Icon && <Icon className="w-4 h-4" />}
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {/* Search Button */}
            {!isPartner && (
              <button 
                onClick={() => setShowSearch(true)} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-sm text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/20 transition-colors"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">Search...</span>
                <kbd className="hidden lg:inline text-[10px] font-bold bg-gray-200 dark:bg-white/10 px-1.5 py-0.5 rounded">⌘K</kbd>
              </button>
            )}

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button onClick={() => setShowNotif(!showNotif)} className={`relative p-2 rounded-lg transition-all ${isPartner ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-gray-50'}`}>
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white rounded-full bg-red-500">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Notifications</span>
                      {unreadCount > 0 && <button onClick={markAllRead} className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700">Mark all read</button>}
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="p-4 text-xs text-slate-400 text-center">No notifications yet</p>
                      ) : (
                        notifications.slice(0, 10).map(n => (
                          <div key={n.id} onClick={() => markAsRead(n.id)} className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-emerald-50/30' : ''}`}>
                            <p className="text-xs font-bold text-slate-900">{n.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{n.message}</p>
                            <p className="text-[9px] text-slate-400 mt-1">{new Date(n.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!isPartner && user && (
              <Link to="/checkout" className={`relative p-2 rounded-lg transition-all ${loginHover} hover:bg-gray-50`}>
                <ShoppingCart className="w-4.5 h-4.5" />
                {cartItems.length > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white rounded-full ${btnClass.split(' ')[0]}`}>{cartItems.length}</span>
                )}
              </Link>
            )}

            {!user ? (
              <>
                <Link to="/login" className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-900 transition-colors ${loginHover}`}>
                  <LogIn className="w-4 h-4" />Login
                </Link>
                <Link to="/register" className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-px ${btnClass}`}>
                  <UserPlus className="w-4 h-4" />Register
                </Link>
              </>
            ) : (
              <button onClick={logout} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-px ${btnClass}`}>
                <LogOut className="w-4 h-4" />Logout
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {user && (
              <div className="relative" ref={notifRef}>
                <button onClick={() => setShowNotif(!showNotif)} className={`relative p-2 rounded-lg ${isPartner ? 'text-white' : 'text-slate-600'}`}>
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[9px] font-bold text-white rounded-full bg-red-500">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>
              </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className={`p-2 rounded-lg transition-colors ${isPartner ? 'text-white hover:bg-white/10' : 'hover:bg-gray-100'}`}>
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={`px-4 pb-4 space-y-1 border-t ${isPartner ? 'bg-slate-950 border-white/10' : 'bg-white border-gray-100'}`}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={`${link.name}-${link.path}-mobile`} to={link.path} onClick={() => setIsOpen(false)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive(link.path) ? (isPartner ? 'bg-white/10 text-white' : 'bg-primary-50 text-primary-700') : (isPartner ? 'text-slate-300 hover:bg-white/10' : 'text-gray-900 hover:bg-gray-50')}`}>
                {Icon && <Icon className="w-4 h-4" />}{link.name}
              </Link>
            );
          })}
          {!isPartner && user && (
            <Link to="/checkout" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ShoppingCart className="w-4 h-4" />Cart ({cartItems.length})
            </Link>
          )}
          <div className={`pt-2 border-t flex flex-col gap-2 ${isPartner ? 'border-white/10' : 'border-gray-100'}`}>
            {!user ? (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1 text-center px-4 py-2 text-sm font-semibold text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className={`flex-1 text-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${btnClass}`}>Register</Link>
              </div>
            ) : (
              <button onClick={() => { setIsOpen(false); logout(); }} className={`w-full text-center px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${btnClass}`}>
                <LogOut className="w-4 h-4" />Logout
              </button>
            )}
          </div>
        </div>
      </div>

      <SearchOverlay isOpen={showSearch} onClose={() => setShowSearch(false)} />
    </nav>
  );
};

export default Navbar;
