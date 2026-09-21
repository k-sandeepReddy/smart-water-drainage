import React, { useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import { EyeIcon, SearchIcon, FilterIcon } from './Icons.jsx';
import { formatISTDateTimeShort } from '../utils/date.js';

export default function ComplaintTable({ complaints = [], onSelectComplaint, onQuickStatusChange = null, isAdmin = false }) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [sortField, setSortField] = useState('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  // Filtering
  const filtered = complaints.filter((c) => {
    if (filterCategory !== 'All' && c.category !== filterCategory) return false;
    if (filterStatus !== 'All' && c.status !== filterStatus) return false;
    if (filterPriority !== 'All' && c.priority !== filterPriority) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.problem_type.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === 'created_at') {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search & Filter Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search input */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px' }}
            placeholder="Search complaint ID, location, keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.82rem' }}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Drainage">Drainage</option>
            <option value="Stagnant Water">Stagnant Water</option>
            <option value="Garbage">Garbage</option>
            <option value="Other">Other</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.82rem' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '8px 12px', fontSize: '0.82rem' }}
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => { setSortField('id'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>
                Complaint ID {sortField === 'id' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th>Issue Type</th>
              <th>Category</th>
              <th>Location</th>
              <th onClick={() => { setSortField('created_at'); setSortAsc(!sortAsc); }} style={{ cursor: 'pointer' }}>
                Reported Date {sortField === 'created_at' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th>Priority</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  No complaints found matching current search/filter criteria.
                </td>
              </tr>
            ) : (
              sorted.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>{c.id}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{c.problem_type}</td>
                  <td>{c.category}</td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    📍 {c.location}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                    {formatISTDateTimeShort(c.created_at)}
                  </td>
                  <td>
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectComplaint(c)}
                        title="View Details"
                      >
                        <EyeIcon size={14} /> Details
                      </button>
                      {isAdmin && onQuickStatusChange && c.status !== 'Resolved' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onQuickStatusChange(c)}
                          title="Advance Status"
                        >
                          Update
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b' }}>
        <span>Showing {sorted.length} of {complaints.length} registered complaints</span>
      </div>
    </div>
  );
}
