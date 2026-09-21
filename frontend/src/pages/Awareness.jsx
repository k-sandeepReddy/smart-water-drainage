import React, { useState, useEffect } from 'react';
import AwarenessCard from '../components/AwarenessCard.jsx';
import { BookOpenIcon, CheckCircleIcon } from '../components/Icons.jsx';

export default function Awareness({ api }) {
  const [awarenessItems, setAwarenessItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const data = await api.getAwarenessContent();
        setAwarenessItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="page-body">
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          Community Awareness & Hygiene Guidelines
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
          Practical civic recommendations for Ramaswami Peta to conserve water, maintain drains, and prevent epidemics.
        </p>
      </div>

      {/* Community Pledge Banner */}
      <div
        style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '14px',
          padding: '24px',
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircleIcon size={20} color="#2563eb" />
          Ramaswami Peta Civic Water & Health Charter
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
          As part of the B.Tech Community Service Project (CSP), we encourage every household in Ramaswami Peta, Rajanagaram to follow these 4 pillars of civic responsibility:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginTop: '6px' }}>
          <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #dbeafe', fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>
            💧 1. Fix domestic leaks immediately
          </div>
          <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #dbeafe', fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>
            🌧️ 2. Harvest monsoon rooftop rainwater
          </div>
          <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #dbeafe', fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>
            🚫 3. Zero plastic dumping into roadside drains
          </div>
          <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #dbeafe', fontSize: '0.8rem', color: '#1e40af', fontWeight: 600 }}>
            🦟 4. Observe Friday as Dry Day (Eliminate standing pools)
          </div>
        </div>
      </div>

      {/* Awareness Educational Cards Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          Loading community guidelines...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
          {awarenessItems.map((item) => (
            <AwarenessCard
              key={item.id}
              title={item.title}
              category={item.category}
              description={item.description}
              tips={item.tips}
              iconName={item.icon_name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
