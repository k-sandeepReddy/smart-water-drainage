import React from 'react';

export default function ChartCard({ title, subtitle, badgeText, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{title}</h3>
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        {badgeText && (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '12px',
            backgroundColor: '#eff6ff',
            color: '#1e40af',
            border: '1px solid #dbeafe'
          }}>
            {badgeText}
          </span>
        )}
      </div>
      <div style={{ marginTop: '12px' }}>
        {children}
      </div>
    </div>
  );
}
