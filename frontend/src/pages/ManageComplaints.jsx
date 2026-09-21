import React, { useState, useEffect } from 'react';
import ComplaintTable from '../components/ComplaintTable.jsx';
import ComplaintModal from '../components/ComplaintModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { CloseIcon, CheckCircleIcon, RefreshCwIcon, LayersIcon } from '../components/Icons.jsx';

export default function ManageComplaints({ api }) {
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editingComplaint, setEditingComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('Assigned');
  const [newPriority, setNewPriority] = useState('Medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const loadComplaints = async () => {
    setIsLoading(true);
    try {
      const data = await api.getComplaints();
      setComplaints(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const openStatusEditor = (complaint) => {
    setEditingComplaint(complaint);
    setNewStatus(complaint.status === 'Pending' ? 'Assigned' : complaint.status === 'Assigned' ? 'In Progress' : 'Resolved');
    setNewPriority(complaint.priority);
    setAssignedTo(complaint.assigned_to === 'Unassigned' ? 'Ward 3 Sanitation Crew' : complaint.assigned_to);
    setComment('');
    setFeedbackMsg('');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingComplaint) return;

    setIsUpdating(true);
    try {
      const updated = await api.updateComplaintStatus(editingComplaint.id, {
        status: newStatus,
        priority: newPriority,
        assigned_to: assignedTo,
        comment: comment || `Status updated to ${newStatus} by Municipal Admin.`
      });

      setFeedbackMsg(`Complaint ${updated.id} successfully updated to ${updated.status}!`);
      setTimeout(() => {
        setEditingComplaint(null);
        setFeedbackMsg('');
      }, 1200);

      loadComplaints();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Manage & Triage Civic Complaints
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
            Dispatch repair personnel, update status, and log resolution history for Ramaswami Peta.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadComplaints} title="Refresh">
          <RefreshCwIcon size={16} /> Refresh
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading civic grievances...
          </div>
        ) : (
          <ComplaintTable
            complaints={complaints}
            onSelectComplaint={(c) => setSelectedComplaint(c)}
            onQuickStatusChange={(c) => openStatusEditor(c)}
            isAdmin={true}
          />
        )}
      </div>

      {/* Status Update Modal */}
      {editingComplaint && (
        <div className="modal-backdrop" onClick={() => setEditingComplaint(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb' }}>{editingComplaint.id}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '2px 0' }}>
                  Update Complaint Status
                </h3>
              </div>
              <button
                onClick={() => setEditingComplaint(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {feedbackMsg ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: '#059669', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <CheckCircleIcon size={36} color="#059669" />
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{feedbackMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleUpdateSubmit}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '18px', fontSize: '0.84rem' }}>
                  <div><strong>Issue:</strong> {editingComplaint.problem_type}</div>
                  <div><strong>Location:</strong> {editingComplaint.location}</div>
                  <div style={{ marginTop: '4px', display: 'flex', gap: '8px' }}>
                    <span>Current:</span>
                    <StatusBadge status={editingComplaint.status} />
                    <PriorityBadge priority={editingComplaint.priority} />
                  </div>
                </div>

                {/* Target Status */}
                <div className="form-group">
                  <label className="form-label">New Status</label>
                  <select
                    className="form-select"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                {/* Priority override */}
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Assign Personnel */}
                <div className="form-group">
                  <label className="form-label">Assign Field Personnel / Department</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Ward 3 Sanitation Crew, Pipeline Team B..."
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  />
                </div>

                {/* Action / Resolution Comment */}
                <div className="form-group">
                  <label className="form-label">Audit Comment / Action Notes</label>
                  <textarea
                    className="form-textarea"
                    style={{ minHeight: '80px' }}
                    placeholder="Provide details about actions taken, parts replaced, or site inspection findings..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingComplaint(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUpdating}
                  >
                    {isUpdating ? 'Saving to SQLite...' : 'Save Status Update'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Details Modal */}
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
