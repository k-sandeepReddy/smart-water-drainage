import React, { useState, useRef } from 'react';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import {
  WaterDropIcon,
  DrainageIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  MapPinIcon,
  CloseIcon,
  EyeIcon,
  FilterIcon
} from './Icons.jsx';
import { formatISTDateTime } from '../utils/date.js';
import satelliteMapImg from '../assets/maps/ramaswami-peta-satellite.png';

/**
 * Offline Satellite Community Map
 * Uses the authentic local satellite image of Ramaswami Peta (3WHH+7P6, Kanavaram, AP 533294).
 * Overlays dynamic complaint pins, project location pin, and interactive controls.
 * 100% Offline with zero external map services.
 */

// Fixed landmark positions on the satellite image (in percentage coordinates)
const ANCHOR_COORDINATES = [
  { x: 38.5, y: 34.0, defaultType: 'Water Supply' },     // North-West residential lane
  { x: 57.5, y: 32.5, defaultType: 'Drainage' },         // North-East entrance lane near ADB Road
  { x: 67.0, y: 45.0, defaultType: 'Water Supply' },     // East lane along the lake/pond
  { x: 34.5, y: 48.0, defaultType: 'Drainage' },         // West boundary residential street
  { x: 58.0, y: 52.0, defaultType: 'Stagnant Water' },   // Central-East residential plot
  { x: 44.0, y: 56.5, defaultType: 'Resolved' },         // Central lane cross
  { x: 36.5, y: 66.0, defaultType: 'Stagnant Water' },   // South-West corner residential street
  { x: 56.5, y: 65.0, defaultType: 'Drainage' },         // South-East residential cluster
  { x: 47.0, y: 73.5, defaultType: 'Water Supply' },     // South entrance / temple lane
  { x: 58.5, y: 77.0, defaultType: 'Resolved' },         // South-East edge near fields
];

