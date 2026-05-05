import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE, authHeaders } from '../api/config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const token = sessionStorage.getItem('token');
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/auth/profile`, {
            headers: authHeaders(),
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
            sessionStorage.setItem('user', JSON.stringify(data));
          } else {
            // Token invalid — clear everything
            logout();
          }
        } catch (err) {
          console.error('Auth verification failed');
          // Network error — keep current state from sessionStorage
          const cached = sessionStorage.getItem('user');
          if (cached) {
            try { setUser(JSON.parse(cached)); } catch { /* ignore */ }
          }
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    sessionStorage.setItem('token', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    navigate(userData?.is_worker ? '/worker-dashboard' : '/dashboard');
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
