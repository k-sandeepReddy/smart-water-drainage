import React from 'react';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import { CloseIcon, MapPinIcon, ClockIcon, UserIcon, CheckCircleIcon } from './Icons.jsx';
import { formatISTDateTime } from '../utils/date.js';

export default function ComplaintModal({ complaint, onClose, onUpdateStatus = null, isAdmin = false }) {
  if (!complaint) return null;

  // Timeline steps
  const steps = [
    { key: 'Pending', label: 'Submitted' },
    { key: 'Assigned', label: 'Assigned' },
    { key: 'In Progress', label: 'In Progress' },
    { key: 'Resolved', label: 'Resolved' }
  ];

  const getStepStatus = (stepKey) => {
    const statusOrder = ['Pending', 'Assigned', 'In Progress', 'Resolved'];
    const currentIndex = statusOrder.indexOf(complaint.status);
    const stepIndex = statusOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2563eb' }}>{complaint.id}</span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>
              {complaint.problem_type}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* 4-Step Visual Status Timeline */}
        <div style={{ margin: '20px 0 28px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
            Resolution Progress Timeline
          </div>
          <div className="timeline-container">
            <div className="timeline-line" />
            {steps.map((step, idx) => {
              const state = getStepStatus(step.key);
              return (
                <div key={step.key} className="timeline-step">
                  <div className={`timeline-circle ${state}`}>
                    {state === 'completed' ? <CheckCircleIcon size={18} /> : idx + 1}
                  </div>
                  <span className="timeline-label" style={{ fontWeight: state === 'active' ? 700 : 500, color: state === 'active' ? '#1e3a8a' : '#64748b' }}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Category</span>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>{complaint.category}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Location</span>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>📍 {complaint.location}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Assigned Personnel</span>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>👤 {complaint.assigned_to || 'Unassigned'}</p>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Reported On</span>
            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
              🕒 {formatISTDateTime(complaint.created_at)}
            </p>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Incident Description</h4>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '8px' }}>
            {complaint.description}
          </p>
        </div>

        {/* Local Photo Preview or SVG Illustration */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Attached Site Evidence</h4>
          {complaint.photo_data ? (
            <img
              src={complaint.photo_data}
              alt="Complaint Site Evidence"
              style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }}
            />
          ) : (
            <div style={{ height: '90px', borderRadius: '8px', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.8rem', gap: '8px', backgroundColor: '#f8fafc' }}>
              <span>📷 No photo attached during local offline report</span>
            </div>
          )}
        </div>

        {/* Updates Audit Log */}
        {complaint.updates && complaint.updates.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>Update History & Audit Trail</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {complaint.updates.map((up) => (
                <div key={up.id} style={{ padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{up.updated_by}</span>
                    <span style={{ color: '#64748b' }}>{formatISTDateTime(up.timestamp)}</span>
                  </div>
                  <div style={{ color: '#475569' }}>
                    Status changed to <strong style={{ color: '#2563eb' }}>{up.new_status}</strong>: {up.comment}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
