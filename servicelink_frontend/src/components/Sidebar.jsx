import { NavLink } from 'react-router-dom';
import { Calendar, User, X, Wrench } from 'lucide-react';

const sidebarLinks = [
  { name: 'Overview', path: '/dashboard', icon: Calendar },
  { name: 'My Bookings', path: '/dashboard/bookings', icon: Calendar },
  { name: 'Tools', path: '/tools', icon: Wrench },
  { name: 'Profile', path: '/dashboard/profile', icon: User },
];

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-100 z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex items-center justify-between lg:hidden">
          <span className="font-semibold text-heading">Menu</span>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <nav className="p-3 space-y-1">
          {sidebarLinks.map((link) => (
            <NavLink key={link.name} to={link.path} end onClick={onClose}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-primary-50 text-primary-700' : 'text-muted hover:text-heading hover:bg-gray-50'}`}>
              <link.icon className="w-5 h-5" />
              {link.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
