import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Session timer logic to handle automatic logout
  useEffect(() => {
    let timer;
    if (user?.expiresAt) {
      const expiresAt = new Date(user.expiresAt).getTime();
      const now = new Date().getTime();
      const delay = expiresAt - now;

      if (delay <= 0) {
        logout();
      } else {
        // Set a timer to logout when the session expires
        timer = setTimeout(() => {
          console.log('Session expired, logging out automatically...');
          logout();
          // Notify the rest of the app (App.jsx) via the custom event
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }, delay);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [user]);

  // Axios interceptor fires this on 401 (session expired while app is open)
  useEffect(() => {
    const handleForceLogout = () => setUser(null);
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const logout = async () => {
    try { await api.get('/auth/logout'); } catch (_) {}
    setUser(null);
  };

  // Re-fetches the user from the server and updates state — called when something
  // changes the user record externally, like an admin changing this user's role
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}