import React from 'react';
import StatCard from '../components/StatCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { DonutChart, BarChart, HorizontalBarChart } from '../components/OfflineCharts.jsx';
import { DrainageIcon, AlertTriangleIcon, CheckCircleIcon, LayersIcon } from '../components/Icons.jsx';

export default function DrainageMonitoring() {
  const drainageStats = {
    openComplaints: 7,
    blockedDrains: 4,
    stagnantWaterPools: 5,
    desiltingCompleted: 12
  };

  const drainageTypes = {
    'Silt & Sludge Accumulation': 8,
    'Plastic & Solid Waste Blockage': 6,
    'Drain Overflow / Street Inundation': 4,
    'Broken Slab / Manhole Damage': 2
  };

  const hotspotAreas = {
    'Temple Street Main Drain': 7,
    'Post Office Low-Lying Lane': 5,
    'Z.P. High School Corner': 4,
    'Market Street Waste Point': 3
  };

  const desiltingProgress = [
    { ward: 'Ward 1 (Temple St)', progress: 85, status: 'Completed' },
    { ward: 'Ward 2 (B.C. Colony)', progress: 60, status: 'In Progress' },
    { ward: 'Ward 3 (School Lane)', progress: 40, status: 'In Progress' },
    { ward: 'Ward 4 (Post Office)', progress: 20, status: 'Scheduled' }
  ];

  return (
    <div className="page-body">
      {/* Disclaimer Banner */}
      <div
        style={{
          backgroundColor: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ backgroundColor: '#f97316', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
            Prototype Demo Data
          </span>
          <span style={{ fontSize: '0.84rem', color: '#9a3412', fontWeight: 600 }}>
            Drainage & Stormwater Flow Monitoring Dashboard
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Simulated operational data for civic engineering review
        </span>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          Drainage & Sanitation Monitoring
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
          Real-time tracking of stormwater canal flow, choked drains, and desilting operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Open Drainage Complaints"
          value={drainageStats.openComplaints}
          subtext="Active field tickets"
          icon={DrainageIcon}
          colorTheme="orange"
        />
        <StatCard
          label="Severely Blocked Drains"
          value={drainageStats.blockedDrains}
          subtext="Critical flow obstruction"
          icon={AlertTriangleIcon}
          colorTheme="red"
        />
        <StatCard
          label="Stagnant Water Pools"
          value={drainageStats.stagnantWaterPools}
          subtext="Vector breeding risks"
          icon={AlertTriangleIcon}
          colorTheme="orange"
        />
        <StatCard
          label="Desilting Cleaned"
          value={drainageStats.desiltingCompleted}
          subtext="Drain stretches cleared"
          icon={CheckCircleIcon}
          colorTheme="green"
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <ChartCard
          title="Root Causes of Drain Blockages"
          subtitle="Obstruction types identified during inspection"
          badgeText="Obstruction Types"
        >
          <DonutChart
            data={drainageTypes}
            size={200}
            centerLabel="Incidents"
            centerValue="20"
          />
        </ChartCard>

        <ChartCard
          title="Drainage Vulnerability Hotspots"
          subtitle="Locality sectors with repeat overflow complaints"
          badgeText="Hotspots"
        >
          <HorizontalBarChart
            data={hotspotAreas}
            color="#f97316"
          />
        </ChartCard>
      </div>

      {/* Desilting Progress Table */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>
          Monsoon Preparedness: Ward-Wise Drain Desilting Progress
        </h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ward Sector</th>
                <th>Desilting Progress</th>
                <th>Progress Bar</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {desiltingProgress.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.ward}</td>
                  <td style={{ fontWeight: 600 }}>{item.progress}%</td>
                  <td style={{ width: '40%' }}>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${item.progress}%`,
                          height: '100%',
                          backgroundColor: item.progress >= 80 ? '#10b981' : item.progress >= 40 ? '#f59e0b' : '#3b82f6'
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: item.status === 'Completed' ? '#047857' : '#b45309' }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
