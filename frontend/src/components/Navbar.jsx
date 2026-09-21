import React, { useState } from 'react';
import { BellIcon, MapPinIcon, UserIcon } from './Icons.jsx';
import NotificationPanel from './NotificationPanel.jsx';

export default function Navbar({
  currentView,
  user,
  notifications = [],
  onNavigate,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onSelectComplaint = null
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return user?.role === 'admin' ? 'Administrative Dashboard' : 'Resident Portal Dashboard';
      case 'report-problem':
        return 'Report Water or Drainage Issue';
      case 'my-complaints':
        return 'My Registered Complaints';
      case 'manage-complaints':
        return 'Civic Complaint Management & Triage';
      case 'community-map':
      case 'community-issues':
        return 'Offline Community Issue Map';
      case 'survey-analytics':
      case 'survey-results':
        return 'Community Survey Analytics (208 Responses)';
      case 'water-monitoring':
        return 'Water Supply Monitoring & Diagnostics';
      case 'drainage-monitoring':
        return 'Drainage Flow & Blockage Monitoring';
      case 'awareness':
        return 'Community Awareness & Hygiene Guidelines';
      case 'notifications':
        return 'Local Notification Center';
      case 'reports':
        return 'Municipal Reports & CSV Export';
      case 'profile':
        return 'Account & Profile Settings';
      default:
        return 'Smart Water & Drainage Management System';
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div>
          <h1 className="page-title">{getPageTitle()}</h1>
        </div>
        <div className="location-badge">
          <MapPinIcon size={13} />
          <span>Ramaswami Peta, Rajanagaram</span>
        </div>
        <div className="offline-pill">
          <span className="pulse-dot" />
          <span>Offline Local Mode</span>
        </div>
      </div>

      <div className="navbar-right">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <BellIcon size={18} />
            {unreadCount > 0 && <span className="badge-dot" />}
          </button>

          {showNotifications && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
              onMarkRead={onMarkNotificationRead}
              onMarkAllRead={onMarkAllNotificationsRead}
              onSelectNotification={(notif) => {
                setShowNotifications(false);
                if (notif.complaint_id && onSelectComplaint) {
                  onSelectComplaint({ id: notif.complaint_id });
                }
              }}
            />
          )}
        </div>

        {/* User profile avatar / button */}
        <button
          className="icon-btn"
          onClick={() => onNavigate('profile')}
          title="My Profile"
          style={{ width: 'auto', padding: '0 12px', gap: '8px' }}
        >
          <UserIcon size={16} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
            {user?.full_name?.split(' ')[0] || user?.username || 'User'}
          </span>
        </button>
      </div>
    </header>
  );
}
