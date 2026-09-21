import React, { useState, useEffect } from 'react';
import OfflineMap from '../components/OfflineMap.jsx';
import ComplaintModal from '../components/ComplaintModal.jsx';
import { RefreshCwIcon, MapPinIcon } from '../components/Icons.jsx';

/**
 * Reusable Community Map Component
 * Used in both:
 * - Admin Dashboard: <CommunityMap role="admin" api={api} />
 * - Resident Dashboard: <CommunityMap role="resident" api={api} />
 * 
 * Uses the authentic local satellite image of Ramaswami Peta (3WHH+7P6).
 * 100% Offline with zero external map services.
 */
export default function CommunityMap({ api, role = 'resident' }) {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derive role from prop or stored user session
  const effectiveRole = role || api?.getUser()?.role || 'resident';
  const isAdmin = effectiveRole === 'admin';

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await api.getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error('Error loading complaints for map:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  return (
    <div className="page-body">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                backgroundColor: '#eff6ff',
                color: '#1e40af',
                border: '1px solid #bfdbfe',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <MapPinIcon size={12} color="#1e40af" />
              3WHH+7P6 • Ramaswamipeta, Kanavaram
            </span>
          </div>

          {/* Heading and Subtitle customized by Role */}
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            {isAdmin ? 'Community Map' : 'Community Issues'}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
            {isAdmin
              ? 'Monitor reported water and drainage issues in Ramaswami Peta.'
              : 'View reported water and drainage issues in your community.'}
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadComplaints} title="Refresh Map Markers">
          <RefreshCwIcon size={16} /> Refresh Map Markers
        </button>
      </div>

      {/* Satellite Map Container */}
      <div className="card" style={{ padding: '8px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            Loading satellite map and community issue markers...
          </div>
        ) : (
          <OfflineMap
            complaints={complaints}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            role={effectiveRole}
          />
        )}
      </div>

      {/* Full Complaint Details Modal */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          isAdmin={isAdmin}
          onStatusUpdated={() => {
            loadComplaints();
            setSelectedComplaint(null);
          }}
        />
      )}
    </div>
  );
}
