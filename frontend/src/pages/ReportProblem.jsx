import React, { useState } from 'react';
import { calculatePriorityPreview } from '../utils/priority.js';
import { validateComplaint } from '../utils/validation.js';
import PriorityBadge from '../components/PriorityBadge.jsx';
import { CheckCircleIcon, AlertTriangleIcon, WaterDropIcon } from '../components/Icons.jsx';

const PROBLEM_TYPES_BY_CATEGORY = {
  'Water Supply': [
    'Severe Water Shortage',
    'Irregular Water Supply',
    'Drinking Water Pipeline Leakage',
    'Contaminated / Dirty Water',
    'Low Water Pressure',
    'Borewell Motor Breakdown',
    'Water Tanker Delayed'
  ],
  'Drainage': [
    'Blocked Major Drain',
    'Drain Overflowing on Street',
    'Sewage Backup into Compound',
    'Low-lying Street Flooding',
    'Broken Drain Slab / Cover',
    'Silt Accumulation in Drain'
  ],
  'Stagnant Water': [
    'Stagnant Water Near Homes',
    'Mosquito Breeding Hazard',
    'Waterlogged Vacant Plot',
    'Foul Smelling Water Pool'
  ],
  'Garbage': [
    'Garbage Accumulation in Drain',
    'Overflowing Community Bin',
    'Illegal Waste Dumping Near Water Source'
  ],
  'Other': [
    'General Community Suggestion',
    'Public Tap Repair Request',
    'Drainage Construction Request'
  ]
};

const RAMASWAMI_PETA_LOCATIONS = [
  'Main Road Junction, near Ramaswami Temple',
  'B.C. Colony, 1st Lane',
  'B.C. Colony, 2nd Lane',
  'Behind Z.P. High School Ground',
  'Panchayat Office Corner, Rajanagaram Road',
  'Market Street, near Milk Booth',
  'Post Office Lane, Ward 4',
  'Near Community Borewell / RO Plant',
  'Water Overhead Tank (OHT) Enclosure',
  'North Canal Road Side'
];

export default function ReportProblem({ api, onNavigate, initialCategory = 'Water Supply' }) {
  const [category, setCategory] = useState(initialCategory);
  const [problemType, setProblemType] = useState(PROBLEM_TYPES_BY_CATEGORY[initialCategory][0]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photoData, setPhotoData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  // Compute live rule-based priority preview
  const livePriority = calculatePriorityPreview(category, problemType, description);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    setProblemType(PROBLEM_TYPES_BY_CATEGORY[newCat][0]);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      category,
      problem_type: problemType,
      location,
      description,
      photo_data: photoData
    };

    const validation = validateComplaint(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.createComplaint(payload);
      setSubmittedComplaint(result);
    } catch (err) {
      alert(err.message || 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedComplaint) {
    return (
      <div className="page-body" style={{ maxWidth: '650px', textAlign: 'center', padding: '60px 20px' }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: '#d1fae5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}
        >
          <CheckCircleIcon size={42} />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          Complaint Submitted Successfully!
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '8px' }}>
          Your civic grievance has been registered in the Ramaswami Peta municipal database.
        </p>

        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '24px',
            margin: '28px 0',
            textAlign: 'left',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Complaint Reference ID:</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563eb' }}>{submittedComplaint.id}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Category:</span>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{submittedComplaint.category}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Assigned Priority:</span>
            <PriorityBadge priority={submittedComplaint.priority} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Current Status:</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b45309', backgroundColor: '#fef3c7', padding: '3px 10px', borderRadius: '12px' }}>
              Pending Triage
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Reported Location:</span>
            <span style={{ fontSize: '0.85rem', color: '#334155' }}>📍 {submittedComplaint.location}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('my-complaints')}
          >
            Track in My Complaints
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSubmittedComplaint(null);
              setLocation('');
              setDescription('');
              setPhotoData(null);
            }}
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-body" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
          Report Water or Drainage Issue
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>
          Submit local infrastructure grievances for Ramaswami Peta, Rajanagaram.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Category Selector */}
          <div className="form-group">
            <label className="form-label">Issue Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
              {Object.keys(PROBLEM_TYPES_BY_CATEGORY).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: category === cat ? '#2563eb' : '#cbd5e1',
                    backgroundColor: category === cat ? '#eff6ff' : '#ffffff',
                    color: category === cat ? '#1e40af' : '#475569',
                    fontWeight: category === cat ? 700 : 500,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && <span style={{ color: '#dc2626', fontSize: '0.74rem' }}>{errors.category}</span>}
          </div>

          {/* Problem Type Dropdown */}
          <div className="form-group">
            <label className="form-label">Specific Problem Type</label>
            <select
              className="form-select"
              value={problemType}
              onChange={(e) => setProblemType(e.target.value)}
            >
              {PROBLEM_TYPES_BY_CATEGORY[category].map((pt) => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
          </div>

          {/* Location with Quick Suggestions */}
          <div className="form-group">
            <label className="form-label">Location / Landmark in Ramaswami Peta</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Temple Street, near Community Borewell..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              list="location-suggestions"
            />
            <datalist id="location-suggestions">
              {RAMASWAMI_PETA_LOCATIONS.map((loc) => (
                <option key={loc} value={loc} />
              ))}
            </datalist>
            <span style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
              💡 Select a recognized landmark above or type your exact door number / street.
            </span>
            {errors.location && <span style={{ color: '#dc2626', fontSize: '0.74rem' }}>{errors.location}</span>}
          </div>

          {/* Detailed Description */}
          <div className="form-group">
            <label className="form-label">Detailed Problem Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the severity, duration (e.g. since 3 days), and impact on neighboring homes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && <span style={{ color: '#dc2626', fontSize: '0.74rem' }}>{errors.description}</span>}
          </div>

          {/* Live Rule-Based Priority Indicator */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                Rule-Based Priority System (Automated Civic Triage)
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                Calculated based on hazard severity, public health keywords, and category rules.
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Priority:</span>
              <PriorityBadge priority={livePriority} />
            </div>
          </div>

          {/* Photo Upload (Offline local file preview) */}
          <div className="form-group">
            <label className="form-label">Site Photo Evidence (Optional)</label>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              onChange={handlePhotoUpload}
              style={{ padding: '8px' }}
            />
            {photoData && (
              <div style={{ marginTop: '10px' }}>
                <img
                  src={photoData}
                  alt="Preview"
                  style={{ maxWidth: '180px', maxHeight: '120px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onNavigate('dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registering Complaint...' : 'Submit Complaint (Save to SQLite)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
