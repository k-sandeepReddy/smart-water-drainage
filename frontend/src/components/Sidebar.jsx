import React from 'react';
import {
  WaterDropIcon,
  DrainageIcon,
  MapPinIcon,
  BellIcon,
  UserIcon,
  LogOutIcon,
  FileTextIcon,
  LayersIcon,
  PlusCircleIcon,
  ActivityIcon
} from './Icons.jsx';

export default function Sidebar({ currentView, onNavigate, user, onLogout }) {
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-icon">
          <WaterDropIcon size={22} color="#ffffff" />
        </div>
        <div className="brand-info">
          <span className="brand-title">Smart Water & Drainage</span>
          <span className="brand-subtitle">Ramaswami Peta, Rajanagaram</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <span className="nav-section-title">Navigation</span>

        {/* Resident Links */}
        {!isAdmin && (
          <>
            <button
              className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              <ActivityIcon className="nav-item-icon" />
              <span>Dashboard</span>
            </button>

            <button
              className={`nav-item ${currentView === 'report-problem' ? 'active' : ''}`}
              onClick={() => onNavigate('report-problem')}
            >
              <PlusCircleIcon className="nav-item-icon" />
              <span>Report Problem</span>
            </button>

            <button
              className={`nav-item ${currentView === 'my-complaints' ? 'active' : ''}`}
              onClick={() => onNavigate('my-complaints')}
            >
              <FileTextIcon className="nav-item-icon" />
              <span>My Complaints</span>
            </button>

            <button
              className={`nav-item ${currentView === 'community-map' ? 'active' : ''}`}
              onClick={() => onNavigate('community-map')}
            >
              <MapPinIcon className="nav-item-icon" />
              <span>Community Issues</span>
            </button>

            <button
              className={`nav-item ${currentView === 'notifications' ? 'active' : ''}`}
              onClick={() => onNavigate('notifications')}
            >
              <BellIcon className="nav-item-icon" />
              <span>Notifications</span>
            </button>

            <button
              className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
              onClick={() => onNavigate('profile')}
            >
              <UserIcon className="nav-item-icon" />
              <span>Profile Settings</span>
            </button>
          </>
        )}

        {/* Admin Links */}
        {isAdmin && (
          <>
            <button
              className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => onNavigate('dashboard')}
            >
              <ActivityIcon className="nav-item-icon" />
              <span>Dashboard</span>
            </button>

            <button
              className={`nav-item ${currentView === 'manage-complaints' ? 'active' : ''}`}
              onClick={() => onNavigate('manage-complaints')}
            >
              <LayersIcon className="nav-item-icon" />
              <span>Manage Complaints</span>
            </button>

            <button
              className={`nav-item ${currentView === 'water-monitoring' ? 'active' : ''}`}
              onClick={() => onNavigate('water-monitoring')}
            >
              <WaterDropIcon className="nav-item-icon" />
              <span>Water Monitoring</span>
            </button>

            <button
              className={`nav-item ${currentView === 'drainage-monitoring' ? 'active' : ''}`}
              onClick={() => onNavigate('drainage-monitoring')}
            >
              <DrainageIcon className="nav-item-icon" />
              <span>Drainage Monitoring</span>
            </button>

            <button
              className={`nav-item ${currentView === 'community-map' ? 'active' : ''}`}
              onClick={() => onNavigate('community-map')}
            >
              <MapPinIcon className="nav-item-icon" />
              <span>Community Map</span>
            </button>

            <button
              className={`nav-item ${currentView === 'reports' ? 'active' : ''}`}
              onClick={() => onNavigate('reports')}
            >
              <FileTextIcon className="nav-item-icon" />
              <span>Reports & Export</span>
            </button>

            <span className="nav-section-title">Support & Info</span>

            <button
              className={`nav-item ${currentView === 'notifications' ? 'active' : ''}`}
              onClick={() => onNavigate('notifications')}
            >
              <BellIcon className="nav-item-icon" />
              <span>Notifications</span>
            </button>

            <button
              className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
              onClick={() => onNavigate('profile')}
            >
              <UserIcon className="nav-item-icon" />
              <span>Profile Settings</span>
            </button>
          </>
        )}
      </nav>

      {/* User Footer & Logout */}
      <div className="sidebar-footer">
        <div className="user-profile-summary" style={{ marginBottom: '10px' }}>
          <div className="user-avatar">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-meta">
            <div className="user-name">{user?.full_name || user?.username}</div>
            <span className="user-role-badge">{user?.role || 'Resident'}</span>
          </div>
        </div>

        <button
          className="nav-item"
          onClick={onLogout}
          style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
        >
          <LogOutIcon className="nav-item-icon" color="#ef4444" />
          <span style={{ fontWeight: 600 }}>Logout</span>
        </button>
      </div>
    </aside>
  );
}
