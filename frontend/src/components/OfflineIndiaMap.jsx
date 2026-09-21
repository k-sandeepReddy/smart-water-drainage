import React, { useState, useEffect, useRef } from 'react';
import {
  SearchIcon,
  MapPinIcon,
  LayersIcon,
  CloseIcon,
  RefreshCwIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  WaterDropIcon,
  DrainageIcon,
  FilterIcon,
  EyeIcon
} from './Icons.jsx';
import StatusBadge from './StatusBadge.jsx';
import PriorityBadge from './PriorityBadge.jsx';
import { formatISTDateTime } from '../utils/date.js';

// Geographic Bounding Box for India GIS Projection
const MIN_LNG = 68.0;
const MAX_LNG = 97.5;
const MIN_LAT = 8.0;
const MAX_LAT = 37.5;
const SVG_WIDTH = 1000;
const SVG_HEIGHT = 1000;

/**
 * Projects (lng, lat) coordinates to SVG space (0..1000, 0..1000)
 */
function project(lng, lat) {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 900 + 50;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 900 + 50;
  return { x, y };
}

/**
 * Converts array of [lng, lat] to SVG polygon points string
 */
function coordsToSvgPoints(coords) {
  return coords
    .map((c) => {
      const p = project(c[0], c[1]);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');
}

export default function OfflineIndiaMap({
  complaints = [],
  onSelectComplaint = null,
  onSwitchToSatellite = null
}) {
  // Map State
  const [locations, setLocations] = useState([]);
  const [geoData, setGeoData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Viewport / Camera State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Layer Toggles
  const [layers, setLayers] = useState({
    boundaries: true,
    highways: true,
    rivers: true,
    cities: true,
    issues: true,
    projectArea: true
  });
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const containerRef = useRef(null);

  // Load offline data from public/maps/
  useEffect(() => {
    fetch('/maps/locations.json')
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.warn('Could not load locations.json offline data:', err));

    fetch('/maps/india-geo.json')
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.warn('Could not load india-geo.json offline data:', err));
  }, []);

  // Filter search results
  useEffect(() => {
    if (!searchQuery.trim() || !locations.length) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const q = searchQuery.toLowerCase().trim();
    const matches = locations.filter((loc) => {
      if (loc.name.toLowerCase().includes(q)) return true;
      if (loc.plusCode && loc.plusCode.toLowerCase().includes(q)) return true;
      if (loc.pincode && loc.pincode.includes(q)) return true;
      if (loc.state && loc.state.toLowerCase().includes(q)) return true;
      if (loc.district && loc.district.toLowerCase().includes(q)) return true;
      if (loc.keywords && loc.keywords.some((k) => k.toLowerCase().includes(q))) return true;
      return false;
    });

    setSearchResults(matches.slice(0, 8));
    setShowSearchDropdown(true);
  }, [searchQuery, locations]);

  // Navigate / Zoom to a specific location
  const navigateToLocation = (loc) => {
    setSelectedLocation(loc);
    setSelectedFeature(null);
    setSelectedIssue(null);
    setShowSearchDropdown(false);
    setSearchQuery(loc.name);

    // If Ramaswami Peta, center directly on it with high zoom
    const targetZoom = loc.zoom || (loc.type === 'project' ? 16 : loc.type === 'village' ? 13 : loc.type === 'town' ? 11 : loc.type === 'district' ? 8 : loc.type === 'state' ? 4 : 1);
    
    if (targetZoom === 1) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
      return;
    }

    const p = project(loc.lng, loc.lat);
    // Center p.x, p.y at (500, 500)
    const newPanX = 500 - p.x * targetZoom;
    const newPanY = 500 - p.y * targetZoom;

    setZoom(targetZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Zoom helpers
  const handleZoomIn = () => {
    setZoom((prev) => {
      const next = Math.min(prev * 1.4, 25);
      // Adjust pan to zoom into center (500, 500)
      setPan((p) => ({
        x: 500 - (500 - p.x) * (next / prev),
        y: 500 - (500 - p.y) * (next / prev)
      }));
      return next;
    });
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(prev / 1.4, 1);
      if (next === 1) {
        setPan({ x: 0, y: 0 });
      } else {
        setPan((p) => ({
          x: 500 - (500 - p.x) * (next / prev),
          y: 500 - (500 - p.y) * (next / prev)
        }));
      }
      return next;
    });
  };

  const handleResetToIndia = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedLocation(null);
    setSelectedFeature(null);
    setSelectedIssue(null);
    setSearchQuery('');
  };

  const handleJumpToProject = () => {
    const rp = locations.find((l) => l.id === 'PROJECT-RAMASWAMI-PETA');
    if (rp) {
      navigateToLocation(rp);
    } else {
      // Fallback
      navigateToLocation({
        name: 'Ramaswami Peta',
        lat: 17.0845,
        lng: 81.9023,
        zoom: 16,
        type: 'project',
        plusCode: '3WHH+7P6'
      });
    }
  };

  // Pan / Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.2 : 0.83;
    setZoom((prev) => {
      const next = Math.max(1, Math.min(25, prev * zoomFactor));
      if (next === 1) {
        setPan({ x: 0, y: 0 });
      } else {
        // Zoom relative to container
        const rect = containerRef.current?.getBoundingClientRect();
        const mouseX = rect ? e.clientX - rect.left : 500;
        const mouseY = rect ? e.clientY - rect.top : 500;

        setPan((p) => ({
          x: mouseX - (mouseX - p.x) * (next / prev),
          y: mouseY - (mouseY - p.y) * (next / prev)
        }));
      }
      return next;
    });
  };

  // Compute Active Breadcrumb Trail
  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'India', zoom: 1, action: handleResetToIndia }];

    if (zoom >= 2.5) {
      crumbs.push({
        label: 'Andhra Pradesh',
        zoom: 4,
        action: () => {
          const ap = locations.find((l) => l.id === 'IN-AP');
          if (ap) navigateToLocation(ap);
        }
      });
    }

    if (zoom >= 6.5) {
      crumbs.push({
        label: 'East Godavari',
        zoom: 8,
        action: () => {
          const eg = locations.find((l) => l.id === 'AP-EG');
          if (eg) navigateToLocation(eg);
        }
      });
    }

    if (zoom >= 10.5) {
      crumbs.push({
        label: 'Rajanagaram',
        zoom: 11,
        action: () => {
          const rjn = locations.find((l) => l.id === 'EG-RJN');
          if (rjn) navigateToLocation(rjn);
        }
      });
    }

    if (zoom >= 14) {
      crumbs.push({
        label: 'Ramaswami Peta (3WHH+7P6)',
        zoom: 16,
        action: handleJumpToProject,
        isCurrent: true
      });
    }

    return crumbs;
  };

  // Map complaints to coordinates (inside Ramaswami Peta)
  // Base anchor: 81.9023, 17.0845
  const mappedIssues = complaints.map((c, idx) => {
    // Subtle geographical distribution around Ramaswami Peta survey area
    const dLng = ((idx % 5) - 2) * 0.0018 + (Math.floor(idx / 5) * 0.0006);
    const dLat = (Math.floor(idx / 3) - 1) * 0.0015 - ((idx % 3) * 0.0005);
    const lng = 81.9023 + dLng;
    const lat = 17.0845 + dLat;
    const p = project(lng, lat);

    return {
      ...c,
      geoLng: lng,
      geoLat: lat,
      svgX: p.x,
      svgY: p.y
    };
  });

  // Marker Styling Helper
  const getIssueStyle = (issue) => {
    if (issue.status === 'Resolved') return { color: '#10b981', label: 'Resolved' };
    if (issue.category === 'Water Supply') return { color: '#2563eb', label: 'Water' };
    if (issue.category === 'Drainage') return { color: '#f97316', label: 'Drainage' };
    if (issue.category === 'Stagnant Water') return { color: '#ef4444', label: 'Stagnant' };
    return { color: '#8b5cf6', label: issue.category };
  };

  // Locations to display based on zoom level (LOD)
  const visibleLocations = locations.filter((loc) => {
    if (loc.type === 'country') return false; // India label drawn separately
    if (zoom < 3) {
      // National level: Only show major metros and Andhra Pradesh
      return loc.type === 'state' && loc.id === 'IN-AP' || ['CITY-DEL', 'CITY-BOM', 'CITY-BLR', 'CITY-MAA', 'CITY-CCU', 'CITY-HYD'].includes(loc.id);
    }
    if (zoom < 6) {
      // Regional level: Show states, state capitals, major cities
      return loc.type === 'state' || loc.type === 'city';
    }
    if (zoom < 10) {
      // District level: Show AP districts, East Godavari, Rajahmundry, Kakinada
      return loc.type === 'district' || loc.id === 'EG-RJY' || loc.id === 'CITY-VJA' || loc.id === 'CITY-VTZ';
    }
    if (zoom < 13) {
      // Mandal / Town level: Show East Godavari towns
      return loc.district === 'East Godavari' || loc.id === 'EG-RJN' || loc.id === 'EG-KNV';
    }
    // Deep zoom: Show local villages & Ramaswami Peta
    return loc.district === 'East Godavari' || loc.type === 'project';
  });

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
      {/* 1. TOP HEADER BAR: SEARCH, BREADCRUMBS, LAYER TOGGLE */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          zIndex: 40,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}
      >
        {/* Search Bar with Autocomplete */}
        <div style={{ position: 'relative', minWidth: '280px', maxWidth: '400px', flex: '1' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              padding: '6px 14px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}
          >
            <SearchIcon size={16} color="#94a3b8" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true);
              }}
              placeholder="Search India, AP, East Godavari, 3WHH+7P6..."
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                color: '#f8fafc',
                fontSize: '0.84rem',
                padding: '4px 8px',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowSearchDropdown(false);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: '1px solid #334155',
                boxShadow: '0 15px 30px rgba(0,0,0,0.6)',
                overflow: 'hidden',
                zIndex: 60
              }}
            >
              {searchResults.map((loc) => (
                <div
                  key={loc.id}
                  onClick={() => navigateToLocation(loc)}
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid #1e293b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {loc.type === 'project' && <span style={{ color: '#ef4444' }}>🎯</span>}
                      {loc.name}
                      {loc.plusCode && (
                        <span style={{ fontSize: '0.7rem', color: '#38bdf8', backgroundColor: '#0369a1', padding: '1px 6px', borderRadius: '4px' }}>
                          {loc.plusCode}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                      {loc.description || `${loc.state || ''} ${loc.district ? '• ' + loc.district : ''}`}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor:
                        loc.type === 'project'
                          ? '#ef4444'
                          : loc.type === 'district'
                          ? '#f59e0b'
                          : loc.type === 'state'
                          ? '#2563eb'
                          : '#475569',
                      color: '#ffffff'
                    }}
                  >
                    {loc.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Location Nav Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            onClick={handleResetToIndia}
            style={{
              backgroundColor: zoom === 1 ? '#2563eb' : 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '18px',
              padding: '6px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🇮🇳 India
          </button>
          <button
            onClick={() => {
              const ap = locations.find((l) => l.id === 'IN-AP');
              if (ap) navigateToLocation(ap);
            }}
            style={{
              backgroundColor: zoom >= 3 && zoom < 7 ? '#2563eb' : 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '18px',
              padding: '6px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📍 Andhra Pradesh
          </button>
          <button
            onClick={() => {
              const eg = locations.find((l) => l.id === 'AP-EG');
              if (eg) navigateToLocation(eg);
            }}
            style={{
              backgroundColor: zoom >= 7 && zoom < 14 ? '#2563eb' : 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '18px',
              padding: '6px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🏢 East Godavari
          </button>
          <button
            onClick={handleJumpToProject}
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: '1px solid #ef4444',
              borderRadius: '18px',
              padding: '6px 14px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.5)'
            }}
          >
            🎯 Ramaswami Peta (3WHH+7P6)
          </button>
        </div>

        {/* Layer Controls Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '18px',
              padding: '6px 12px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LayersIcon size={14} color="#38bdf8" /> Layers
          </button>

          {showLayerMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: '1px solid #334155',
                padding: '12px 16px',
                boxShadow: '0 15px 30px rgba(0,0,0,0.6)',
                minWidth: '210px',
                zIndex: 60
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
                Toggle Map Layers
              </div>
              {[
                { key: 'boundaries', label: 'Boundaries (State/District)' },
                { key: 'highways', label: 'Highways (NH-16, ADB Rd)' },
                { key: 'rivers', label: 'Water Bodies & Rivers' },
                { key: 'cities', label: 'Cities & Towns' },
                { key: 'issues', label: 'Community Issue Markers' },
                { key: 'projectArea', label: 'Project Area (3WHH+7P6)' }
              ].map((layer) => (
                <label
                  key={layer.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.74rem',
                    color: '#cbd5e1',
                    padding: '4px 0',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={layers[layer.key]}
                    onChange={(e) => setLayers({ ...layers, [layer.key]: e.target.checked })}
                  />
                  {layer.label}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. BREADCRUMBS BAR (Below Search Header) */}
      <div
        style={{
          position: 'absolute',
          top: 66,
          left: 14,
          zIndex: 35,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '4px 12px',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          fontSize: '0.74rem',
          color: '#94a3b8'
        }}
      >
        <span style={{ fontWeight: 700, color: '#38bdf8' }}>GIS Level:</span>
        {getBreadcrumbs().map((crumb, idx, arr) => (
          <React.Fragment key={crumb.label}>
            <button
              onClick={crumb.action}
              style={{
                background: 'none',
                border: 'none',
                color: idx === arr.length - 1 ? '#ffffff' : '#94a3b8',
                fontWeight: idx === arr.length - 1 ? 800 : 600,
                cursor: 'pointer',
                padding: '2px 4px',
                borderRadius: '4px',
                textDecoration: idx === arr.length - 1 ? 'none' : 'underline'
              }}
            >
              {crumb.label}
            </button>
            {idx < arr.length - 1 && <ChevronRightIcon size={11} color="#64748b" />}
          </React.Fragment>
        ))}
      </div>

      {/* 3. LEVEL 2 SATELLITE SWITCH BANNER (Appears when zoomed in or in Ramaswami Peta) */}
      {zoom >= 13 && onSwitchToSatellite && (
        <div
          style={{
            position: 'absolute',
            top: 106,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 45,
            backgroundColor: 'rgba(37, 99, 235, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: '24px',
            padding: '8px 18px',
            color: '#ffffff',
            boxShadow: '0 8px 25px rgba(37, 99, 235, 0.4)',
            border: '1px solid #60a5fa',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
            🛰️ Zoomed into Ramaswami Peta! View authentic satellite imagery?
          </span>
          <button
            onClick={onSwitchToSatellite}
            style={{
              backgroundColor: '#ffffff',
              color: '#1d4ed8',
              border: 'none',
              borderRadius: '16px',
              padding: '4px 12px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
            }}
          >
            Switch to Satellite Map →
          </button>
        </div>
      )}

      {/* 4. OFFLINE STATUS BADGE (Bottom-Left) */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 35,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(8px)',
            borderRadius: '10px',
            padding: '8px 12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#f8fafc',
            fontSize: '0.72rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#10b981' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            100% OFFLINE INDIA VECTOR GIS
          </div>
          <div style={{ color: '#94a3b8', marginTop: '2px', fontSize: '0.68rem' }}>
            Coordinates: 81.9023° E, 17.0845° N • Zoom: {zoom.toFixed(1)}x
          </div>
        </div>
      </div>

      {/* 5. FLOATING ZOOM CONTROLS (Bottom-Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          zIndex: 35,
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
            backgroundColor: '#1e293b',
            color: '#ffffff',
            border: '1px solid #475569',
            fontSize: '1.2rem',
            fontWeight: 800,
            cursor: 'pointer',
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
            backgroundColor: '#1e293b',
            color: '#ffffff',
            border: '1px solid #475569',
            fontSize: '1.2rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={handleResetToIndia}
          style={{
            padding: '6px 8px',
            borderRadius: '8px',
            backgroundColor: '#1e293b',
            color: '#94a3b8',
            border: '1px solid #475569',
            fontSize: '0.68rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
          title="Reset to Whole India"
        >
          Reset
        </button>
      </div>

      {/* 6. INTERACTIVE VECTOR GIS MAP CANVAS (SVG) */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          position: 'relative',
          width: '100%',
          height: '640px',
          overflow: 'hidden',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.1, 0.9, 0.2, 1)'
          }}
        >
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <defs>
              {/* Background Ocean / Land Grid Pattern */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
              </pattern>

              {/* Bay of Bengal & Arabian Sea Gradients */}
              <radialGradient id="oceanGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#091326" />
                <stop offset="100%" stopColor="#040813" />
              </radialGradient>

              {/* Andhra Pradesh Highlight Gradient */}
              <linearGradient id="apGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.65" />
              </linearGradient>

              {/* East Godavari Highlight Gradient */}
              <linearGradient id="egGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.8" />
              </linearGradient>

              {/* Ramaswami Peta Glow */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Ocean Background */}
            <rect width="100%" height="100%" fill="url(#oceanGrad)" />
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Ocean Labels */}
            {zoom < 4 && (
              <>
                <text x="180" y="800" fill="rgba(56, 189, 248, 0.25)" fontSize="18" fontWeight="800" letterSpacing="4">
                  ARABIAN SEA
                </text>
                <text x="650" y="750" fill="rgba(56, 189, 248, 0.25)" fontSize="18" fontWeight="800" letterSpacing="4">
                  BAY OF BENGAL
                </text>
                <text x="420" y="960" fill="rgba(56, 189, 248, 0.25)" fontSize="16" fontWeight="800" letterSpacing="3">
                  INDIAN OCEAN
                </text>
              </>
            )}

            {/* GEOJSON FEATURES */}
            {geoData && geoData.features && (
              <>
                {/* 1. National & State Boundary Polygons */}
                {layers.boundaries &&
                  geoData.features
                    .filter((f) => f.geometry.type === 'Polygon')
                    .map((f) => {
                      const isAP = f.id === 'IN-AP';
                      const isEG = f.id === 'AP-EG';
                      const isRP = f.id === 'PROJECT-RAMASWAMI-PETA';
                      const isIndia = f.id === 'IND';

                      let fill = 'rgba(30, 41, 59, 0.7)';
                      let stroke = '#475569';
                      let strokeWidth = 1.5;

                      if (isIndia) {
                        fill = 'rgba(15, 23, 42, 0.5)';
                        stroke = '#94a3b8';
                        strokeWidth = 2.5;
                      } else if (isAP) {
                        fill = 'url(#apGradient)';
                        stroke = '#3b82f6';
                        strokeWidth = 2;
                      } else if (isEG) {
                        // Only show East Godavari district polygon at zoom >= 5
                        if (zoom < 5) return null;
                        fill = 'url(#egGradient)';
                        stroke = '#f59e0b';
                        strokeWidth = 2;
                      } else if (isRP) {
                        // Only show Ramaswami Peta polygon at zoom >= 10
                        if (zoom < 10) return null;
                        fill = 'rgba(239, 68, 68, 0.3)';
                        stroke = '#ef4444';
                        strokeWidth = 2.5;
                      }

                      return (
                        <polygon
                          key={f.id}
                          points={coordsToSvgPoints(f.geometry.coordinates[0])}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={strokeWidth / Math.sqrt(zoom)}
                          style={{
                            cursor: 'pointer',
                            transition: 'fill 0.2s ease, stroke 0.2s ease'
                          }}
                          onClick={() => {
                            setSelectedFeature(f.properties);
                            if (isAP) {
                              const ap = locations.find((l) => l.id === 'IN-AP');
                              if (ap) navigateToLocation(ap);
                            } else if (isEG) {
                              const eg = locations.find((l) => l.id === 'AP-EG');
                              if (eg) navigateToLocation(eg);
                            } else if (isRP) {
                              handleJumpToProject();
                            }
                          }}
                        />
                      );
                    })}

                {/* 2. Rivers (Godavari & Krishna) */}
                {layers.rivers &&
                  geoData.features
                    .filter((f) => f.properties.type === 'river')
                    .map((r) => (
                      <polyline
                        key={r.id}
                        points={coordsToSvgPoints(r.geometry.coordinates)}
                        fill="none"
                        stroke={r.properties.color || '#38bdf8'}
                        strokeWidth={(r.properties.width || 2) / Math.sqrt(zoom)}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity={0.85}
                      />
                    ))}

                {/* 3. Highways (NH-16 & ADB Road) */}
                {layers.highways &&
                  geoData.features
                    .filter((f) => f.properties.type === 'highway')
                    .map((h) => {
                      const isADB = h.id === 'ROAD-ADB';
                      if (isADB && zoom < 7) return null; // Show ADB Road from district zoom

                      return (
                        <polyline
                          key={h.id}
                          points={coordsToSvgPoints(h.geometry.coordinates)}
                          fill="none"
                          stroke={h.properties.color || '#fbbf24'}
                          strokeWidth={(h.properties.width || 2) / Math.sqrt(zoom)}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray={isADB ? '4 2' : 'none'}
                          opacity={0.9}
                        />
                      );
                    })}
              </>
            )}

            {/* 4. LABELS: STATES & RIVERS */}
            {zoom < 4 && (
              <text
                x="450"
                y="450"
                fill="rgba(255, 255, 255, 0.4)"
                fontSize="24"
                fontWeight="900"
                letterSpacing="8"
                textAnchor="middle"
              >
                INDIA
              </text>
            )}

            {/* Andhra Pradesh Label */}
            {zoom >= 2 && (
              <text
                x="485"
                y="690"
                fill="#93c5fd"
                fontSize={Math.max(12, 16 / Math.sqrt(zoom))}
                fontWeight="800"
                textAnchor="middle"
              >
                ANDHRA PRADESH
              </text>
            )}

            {/* Godavari River Label */}
            {layers.rivers && zoom >= 4 && (
              <text
                x="475"
                y="660"
                fill="#38bdf8"
                fontSize={Math.max(9, 12 / Math.sqrt(zoom))}
                fontWeight="700"
                fontStyle="italic"
              >
                Godavari River ~
              </text>
            )}

            {/* NH-16 Highway Label */}
            {layers.highways && zoom >= 5 && (
              <text
                x="490"
                y="675"
                fill="#fbbf24"
                fontSize={Math.max(8, 10 / Math.sqrt(zoom))}
                fontWeight="800"
              >
                NH-16
              </text>
            )}

            {/* ADB Road Label */}
            {layers.highways && zoom >= 10 && (
              <text
                x="474"
                y="672"
                fill="#f97316"
                fontSize={Math.max(7, 9 / Math.sqrt(zoom))}
                fontWeight="800"
              >
                ADB Road
              </text>
            )}

            {/* 5. CITIES & TOWNS MARKERS */}
            {layers.cities &&
              visibleLocations.map((loc) => {
                const p = project(loc.lng, loc.lat);
                const isSelected = selectedLocation?.id === loc.id;
                const isProject = loc.type === 'project';
                const markerSize = Math.max(5, (isProject ? 14 : 9) / Math.sqrt(zoom));

                return (
                  <g
                    key={loc.id}
                    transform={`translate(${p.x}, ${p.y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigateToLocation(loc)}
                  >
                    {/* Outer pulse for project site */}
                    {isProject && (
                      <circle
                        r={markerSize * 1.8}
                        fill="rgba(239, 68, 68, 0.3)"
                        stroke="#ef4444"
                        strokeWidth={1.5 / Math.sqrt(zoom)}
                        filter="url(#glow)"
                      />
                    )}

                    {/* Marker circle */}
                    <circle
                      r={markerSize}
                      fill={isProject ? '#dc2626' : isSelected ? '#38bdf8' : '#e2e8f0'}
                      stroke="#0f172a"
                      strokeWidth={1.5 / Math.sqrt(zoom)}
                    />

                    {/* Marker Label */}
                    <text
                      x={markerSize + 4 / Math.sqrt(zoom)}
                      y={markerSize / 2}
                      fill={isProject ? '#f87171' : isSelected ? '#38bdf8' : '#f8fafc'}
                      fontSize={Math.max(9, 13 / Math.sqrt(zoom))}
                      fontWeight={isProject ? 800 : 600}
                      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
                    >
                      {loc.name}
                      {isProject && ' (3WHH+7P6)'}
                    </text>
                  </g>
                );
              })}

            {/* 6. COMMUNITY COMPLAINTS ISSUE MARKERS (Zoom >= 9) */}
            {layers.issues &&
              zoom >= 9 &&
              mappedIssues.map((issue) => {
                const style = getIssueStyle(issue);
                const isSelected = selectedIssue?.id === issue.id;
                const pinRadius = Math.max(5, 8 / Math.sqrt(zoom));

                return (
                  <g
                    key={issue.id}
                    transform={`translate(${issue.svgX}, ${issue.svgY})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <circle
                      r={isSelected ? pinRadius * 1.6 : pinRadius}
                      fill={style.color}
                      stroke="#ffffff"
                      strokeWidth={1.5 / Math.sqrt(zoom)}
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                    />
                    {zoom >= 13 && (
                      <text
                        x={pinRadius + 3 / Math.sqrt(zoom)}
                        y={pinRadius / 2}
                        fill="#ffffff"
                        fontSize={Math.max(7, 9 / Math.sqrt(zoom))}
                        fontWeight="700"
                        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.9))"
                      >
                        {issue.id} • {issue.category}
                      </text>
                    )}
                  </g>
                );
              })}
          </svg>
        </div>

        {/* 7. SELECTED ISSUE POPUP CARD */}
        {selectedIssue && (
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '360px',
              maxWidth: 'calc(100% - 40px)',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
              border: '1px solid #cbd5e1',
              padding: '16px 18px',
              zIndex: 50,
              animation: 'fadeIn 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#2563eb' }}>
                  {selectedIssue.id}
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>
                  {selectedIssue.problem_type}
                </h4>
              </div>
              <button
                onClick={() => setSelectedIssue(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', margin: '6px 0 10px' }}>
              <StatusBadge status={selectedIssue.status} />
              <PriorityBadge priority={selectedIssue.priority} />
            </div>

            <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.4, marginBottom: '8px' }}>
              <div><strong>Location:</strong> 📍 {selectedIssue.location}</div>
              <div style={{ marginTop: '2px' }}>
                <strong>Reported:</strong> 🕒 {formatISTDateTime(selectedIssue.created_at)}
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: '#475569', backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
              {selectedIssue.description}
            </p>

            {onSelectComplaint && (
              <button
                className="btn btn-primary btn-sm"
                style={{ width: '100%', fontWeight: 700 }}
                onClick={() => onSelectComplaint(selectedIssue)}
              >
                <EyeIcon size={14} /> View Complaint
              </button>
            )}
          </div>
        )}

        {/* 8. SELECTED LOCATION INFO POPUP */}
        {selectedLocation && !selectedIssue && (
          <div
            style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              maxWidth: '300px',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '14px 16px',
              boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
              border: '1px solid #334155',
              zIndex: 45,
              color: '#f8fafc'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: selectedLocation.type === 'project' ? '#ef4444' : '#38bdf8'
                  }}
                >
                  {selectedLocation.type}
                </span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '2px 0' }}>
                  {selectedLocation.name}
                </h4>
              </div>
              <button
                onClick={() => setSelectedLocation(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <CloseIcon size={14} />
              </button>
            </div>

            {selectedLocation.plusCode && (
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
                📍 Plus Code: {selectedLocation.plusCode}
              </div>
            )}

            <p style={{ fontSize: '0.76rem', color: '#94a3b8', lineHeight: 1.4, margin: '6px 0 10px' }}>
              {selectedLocation.description || `Lat: ${selectedLocation.lat}°, Lng: ${selectedLocation.lng}°`}
            </p>

            {selectedLocation.type === 'project' && onSwitchToSatellite && (
              <button
                onClick={onSwitchToSatellite}
                style={{
                  width: '100%',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🛰️ Open High-Res Satellite View
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
