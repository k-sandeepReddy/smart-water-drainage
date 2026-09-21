import React, { useState } from 'react';

const DEFAULT_PALETTE = [
  '#2563eb', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#64748b'  // Slate
];

/**
 * Pure SVG Donut Chart (Offline, no external chart libraries)
 */
export function DonutChart({ data = {}, size = 200, strokeWidth = 32, centerLabel = '', centerValue = '' }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const entries = Object.entries(data).filter(([_, val]) => val > 0);
  const total = entries.reduce((acc, [_, val]) => acc + val, 0);

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8', fontSize: '0.85rem' }}>
        No data available to display
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const slices = entries.map(([label, value], idx) => {
    const percentage = value / total;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += percentage * circumference;
    const color = DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];

    return {
      label,
      value,
      percentage: (percentage * 100).toFixed(1),
      strokeDasharray,
      strokeDashoffset,
      color
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          {slices.map((slice, idx) => (
            <circle
              key={slice.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={hoveredIdx === idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              style={{
                transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                opacity: hoveredIdx === null || hoveredIdx === idx ? 1 : 0.6,
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size,
            height: size,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            {hoveredIdx !== null ? slices[hoveredIdx].value : centerValue || total}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            {hoveredIdx !== null ? slices[hoveredIdx].label : centerLabel || 'Total'}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 14px', width: '100%' }}>
        {slices.map((slice, idx) => (
          <div
            key={slice.label}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              opacity: hoveredIdx === null || hoveredIdx === idx ? 1 : 0.5,
              transition: 'opacity 0.2s ease'
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: slice.color }} />
            <span style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 500 }}>
              {slice.label} <strong style={{ color: '#0f172a' }}>({slice.percentage}%)</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Pure SVG Vertical Bar Chart (Offline)
 */
export function BarChart({ data = [], xKey = 'label', yKey = 'value', height = 220, barColor = '#2563eb' }) {
  if (!data || data.length === 0) {
    return <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No data</div>;
  }

  const values = data.map((d) => d[yKey] || 0);
  const maxVal = Math.max(...values, 1);
  const svgWidth = 460;
  const paddingLeft = 40;
  const paddingBottom = 36;
  const paddingTop = 20;
  const paddingRight = 20;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const barWidth = Math.min(36, (chartWidth / data.length) * 0.6);

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${svgWidth} ${height}`} style={{ minWidth: 320 }}>
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + chartHeight * (1 - ratio);
          const gridVal = Math.round(maxVal * ratio);
          return (
            <g key={ratio}>
              <line x1={paddingLeft} y1={y} x2={svgWidth - paddingRight} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
                {gridVal}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const val = item[yKey] || 0;
          const barHeight = (val / maxVal) * chartHeight;
          const x = paddingLeft + (idx + 0.5) * (chartWidth / data.length) - barWidth / 2;
          const y = paddingTop + (chartHeight - barHeight);

          return (
            <g key={idx}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx="4"
                fill={barColor}
                style={{ transition: 'height 0.3s ease, y 0.3s ease' }}
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#0f172a"
              >
                {val}
              </text>
              <text
                x={x + barWidth / 2}
                y={height - 12}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
                fontWeight="500"
              >
                {item[xKey]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Pure CSS/SVG Horizontal Bar Chart (Offline)
 */
export function HorizontalBarChart({ data = {}, maxOverride = null, color = '#0284c7' }) {
  const entries = Object.entries(data);
  const total = entries.reduce((acc, [_, v]) => acc + v, 0);
  const maxVal = maxOverride || Math.max(...entries.map(([_, v]) => v), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
      {entries.map(([label, val], idx) => {
        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
        const widthPct = ((val / maxVal) * 100).toFixed(1);
        const itemColor = DEFAULT_PALETTE[idx % DEFAULT_PALETTE.length];

        return (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ fontWeight: 600, color: '#334155' }}>{label}</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                {val} <span style={{ color: '#64748b', fontWeight: 500 }}>({pct}%)</span>
              </span>
            </div>
            <div style={{ width: '100%', height: '9px', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${widthPct}%`,
                  height: '100%',
                  backgroundColor: itemColor || color,
                  borderRadius: '6px',
                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Pure SVG Trend Line Chart (Offline)
 */
export function TrendLineChart({ data = [], height = 180, lineColor = '#2563eb' }) {
  if (!data || data.length === 0) return null;

  const points = data.map((d) => d.value);
  const maxVal = Math.max(...points, 1);
  const minVal = Math.min(...points, 0);
  const range = maxVal - minVal || 1;

  const svgWidth = 400;
  const padding = 24;
  const chartW = svgWidth - padding * 2;
  const chartH = height - padding * 2;

  const coords = data.map((d, i) => {
    const x = padding + (i / (data.length - 1 || 1)) * chartW;
    const y = padding + (1 - (d.value - minVal) / range) * chartH;
    return { x, y, ...d };
  });

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPoints = `${coords[0].x},${height - padding} ${polylinePoints} ${coords[coords.length - 1].x},${height - padding}`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg width="100%" height={height} viewBox={`0 0 ${svgWidth} ${height}`}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((r) => {
          const y = padding + chartH * (1 - r);
          return <line key={r} x1={padding} y1={y} x2={svgWidth - padding} y2={y} stroke="#f1f5f9" strokeWidth="1" />;
        })}

        {/* Shaded Area */}
        <polygon points={areaPoints} fill="url(#trendGradient)" />

        {/* Line */}
        <polyline points={polylinePoints} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data Points */}
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r="4" fill="#ffffff" stroke={lineColor} strokeWidth="2.5" />
            <text x={c.x} y={height - 8} textAnchor="middle" fontSize="10" fill="#94a3b8">
              {c.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
