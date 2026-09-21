import React from 'react';
import { AlertTriangleIcon } from './Icons.jsx';

export default function PriorityBadge({ priority }) {
  switch (priority) {
    case 'High':
      return (
        <span className="badge priority-high">
          <AlertTriangleIcon size={12} />
          High
        </span>
      );
    case 'Medium':
      return (
        <span className="badge priority-medium">
          Medium
        </span>
      );
    case 'Low':
      return (
        <span className="badge priority-low">
          Low
        </span>
      );
    default:
      return <span className="badge priority-low">{priority || 'Normal'}</span>;
  }
}
