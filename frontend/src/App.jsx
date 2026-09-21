import React, { useState, useEffect } from 'react';
import api from './services/api.js';

// Components
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import ComplaintModal from './components/ComplaintModal.jsx';

// Pages
import Login from './pages/Login.jsx';
import ResidentDashboard from './pages/ResidentDashboard.jsx';
import ReportProblem from './pages/ReportProblem.jsx';
import MyComplaints from './pages/MyComplaints.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManageComplaints from './pages/ManageComplaints.jsx';
import SurveyAnalytics from './pages/SurveyAnalytics.jsx';
import CommunityMap from './pages/CommunityMap.jsx';
import WaterMonitoring from './pages/WaterMonitoring.jsx';
import DrainageMonitoring from './pages/DrainageMonitoring.jsx';
import Awareness from './pages/Awareness.jsx';
import Notifications from './pages/Notifications.jsx';
import Profile from './pages/Profile.jsx';
import Reports from './pages/Reports.jsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [navigationParams, setNavigationParams] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [activeModalComplaint, setActiveModalComplaint] = useState(null);
  const [backendError, setBackendError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize offline session and check backend status
  useEffect(() => {
    const initApp = async () => {
      try {
        await api.healthCheck();
        setBackendError(null);
        const storedUser = api.getUser();
        const token = api.getToken();
        if (storedUser && token) {
          setCurrentUser(storedUser);
          loadNotifications();
        }
      } catch (err) {
        setBackendError(
          'Backend server is not running. Please start the local FastAPI server using start_offline.bat or `uvicorn main:app --reload`.'
        );
      } finally {
        setIsInitializing(false);
      }
    };

    initApp();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.warn('Could not load notifications:', err.message);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    loadNotifications();
  };

  const handleLogout = () => {
    api.clearToken();
    setCurrentUser(null);
    setCurrentView('login');
    setNotifications([]);
  };

  const handleNavigate = (view, params = {}) => {
    setCurrentView(view);
    setNavigationParams(params);
    window.scrollTo(0, 0);
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenComplaintById = async (complaintId) => {
    try {
      const comp = await api.getComplaint(complaintId);
      setActiveModalComplaint(comp);
    } catch (err) {
      alert('Could not open complaint details: ' + err.message);
    }
  };

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#ffffff', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '8px' }}>
            Smart Water & Drainage Management System
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
            Initializing local offline environment for Ramaswami Peta, Rajanagaram...
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login Page
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} api={api} />;
  }

  const isAdmin = currentUser.role === 'admin';

  // Render view router
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return isAdmin ? (
          <AdminDashboard api={api} onNavigate={handleNavigate} />
        ) : (
          <ResidentDashboard api={api} user={currentUser} onNavigate={handleNavigate} />
        );

      case 'report-problem':
        return (
          <ReportProblem
            api={api}
            onNavigate={handleNavigate}
            initialCategory={navigationParams.preselectedCategory || 'Water Supply'}
          />
        );

      case 'my-complaints':
        return <MyComplaints api={api} onNavigate={handleNavigate} />;

      case 'manage-complaints':
        return <ManageComplaints api={api} />;

      case 'community-map':
      case 'community-issues':
        return <CommunityMap api={api} role={currentUser?.role || (isAdmin ? 'admin' : 'resident')} />;

      case 'survey-analytics':
      case 'survey-results':
        if (isAdmin) {
          return <AdminDashboard api={api} onNavigate={handleNavigate} />;
        }
        return <SurveyAnalytics api={api} />;

      case 'water-monitoring':
        return <WaterMonitoring />;

      case 'drainage-monitoring':
        return <DrainageMonitoring />;

      case 'awareness':
        if (isAdmin) {
          return <AdminDashboard api={api} onNavigate={handleNavigate} />;
        }
        return <Awareness api={api} />;

      case 'notifications':
        return (
          <Notifications
            api={api}
            onNavigate={handleNavigate}
            onSelectComplaint={(notif) => handleOpenComplaintById(notif.id)}
          />
        );

      case 'profile':
        return (
          <Profile
            api={api}
            user={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
          />
        );

      case 'reports':
        return <Reports api={api} />;

      default:
        return (
          <div className="page-body" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>404 - Page Not Found</h2>
            <p style={{ color: '#64748b', marginTop: '8px' }}>The requested view does not exist.</p>
            <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={() => handleNavigate('dashboard')}>
              Back to Dashboard
            </button>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar
          currentView={currentView}
          user={currentUser}
          notifications={notifications}
          onNavigate={handleNavigate}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onSelectComplaint={(c) => handleOpenComplaintById(c.id)}
        />

        {/* Backend Warning Banner if offline backend is not responding */}
        {backendError && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderBottom: '1px solid #fecaca',
              padding: '12px 32px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>⚠️ {backendError}</span>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Dynamic Page Component */}
        {renderCurrentView()}

        {/* Global Complaint Modal (when opened from notifications or map) */}
        {activeModalComplaint && (
          <ComplaintModal
            complaint={activeModalComplaint}
            onClose={() => setActiveModalComplaint(null)}
            isAdmin={isAdmin}
          />
        )}
      </div>
    </div>
  );
}
