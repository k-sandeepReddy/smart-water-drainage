import React, { useState, useEffect } from 'react';
import ComplaintTable from '../components/ComplaintTable.jsx';
import ComplaintModal from '../components/ComplaintModal.jsx';
import { PlusCircleIcon, RefreshCwIcon } from '../components/Icons.jsx';

export default function MyComplaints({ api, onNavigate }) {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComplaints = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getComplaints({ my_only: true });
      setComplaints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
            My Registered Complaints
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
            Track resolution timeline, assigned personnel, and municipal updates for your issues.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchComplaints} title="Refresh">
            <RefreshCwIcon size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('report-problem')}>
            <PlusCircleIcon size={16} /> Report New Issue
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '14px', borderRadius: '10px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Complaint List Card */}
      <div className="card">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
            Loading registered complaints...
          </div>
        ) : (
          <ComplaintTable
            complaints={complaints}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            isAdmin={false}
          />
        )}
      </div>

      {/* Details Modal */}
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
