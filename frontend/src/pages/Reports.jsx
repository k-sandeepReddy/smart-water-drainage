import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import { DonutChart, HorizontalBarChart } from '../components/OfflineCharts.jsx';
import { DownloadIcon, PrinterIcon, RefreshCwIcon, FilterIcon, FileTextIcon, CheckCircleIcon } from '../components/Icons.jsx';
import { formatISTDateTime } from '../utils/date.js';

export default function Reports({ api }) {
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReportsSummary({ category, status, priority });
      setSummaryData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [category, status, priority]);

  const handleExportCsv = async () => {
    try {
      const csvText = await api.exportReportsCsv({ category, status, priority });
      // Create local offline blob download
      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `complaints_report_ramaswami_peta_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV: ' + err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-body">
      {/* Header with Export & Print Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Municipal Reports & Analytics
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
            Generate resolution summaries and export audit records for Ramaswami Peta.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={fetchSummary} title="Refresh">
            <RefreshCwIcon size={16} /> Refresh
          </button>
          <button className="btn btn-secondary" onClick={handlePrint} title="Print Report">
            <PrinterIcon size={16} /> Print Report
          </button>
          <button className="btn btn-primary" onClick={handleExportCsv} title="Download CSV">
            <DownloadIcon size={16} /> Export Offline CSV
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FilterIcon size={16} /> Filter Scope:
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Category:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Drainage">Drainage</option>
              <option value="Stagnant Water">Stagnant Water</option>
              <option value="Garbage">Garbage</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Status:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Priority:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="stats-grid">
        <StatCard
          label="Filtered Complaints"
          value={summaryData?.total_complaints ?? 0}
          subtext="Matching criteria"
          icon={FileTextIcon}
          colorTheme="blue"
        />
        <StatCard
          label="Resolution Rate"
          value={summaryData?.resolution_rate || '0%'}
          subtext="Resolved / Total"
          icon={CheckCircleIcon}
          colorTheme="green"
        />
        <StatCard
          label="Resolved Count"
          value={summaryData?.resolved ?? 0}
          subtext="Closed tickets"
          icon={CheckCircleIcon}
          colorTheme="cyan"
        />
        <StatCard
          label="Active In Progress"
          value={(summaryData?.in_progress ?? 0) + (summaryData?.assigned ?? 0)}
          subtext="Under repair / assigned"
          icon={RefreshCwIcon}
          colorTheme="orange"
        />
      </div>

      {/* Breakdown Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        <ChartCard
          title="Filtered Category Breakdown"
          subtitle="Distribution of selected complaints by type"
          badgeText="Summary"
        >
          <HorizontalBarChart
            data={summaryData?.category_breakdown || {}}
            color="#2563eb"
          />
        </ChartCard>

        <ChartCard
          title="Resolution Pipeline Distribution"
          subtitle="Progress distribution of active filtered records"
          badgeText="Resolution"
        >
          <DonutChart
            data={{
              Pending: summaryData?.pending || 0,
              Assigned: summaryData?.assigned || 0,
              'In Progress': summaryData?.in_progress || 0,
              Resolved: summaryData?.resolved || 0
            }}
            size={190}
            centerLabel="Total"
            centerValue={summaryData?.total_complaints}
          />
        </ChartCard>
      </div>

      {/* Filtered Records Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Detailed Report Audit Table</h3>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Ready for local CSV export or printout
          </span>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category</th>
                <th>Problem Type</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {!summaryData?.complaints || summaryData.complaints.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No records found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                summaryData.complaints.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 700, color: '#2563eb' }}>{c.id}</td>
                    <td>{c.category}</td>
                    <td style={{ fontWeight: 600 }}>{c.problem_type}</td>
                    <td>📍 {c.location}</td>
                    <td>
                      <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>{c.priority}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.76rem', fontWeight: 700 }}>{c.status}</span>
                    </td>
                    <td>{c.assigned_to}</td>
                    <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {formatISTDateTime(c.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
