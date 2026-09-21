import React from 'react';
import { BellIcon, CheckCircleIcon, CloseIcon, ClockIcon } from './Icons.jsx';
import { formatISTTimeOnly } from '../utils/date.js';

export default function NotificationPanel({ notifications = [], onClose, onMarkRead, onMarkAllRead, onSelectNotification = null }) {
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div
      style={{
        position: 'fixed',
        top: '64px',
        right: '24px',
        width: '360px',
        maxWidth: 'calc(100vw - 32px)',
        backgroundColor: '#ffffff',
        borderRadius: '14px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e2e8f0',
        zIndex: 90,
        overflow: 'hidden',
        animation: 'fadeIn 0.15s ease'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BellIcon size={18} color="#2563eb" />
          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>Local Notifications</h4>
          {unreadCount > 0 && (
            <span
              style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '10px'
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <CloseIcon size={16} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: '#94a3b8', fontSize: '0.84rem' }}>
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.is_read) onMarkRead(n.id);
                if (onSelectNotification) onSelectNotification(n);
              }}
              style={{
                padding: '12px 18px',
                borderBottom: '1px solid #f1f5f9',
                backgroundColor: n.is_read ? '#ffffff' : '#f0f7ff',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                <h5 style={{ fontSize: '0.84rem', fontWeight: n.is_read ? 600 : 700, color: '#0f172a' }}>
                  {n.title}
                </h5>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  {formatISTTimeOnly(n.created_at)}
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                {n.message}
              </p>
              {n.complaint_id && (
                <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '0.7rem', color: '#2563eb', fontWeight: 700 }}>
                  Ref: {n.complaint_id}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
