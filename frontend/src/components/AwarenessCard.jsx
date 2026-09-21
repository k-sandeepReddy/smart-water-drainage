import React from 'react';
import { WaterDropIcon, CloudRainIcon, DrainageIcon, AlertTriangleIcon, CheckCircleIcon } from './Icons.jsx';

export default function AwarenessCard({ title, category, description, tips = [], iconName = 'water-drop' }) {
  const renderIcon = () => {
    switch (iconName) {
      case 'water-drop':
        return <WaterDropIcon size={26} color="#0284c7" />;
      case 'cloud-rain':
        return <CloudRainIcon size={26} color="#2563eb" />;
      case 'git-pull-request':
        return <DrainageIcon size={26} color="#f97316" />;
      case 'shield-alert':
        return <AlertTriangleIcon size={26} color="#ef4444" />;
      default:
        return <WaterDropIcon size={26} color="#0284c7" />;
    }
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          {renderIcon()}
        </div>
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
            {category}
          </span>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
            {title}
          </h3>
        </div>
      </div>

      <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
        {description}
      </p>

      <div style={{ marginTop: 'auto', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
          Actionable Community Tips
        </h4>
        <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tips.map((tip, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
              <span style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }}>
                <CheckCircleIcon size={14} />
              </span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
