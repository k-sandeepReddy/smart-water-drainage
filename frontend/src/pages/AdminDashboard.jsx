import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { DonutChart, BarChart, HorizontalBarChart } from '../components/OfflineCharts.jsx';
import ComplaintTable from '../components/ComplaintTable.jsx';
import ComplaintModal from '../components/ComplaintModal.jsx';
import {
  WaterDropIcon,
  DrainageIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  LayersIcon,
  RefreshCwIcon
} from '../components/Icons.jsx';

export default function AdminDashboard({ api, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, complaintsData] = await Promise.all([
        api.getDashboardStats(),
        api.getComplaints()
      ]);
      setStats(statsData);
      setComplaints(complaintsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Critical pending issues
  const criticalComplaints = complaints.filter(
    (c) => c.priority === 'High' && c.status !== 'Resolved'
  );

  return (
    <div className="page-body">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Administrative Dashboard
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
            Municipal water & drainage operations overview for Ramaswami Peta, Rajanagaram.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={loadData} title="Refresh">
            <RefreshCwIcon size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('manage-complaints')}>
            <LayersIcon size={16} /> Manage Complaints
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Reports"
          value={stats?.total_reports ?? 0}
          subtext="Village-wide registry"
          icon={LayersIcon}
          colorTheme="blue"
        />
        <StatCard
          label="Water Issues"
          value={stats?.water_issues ?? 0}
          subtext="Supply & pressure alerts"
          icon={WaterDropIcon}
          colorTheme="cyan"
        />
        <StatCard
          label="Drainage Issues"
          value={stats?.drainage_issues ?? 0}
          subtext="Choked & overflow drains"
          icon={DrainageIcon}
          colorTheme="orange"
        />
        <StatCard
          label="Resolved"
          value={stats?.resolved_count ?? 0}
          subtext="Successfully closed"
          icon={CheckCircleIcon}
          colorTheme="green"
        />
        <StatCard
          label="Pending Triage"
          value={stats?.pending_count ?? 0}
          subtext="Awaiting initial assignment"
          icon={ClockIcon}
          colorTheme="orange"
        />
        <StatCard
          label="Critical Priority"
          value={stats?.critical_count ?? 0}
          subtext="Immediate action required"
          icon={AlertTriangleIcon}
          colorTheme="red"
        />
      </div>

      {/* Offline SVG Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Reports by Issue Type */}
        <ChartCard
          title="Reports by Issue Type"
          subtitle="Breakdown across civic categories"
          badgeText="Offline SVG"
        >
          <DonutChart
            data={stats?.reports_by_type || {}}
            size={210}
            centerLabel="Total"
            centerValue={stats?.total_reports}
          />
        </ChartCard>

        {/* Complaint Status Distribution */}
        <ChartCard
          title="Complaint Status"
          subtitle="Current operational pipeline"
          badgeText="Real-time SQLite"
        >
          <DonutChart
            data={stats?.complaint_status_distribution || {}}
            size={210}
            centerLabel="Active"
            centerValue={(stats?.pending_count || 0) + (stats?.in_progress_count || 0) + (stats?.assigned_count || 0)}
          />
        </ChartCard>

        {/* Priority Distribution */}
        <ChartCard
          title="Priority Distribution"
          subtitle="Rule-based triage classification"
          badgeText="Severity Rules"
        >
          <HorizontalBarChart
            data={stats?.priority_distribution || {}}
            color="#2563eb"
          />
        </ChartCard>

        {/* Weekly Trend Bar Chart */}
        <ChartCard
          title="Weekly Report Volume"
          subtitle="Daily reports across current week"
          badgeText="Daily Trends"
        >
          <BarChart
            data={stats?.weekly_trend || []}
            xKey="day"
            yKey="drainage"
            height={220}
            barColor="#f97316"
          />
        </ChartCard>
      </div>

      {/* Critical Action Items Table */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Recent Critical Priority Issues</h3>
            <p className="card-subtitle">Urgent water scarcity & severe drainage hazards requiring immediate deployment</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('manage-complaints')}>
            View All in Complaint Manager
          </button>
        </div>

        <ComplaintTable
          complaints={criticalComplaints}
          onSelectComplaint={(c) => setSelectedComplaint(c)}
          isAdmin={true}
        />
      </div>

      {/* Modal View */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          isAdmin={true}
        />
      )}
    </div>
  );
}
