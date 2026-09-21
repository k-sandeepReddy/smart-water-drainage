import React, { useState, useEffect } from 'react';
import { BellIcon, CheckCircleIcon, RefreshCwIcon } from '../components/Icons.jsx';
import { formatISTDateTime } from '../utils/date.js';

export default function Notifications({ api, onNavigate, onSelectComplaint = null }) {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  });

  return (
    <div className="page-body" style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Local Notification Center
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
            Real-time status alerts for complaints and civic maintenance in Ramaswami Peta.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={loadNotifications} title="Refresh">
            <RefreshCwIcon size={16} /> Refresh
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleMarkAllRead}>
            Mark All Read
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['all', 'unread', 'read'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: filter === f ? '#2563eb' : '#cbd5e1',
              backgroundColor: filter === f ? '#2563eb' : '#ffffff',
              color: filter === f ? '#ffffff' : '#475569',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {f} {f === 'unread' ? `(${notifications.filter((n) => !n.is_read).length})` : ''}
          </button>
        ))}
      </div>

      {/* Notifications Card List */}
      <div className="card">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
            No notifications found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: '10px',
                  border: '1px solid',
                  borderColor: n.is_read ? '#e2e8f0' : '#bfdbfe',
                  backgroundColor: n.is_read ? '#ffffff' : '#f0f7ff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {!n.is_read && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563eb' }} />
                    )}
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                      {n.title}
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5 }}>
                    {n.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      🕒 {formatISTDateTime(n.created_at)}
                    </span>
                    {n.complaint_id && (
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#2563eb' }}>
                        Ref: {n.complaint_id}
                      </span>
                    )}
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleMarkRead(n.id)}
                    title="Mark as read"
                  >
                    <CheckCircleIcon size={14} /> Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
