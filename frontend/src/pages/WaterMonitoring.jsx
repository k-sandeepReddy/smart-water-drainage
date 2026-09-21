import React from 'react';
import StatCard from '../components/StatCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { TrendLineChart, HorizontalBarChart, DonutChart } from '../components/OfflineCharts.jsx';
import { WaterDropIcon, AlertTriangleIcon, ActivityIcon } from '../components/Icons.jsx';

export default function WaterMonitoring() {
  // Prototype demo operational metrics
  const statusSummary = {
    currentStatus: 'Warning',
    activeAlerts: 4,
    averagePressure: '1.8 Bar',
    tankerDispatches: 6
  };

  const areaWiseIssues = {
    'B.C. Colony': 14,
    'Temple Street': 8,
    'Market Junction': 6,
    'Z.P. High School Lane': 5,
    'North Canal Road': 3
  };

  const supplySchedule = [
    { area: 'B.C. Colony', timing: '06:00 AM - 07:30 AM', status: 'Irregular (Low Pressure)', color: '#d97706' },
    { area: 'Temple Street', timing: '07:30 AM - 09:00 AM', status: 'Normal Supply', color: '#059669' },
    { area: 'Market Street', timing: '05:30 PM - 07:00 PM', status: 'Normal Supply', color: '#059669' },
    { area: 'Panchayat Area', timing: '07:00 PM - 08:30 PM', status: 'Pipeline Repair in Progress', color: '#dc2626' }
  ];

  const pressureTrend = [
    { label: '06:00', value: 2.2 },
    { label: '09:00', value: 1.9 },
    { label: '12:00', value: 1.4 },
    { label: '15:00', value: 1.2 },
    { label: '18:00', value: 1.8 },
    { label: '21:00', value: 2.1 }
  ];

  return (
    <div className="page-body">
      {/* Disclaimer Banner */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
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
          <span style={{ backgroundColor: '#2563eb', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
            Prototype Demo Data
          </span>
          <span style={{ fontSize: '0.84rem', color: '#1e3a8a', fontWeight: 600 }}>
            Water Supply Operational Monitoring Dashboard
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Simulated telemetry for civic engineering demonstration
        </span>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          Water Monitoring & Diagnostics
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
          Real-time pressure logs, area-wise shortage metrics, and municipal supply schedules.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Current Water Status"
          value={statusSummary.currentStatus}
          subtext="Moderate summer deficit"
          icon={WaterDropIcon}
          colorTheme="orange"
        />
        <StatCard
          label="Active Shortage Reports"
          value={statusSummary.activeAlerts}
          subtext="Citizen grievance tickets"
          icon={AlertTriangleIcon}
          colorTheme="red"
        />
        <StatCard
          label="Average Line Pressure"
          value={statusSummary.averagePressure}
          subtext="Main distribution line"
          icon={ActivityIcon}
          colorTheme="blue"
        />
        <StatCard
          label="Emergency Tankers"
          value={statusSummary.tankerDispatches}
          subtext="Dispatched this week"
          icon={WaterDropIcon}
          colorTheme="cyan"
        />
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <ChartCard
          title="Daily Distribution Line Pressure (Bar)"
          subtitle="24-hour sensor pressure telemetry"
          badgeText="Simulated Telemetry"
        >
          <TrendLineChart
            data={pressureTrend}
            height={200}
            lineColor="#0284c7"
          />
        </ChartCard>

        <ChartCard
          title="Area-Wise Water Complaints"
          subtitle="Grievance density by locality sector"
          badgeText="Report Counts"
        >
          <HorizontalBarChart
            data={areaWiseIssues}
            color="#2563eb"
          />
        </ChartCard>
      </div>

      {/* Municipal Supply Schedule Table */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>
          Ramaswami Peta Water Supply Schedule & Outage Log
        </h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Locality / Sector</th>
                <th>Designated Supply Hours</th>
                <th>Operational Status</th>
              </tr>
            </thead>
            <tbody>
              {supplySchedule.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.area}</td>
                  <td>🕒 {item.timing}</td>
                  <td>
                    <span style={{ color: item.color, fontWeight: 700, fontSize: '0.82rem' }}>
                      ● {item.status}
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