export default function OfflineMap({
  complaints = [],
  onSelectComplaint = null,
  role = 'resident'
}) {
  const isAdmin = role === 'admin';
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);

  // Map complaints deterministically to percentage coordinates
  const mappedIssues = complaints.map((c, idx) => {
    const anchor = ANCHOR_COORDINATES[idx % ANCHOR_COORDINATES.length];
    return {
      id: c.id,
      category: c.category,
      problem_type: c.problem_type,
      location: c.location,
      priority: c.priority,
      status: c.status,
      created_at: c.created_at,
      description: c.description,
      x: anchor.x,
      y: anchor.y,
      rawComplaint: c
    };
  });

  // Filter issues based on active filter button
  const filteredIssues = mappedIssues.filter((issue) => {
    if (filterCategory === 'All') return true;
    if (filterCategory === 'Resolved') return issue.status === 'Resolved';
    if (filterCategory === 'Water Issue') return issue.category === 'Water Supply' && issue.status !== 'Resolved';
    if (filterCategory === 'Drainage Issue') return issue.category === 'Drainage' && issue.status !== 'Resolved';
    if (filterCategory === 'Stagnant Water') return issue.category === 'Stagnant Water' && issue.status !== 'Resolved';
    return true;
  });

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.3, 3.0));
  const handleZoomOut = () => {
    setZoomLevel((prev) => {
      const next = Math.max(prev - 0.3, 1.0);
      if (next === 1.0) setPanOffset({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedMarker(null);
    setShowLocationPopup(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Pan / Drag handlers
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom handler
  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoomLevel((prev) => {
      const next = Math.max(1.0, Math.min(3.0, prev * factor));
      if (next === 1.0) {
        setPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
  };

  // Marker icon & color
  const getMarkerStyling = (issue) => {
    if (issue.status === 'Resolved') {
      return {
        bgColor: '#10b981',
        borderColor: '#ffffff',
        icon: <CheckCircleIcon size={14} color="#ffffff" />,
        label: 'Resolved Issue'
      };
    }
    if (issue.category === 'Water Supply') {
      return {
        bgColor: '#2563eb',
        borderColor: '#ffffff',
        icon: <WaterDropIcon size={14} color="#ffffff" />,
        label: 'Water Issue'
      };
    }
    if (issue.category === 'Drainage') {
      return {
        bgColor: '#f97316',
        borderColor: '#ffffff',
        icon: <DrainageIcon size={14} color="#ffffff" />,
        label: 'Drainage Issue'
      };
    }
    if (issue.category === 'Stagnant Water') {
      return {
        bgColor: '#ef4444',
        borderColor: '#ffffff',
        icon: <AlertTriangleIcon size={14} color="#ffffff" />,
        label: 'Stagnant Water'
      };
    }
    return {
      bgColor: '#8b5cf6',
      borderColor: '#ffffff',
      icon: <AlertTriangleIcon size={14} color="#ffffff" />,
      label: issue.category
    };
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#090d16',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.4)',
        border: '1px solid #1e293b',
        userSelect: 'none',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Top Filter Bar */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 30,
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(8px)',
          padding: '6px 12px',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}
      >
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', padding: '0 4px' }}>
          <FilterIcon size={13} color="#94a3b8" /> Filter:
        </span>
        {['All', 'Water Issue', 'Drainage Issue', 'Stagnant Water', 'Resolved'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            style={{
              border: 'none',
              backgroundColor: filterCategory === cat ? '#2563eb' : 'transparent',
              color: filterCategory === cat ? '#ffffff' : '#cbd5e1',
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Floating Map Legend (Upper-Right Corner) */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 30,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          minWidth: '180px'
        }}
      >
        <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Map Legend
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.76rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <WaterDropIcon size={9} color="#fff" />
            </span>
            <span>Blue — Water Issue</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#f97316', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <DrainageIcon size={9} color="#fff" />
            </span>
            <span>Orange — Drainage Issue</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangleIcon size={9} color="#fff" />
            </span>
            <span>Red — Stagnant Water</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleIcon size={9} color="#fff" />
            </span>
            <span>Green — Resolved Issue</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b', fontWeight: 600, borderTop: '1px solid #f1f5f9', paddingTop: '6px' }}>
            <MapPinIcon size={14} color="#dc2626" />
            <span>Red Pin — Ramaswami Peta</span>
          </div>
        </div>
      </div>

      {/* Floating Location Card (Bottom-Left) */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          zIndex: 30,
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
          padding: '10px 14px',
          boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          maxWidth: '260px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 800, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <MapPinIcon size={13} />
          <span>PROJECT LOCATION</span>
        </div>
        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '2px 0' }}>
          Ramaswami peta
        </div>
        <div style={{ fontSize: '0.74rem', color: '#cbd5e1', lineHeight: 1.3 }}>
          3WHH+7P6 • Kanavaram,<br />
          Andhra Pradesh 533294
        </div>
      </div>

      {/* Floating Interactive Controls (Zoom, Reset, Fullscreen) */}
      <div
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <button
          onClick={handleZoomIn}
          style={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            fontWeight: 800,
            fontSize: '1.2rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            width: 36,
            height: 36,
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            fontWeight: 800,
            fontSize: '1.2rem',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={handleResetView}
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}
          title="Reset View"
        >
          Reset View
        </button>
        <button
          onClick={toggleFullscreen}
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            color: '#334155',
            border: '1px solid #cbd5e1',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
          }}
          title="Toggle Fullscreen"
        >
          {isFullscreen ? 'Exit' : 'Fullscreen'}
        </button>
      </div>

      {/* Map Viewport & Satellite Canvas */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          position: 'relative',
          width: '100%',
          height: isFullscreen ? '100vh' : '640px',
          overflow: 'hidden',
          cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          {/* Authentic Satellite Imagery Asset */}
          <img
            src={satelliteMapImg}
            alt="Ramaswami Peta Satellite View"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />

          {/* Project Location Marker: Ramaswami Peta (3WHH+7P6 at 42.8%, 47.7%) */}
          <div
            onClick={() => {
              setSelectedMarker(null);
              setShowLocationPopup(!showLocationPopup);
            }}
            style={{
              position: 'absolute',
              left: '42.8%',
              top: '47.7%',
              transform: 'translate(-50%, -100%)',
              zIndex: 25,
              cursor: 'pointer',
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))',
              transition: 'transform 0.15s ease'
            }}
            title="Project Location: Ramaswami peta (3WHH+7P6)"
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50% 50% 50% 0',
                backgroundColor: '#dc2626',
                border: '2.5px solid #ffffff',
                transform: 'rotate(-45deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.4)'
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                color: '#ffffff',
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                marginTop: '4px',
                whiteSpace: 'nowrap',
                textAlign: 'center',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              Ramaswami peta • 3WHH+7P6
            </div>
          </div>

          {/* Project Location Info Popup */}
          {showLocationPopup && (
            <div
              style={{
                position: 'absolute',
                left: '42.8%',
                top: '45%',
                transform: 'translate(-50%, -100%)',
                zIndex: 40,
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.35)',
                border: '1px solid #cbd5e1',
                width: '270px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Ramaswami Peta
                  </h4>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                    3WHH+7P6
                  </div>
                </div>
                <button
                  onClick={() => setShowLocationPopup(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <CloseIcon size={14} />
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4, margin: '8px 0 10px' }}>
                Ramaswamipeta, Kanavaram,<br />
                Andhra Pradesh 533294
              </p>
              <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 700, backgroundColor: '#eff6ff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                ✓ Official CSP Project Location
              </div>
            </div>
          )}

          {/* Community Issue Markers (Positioned via percentage coordinates) */}
          {filteredIssues.map((issue) => {
            const style = getMarkerStyling(issue);
            const isSelected = selectedMarker?.id === issue.id;

            return (
              <div
                key={issue.id}
                onClick={() => {
                  setShowLocationPopup(false);
                  setSelectedMarker(issue);
                }}
                style={{
                  position: 'absolute',
                  left: `${issue.x}%`,
                  top: `${issue.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isSelected ? 28 : 20,
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease'
                }}
                title={`${issue.problem_type} (${issue.id})`}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: style.bgColor,
                    border: `2.5px solid ${style.borderColor}`,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isSelected ? 'scale(1.3)' : 'scale(1)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {style.icon}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Issue Details Popup Card */}
        {selectedMarker && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '360px',
              maxWidth: 'calc(100% - 40px)',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 20px 30px -5px rgba(0, 0, 0, 0.4)',
              border: '1px solid #cbd5e1',
              padding: '18px 20px',
              zIndex: 40,
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb' }}>
                  Complaint ID: {selectedMarker.id}
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
                  {selectedMarker.category.toUpperCase()} ISSUE
                </h4>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                  {selectedMarker.problem_type}
                </div>
              </div>
              <button
                onClick={() => setSelectedMarker(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', margin: '8px 0 12px' }}>
              <StatusBadge status={selectedMarker.status} />
              <PriorityBadge priority={selectedMarker.priority} />
            </div>

            <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.4, marginBottom: '10px' }}>
              <div><strong>Location:</strong> 📍 {selectedMarker.location}</div>
              <div style={{ marginTop: '4px' }}>
                <strong>Reported On:</strong> 🕒 {formatISTDateTime(selectedMarker.created_at)}
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4, marginBottom: '14px', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              {selectedMarker.description}
            </p>

            {onSelectComplaint && (
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', fontWeight: 700 }}
                onClick={() => onSelectComplaint(selectedMarker.rawComplaint)}
              >
                <EyeIcon size={14} /> {isAdmin ? 'View Complaint' : 'View Complaint Info'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
