import React from 'react';

export default function StatCard({ label, value, subtext, icon: Icon, colorTheme = 'blue' }) {
  const iconThemeClass = `stat-icon-${colorTheme}`;

  return (
    <div className="stat-card">
      <div className={`stat-icon-wrapper ${iconThemeClass}`}>
        {Icon && <Icon size={24} />}
      </div>
      <div className="stat-content">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>
    </div>
  );
}
