import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard.jsx';
import ComplaintTable from '../components/ComplaintTable.jsx';
import ComplaintModal from '../components/ComplaintModal.jsx';
import {
  WaterDropIcon,
  DrainageIcon,
  AlertTriangleIcon,
  PlusCircleIcon,
  TrashIcon,
  MapPinIcon,
  RefreshCwIcon
} from '../components/Icons.jsx';

export default function ResidentDashboard({ api, user, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, complaintsData] = await Promise.all([
        api.getDashboardStats(),
        api.getComplaints({ my_only: true })
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
    loadDashboardData();
  }, []);

  const handleQuickReport = (category) => {
    // Navigate to report problem with pre-selected category
    onNavigate('report-problem', { preselectedCategory: category });
  };

  return (
    <div className="page-body">
      {/* Header Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Good Morning, {user?.full_name || 'Resident'}
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#64748b', marginTop: '4px' }}>
            Monitor and report water and drainage issues in your community.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={loadDashboardData} title="Refresh Data">
            <RefreshCwIcon size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('report-problem')}>
            <PlusCircleIcon size={16} /> Report New Issue
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px', borderRadius: '10px', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <StatCard
          label="Water Supply Status"
          value={stats?.water_supply_status || 'Normal'}
          subtext="Ramaswami Peta Grid"
          icon={WaterDropIcon}
          colorTheme="blue"
        />
        <StatCard
          label="Active Water Reports"
          value={stats?.active_water_reports ?? 0}
          subtext="Village-wide open reports"
          icon={WaterDropIcon}
          colorTheme="cyan"
        />
        <StatCard
          label="Drainage Issues"
          value={stats?.drainage_issues ?? 0}
          subtext="Blockages & overflows"
          icon={DrainageIcon}
          colorTheme="orange"
        />
        <StatCard
          label="Stagnant Water Reports"
          value={stats?.stagnant_water_reports ?? 0}
          subtext="Mosquito breeding alerts"
          icon={AlertTriangleIcon}
          colorTheme="red"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px' }}>
          Quick Action: File a Civic Report
        </h3>
        <div className="quick-actions-grid">
          <div className="action-card-btn" onClick={() => handleQuickReport('Water Supply')}>
            <div className="stat-icon-wrapper stat-icon-blue" style={{ width: 44, height: 44 }}>
              <WaterDropIcon size={22} />
            </div>
            <div>
              <div className="action-btn-title">Report Water Problem</div>
              <div className="action-btn-desc">Shortage, pipeline leak, or dirty tap water</div>
            </div>
          </div>

          <div className="action-card-btn" onClick={() => handleQuickReport('Drainage')}>
            <div className="stat-icon-wrapper stat-icon-orange" style={{ width: 44, height: 44 }}>
              <DrainageIcon size={22} />
            </div>
            <div>
              <div className="action-btn-title">Report Drainage Issue</div>
              <div className="action-btn-desc">Blocked drain, sewage overflow, or flooding</div>
            </div>
          </div>

          <div className="action-card-btn" onClick={() => handleQuickReport('Stagnant Water')}>
            <div className="stat-icon-wrapper stat-icon-red" style={{ width: 44, height: 44 }}>
              <AlertTriangleIcon size={22} />
            </div>
            <div>
              <div className="action-btn-title">Report Stagnant Water</div>
              <div className="action-btn-desc">Puddles, mosquito hazard, foul smell</div>
            </div>
          </div>

          <div className="action-card-btn" onClick={() => handleQuickReport('Garbage')}>
            <div className="stat-icon-wrapper stat-icon-cyan" style={{ width: 44, height: 44 }}>
              <TrashIcon size={22} />
            </div>
            <div>
              <div className="action-btn-title">Report Garbage</div>
              <div className="action-btn-desc">Waste accumulation choking drains</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">My Recent Complaints</h3>
            <p className="card-subtitle">Track status and updates of problems submitted by your account</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('my-complaints')}>
            View All Complaints
          </button>
        </div>

        <ComplaintTable
          complaints={complaints.slice(0, 5)}
          onSelectComplaint={(c) => setSelectedComplaint(c)}
          isAdmin={false}
        />
      </div>

      {/* Community Status Banner */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '14px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <MapPinIcon size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a8a' }}>
              Explore the Ramaswami Peta Community Map
            </h4>
            <p style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
              See interactive incident pins for water shortages and drainage blockages across our village.
            </p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('community-map')}>
          Open Prototype Community Map
        </button>
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          isAdmin={false}
        />
      )}
    </div>
  );
}
