import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole = 'any' }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.is_worker ? 'worker' : 'user';
  if (allowedRole !== 'any' && role !== allowedRole) {
    return <Navigate to={user.is_worker ? '/worker-dashboard' : '/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
