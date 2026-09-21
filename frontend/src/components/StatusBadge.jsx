import React from 'react';
import { ClockIcon, CheckCircleIcon, AlertTriangleIcon, ActivityIcon } from './Icons.jsx';

export default function StatusBadge({ status }) {
  switch (status) {
    case 'Pending':
      return (
        <span className="badge badge-pending">
          <ClockIcon size={13} />
          Pending
        </span>
      );
    case 'Assigned':
      return (
        <span className="badge badge-assigned">
          <ActivityIcon size={13} />
          Assigned
        </span>
      );
    case 'In Progress':
      return (
        <span className="badge badge-in-progress">
          <ActivityIcon size={13} />
          In Progress
        </span>
      );
    case 'Resolved':
      return (
        <span className="badge badge-resolved">
          <CheckCircleIcon size={13} />
          Resolved
        </span>
      );
    default:
      return <span className="badge badge-pending">{status || 'Unknown'}</span>;
  }
}
