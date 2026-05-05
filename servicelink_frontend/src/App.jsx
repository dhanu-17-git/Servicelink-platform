import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Tools from './pages/Tools';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerProfile from './pages/WorkerProfile';

import { CartProvider } from './context/CartContext';
import Checkout from './pages/Checkout';
import Success from './pages/Success';

const Layout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const noFooter = Boolean(user?.is_worker) || ['/login', '/register', '/dashboard', '/worker-dashboard'].some(p => location.pathname.startsWith(p));
  const noNav = false;

  return (
    <>
      {!noNav && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<ProtectedRoute allowedRole="user"><Checkout /></ProtectedRoute>} />
        <Route path="/success" element={<ProtectedRoute allowedRole="user"><Success /></ProtectedRoute>} />
        
        {/* Protected Routes */}
        <Route path="/services" element={<ProtectedRoute allowedRole="user"><Services /></ProtectedRoute>} />
        <Route path="/workers/:id" element={<ProtectedRoute><WorkerProfile /></ProtectedRoute>} />
        <Route path="/tools" element={<ProtectedRoute allowedRole="user"><Tools /></ProtectedRoute>} />
        <Route path="/dashboard/*" element={<ProtectedRoute allowedRole="user"><Dashboard /></ProtectedRoute>} />
        <Route path="/worker-dashboard/*" element={<ProtectedRoute allowedRole="worker"><WorkerDashboard /></ProtectedRoute>} />
      </Routes>
      {!noFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <CartProvider>
              <Layout />
            </CartProvider>
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
