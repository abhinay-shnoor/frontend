import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { showNotification } from '../utils/notifications';

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

  const [isExpiryWarningOpen, setIsExpiryWarningOpen] = useState(false);

  // Sync session across tabs
  useEffect(() => {
    const channel = new BroadcastChannel('session_sync');
    channel.onmessage = (event) => {
      if (event.data.type === 'SESSION_REFRESHED') {
        setUser(prev => ({ ...prev, expiresAt: event.data.expiresAt }));
        setIsExpiryWarningOpen(false);
      } else if (event.data.type === 'SESSION_LOGOUT') {
        setUser(null);
      }
    };
    return () => channel.close();
  }, []);

  // Re-validate session on visibility change (user comes back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.expiresAt) {
        const expiresAt = new Date(user.expiresAt).getTime();
        const now = new Date().getTime();
        if (expiresAt <= now) {
          logout();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  // Session timer logic to handle automatic logout and warning
  useEffect(() => {
    let logoutTimer;
    let warningTimer;

    if (user?.expiresAt) {
      const expiresAt = new Date(user.expiresAt).getTime();
      const now = new Date().getTime();
      const delay = expiresAt - now;

      if (delay <= 0) {
        logout();
      } else {
        // Set a timer to logout when the session expires
        logoutTimer = setTimeout(() => {
          console.log('Session expired, logging out automatically...');
          logout();
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }, delay);

        // Set a timer to show a warning 10 minutes before expiry (at 50 minutes)
        // If the session is shorter than 10 minutes, show it at the 50% mark or just immediately
        const warningThreshold = 10 * 60 * 1000; // 10 minutes before expiry (was 5 mins for testing)
        const warningDelay = Math.max(0, delay - warningThreshold);

        console.log(`Session debug: Total delay: ${Math.round(delay/1000)}s, Warning delay: ${Math.round(warningDelay/1000)}s`);

        warningTimer = setTimeout(() => {
          showNotification('Your session is about to expire.', {
            body: 'Click here to extend your session and stay logged in.',
            requireInteraction: true,
            onClick: () => {
              window.focus();
              setIsExpiryWarningOpen(true);
            }
          });
          // Also show the modal immediately in-app if the tab is visible
          setIsExpiryWarningOpen(true);
        }, warningDelay);
      }
    }

    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      if (warningTimer) clearTimeout(warningTimer);
    };
  }, [user]);

  // Axios interceptor fires this on 401 (session expired while app is open)
  useEffect(() => {
    const handleForceLogout = () => {
      setUser(null);
      new BroadcastChannel('session_sync').postMessage({ type: 'SESSION_LOGOUT' });
    };
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  const logout = async () => {
    try { await api.get('/auth/logout'); } catch (_) {}
    setUser(null);
    new BroadcastChannel('session_sync').postMessage({ type: 'SESSION_LOGOUT' });
    setIsExpiryWarningOpen(false);
  };

  const continueSession = async () => {
    try {
      const res = await api.get('/auth/refresh');
      if (res.data.success) {
        const newExpiresAt = res.data.expiresAt;
        setUser(prev => ({ ...prev, expiresAt: newExpiresAt }));
        setIsExpiryWarningOpen(false);
        // Sync to other tabs
        new BroadcastChannel('session_sync').postMessage({ 
          type: 'SESSION_REFRESHED', 
          expiresAt: newExpiresAt 
        });
      }
    } catch (err) {
      console.error('Failed to refresh session:', err);
      logout();
    }
  };

  // Re-fetches the user from the server and updates state
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, loading, logout, setUser, refreshUser, 
      isExpiryWarningOpen, setIsExpiryWarningOpen, continueSession 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}