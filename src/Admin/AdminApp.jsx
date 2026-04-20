import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminSpaces from './pages/AdminSpaces';
import AdminContactQueries from './pages/AdminContactQueries';
import AdminSettings from './pages/AdminSettings';
import api from '../api/axios';

export default function AdminApp({ onBack }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activePage, setActivePage] = useState('dashboard');

  // Contact queries are lifted to this level so AdminDashboard and AdminSidebar
  // (which shows the unread badge) can both read the same data
  const [queries, setQueries] = useState([]);
  const [queriesLoading, setQueriesLoading] = useState(true);

  useEffect(() => {
    api.get('/api/contact')
      .then(res => setQueries(res.data))
      .catch(err => console.error('Failed to load contact queries:', err))
      .finally(() => setQueriesLoading(false));
  }, []);

  const renderPage = () => {
    if (activePage === 'dashboard') return <AdminDashboard queries={queries} queriesLoading={queriesLoading} />;
    if (activePage === 'users')     return <AdminUsers />;
    if (activePage === 'spaces')    return <AdminSpaces />;
    if (activePage === 'contact')   return <AdminContactQueries queries={queries} setQueries={setQueries} />;
    if (activePage === 'settings')  return <AdminSettings />;
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: isDark ? '#111111' : '#F3F4F6',
      color: isDark ? '#F8FAFC' : '#111827',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
    }}>
      <AdminSidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onBack={onBack}
        queries={queries}
      />
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 36px' }}>
        {renderPage()}
      </div>
    </div>
  );
}