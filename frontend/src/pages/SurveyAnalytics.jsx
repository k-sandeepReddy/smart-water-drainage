import React, { useState, useEffect } from 'react';
import ChartCard from '../components/ChartCard.jsx';
import { DonutChart, BarChart, HorizontalBarChart } from '../components/OfflineCharts.jsx';
import { BarChartIcon, AlertTriangleIcon, CheckCircleIcon, WaterDropIcon, DrainageIcon } from '../components/Icons.jsx';

export default function SurveyAnalytics({ api }) {
  const [surveyData, setSurveyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSurveyData = async () => {
      setIsLoading(true);
      try {
        const data = await api.getSurveyAnalytics();
        setSurveyData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    loadSurveyData();
  }, []);

  if (isLoading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        Loading community survey dataset (208 responses)...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-body">
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '16px', borderRadius: '10px' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-body">
      {/* Title Header with Strict Ground Truth Banner */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '6px',
              textTransform: 'uppercase'
            }}
          >
            CSP Field Survey
          </span>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
            Ramaswami Peta, Rajanagaram Mandal
          </span>
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Community Survey Data — 208 Responses
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
          Empirical field data collected from 208 households assessing water scarcity, drainage maintenance, and vector risks.
        </p>
      </div>

      {/* Major Findings Highlight Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div
          style={{
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <WaterDropIcon size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#991b1b', lineHeight: 1 }}>62.0%</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#7f1d1d', marginTop: '4px' }}>
              Summer Water Shortage
            </div>
            <div style={{ fontSize: '0.74rem', color: '#991b1b', marginTop: '2px' }}>
              129 of 208 households experience severe shortages during summer.
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#ffedd5',
            border: '1px solid #fed7aa',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#f97316', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DrainageIcon size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#9a3412', lineHeight: 1 }}>46.6%</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#7c2d12', marginTop: '4px' }}>
              Unmaintained Drainage
            </div>
            <div style={{ fontSize: '0.74rem', color: '#9a3412', marginTop: '2px' }}>
              97 of 208 households report drains are NOT properly maintained.
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #fde68a',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangleIcon size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#92400e', lineHeight: 1 }}>55.8%</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#78350f', marginTop: '4px' }}>
              Stagnant Water Near Homes
            </div>
            <div style={{ fontSize: '0.74rem', color: '#92400e', marginTop: '2px' }}>
              116 households report standing pools causing mosquito breeding.
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Q1 Regular Water Supply */}
        <ChartCard
          title="Q1: Regular Water Supply"
          subtitle="Do households receive regular daily water supply?"
          badgeText="208 Responses"
        >
          <DonutChart
            data={surveyData?.q1_regular_water || {}}
            size={200}
            centerLabel="Total"
            centerValue="208"
          />
        </ChartCard>

        {/* Q2 Summer Shortage */}
        <ChartCard
          title="Q2: Summer Water Shortage"
          subtitle="Do you face acute shortage in summer months?"
          badgeText="208 Responses"
        >
          <DonutChart
            data={surveyData?.q2_summer_shortage || {}}
            size={200}
            centerLabel="Shortage"
            centerValue={`${surveyData?.q2_summer_shortage?.Yes || 129}`}
          />
        </ChartCard>

        {/* Q3 Main Water Source */}
        <ChartCard
          title="Q3: Main Drinking Water Source"
          subtitle="Primary source of domestic water"
          badgeText="208 Responses"
        >
          <HorizontalBarChart
            data={surveyData?.q3_main_source || {}}
            color="#0284c7"
          />
        </ChartCard>

        {/* Q6 Drainage Maintenance */}
        <ChartCard
          title="Q6: Drainage Maintenance"
          subtitle="Are roadside drains properly maintained by local authorities?"
          badgeText="208 Responses"
        >
          <DonutChart
            data={surveyData?.q6_drainage_maintenance || {}}
            size={200}
            centerLabel="Total"
            centerValue="208"
          />
        </ChartCard>

        {/* Q7 Stagnant Water Near Homes */}
        <ChartCard
          title="Q7: Stagnant Water Near Homes"
          subtitle="Presence of standing wastewater or rainwater pools"
          badgeText="208 Responses"
        >
          <DonutChart
            data={surveyData?.q7_stagnant_water || {}}
            size={200}
            centerLabel="Standing"
            centerValue={`${surveyData?.q7_stagnant_water?.Yes || 116}`}
          />
        </ChartCard>

        {/* Q8 Drain Cleaning Frequency */}
        <ChartCard
          title="Q8: Regular Drain Cleaning"
          subtitle="Are drains cleaned regularly?"
          badgeText="208 Responses"
        >
          <HorizontalBarChart
            data={surveyData?.q8_drain_cleaning || {}}
            color="#f97316"
          />
        </ChartCard>

        {/* Q9 Mosquito Problems */}
        <ChartCard
          title="Q9: Mosquito & Health Hazards"
          subtitle="Severe mosquito menace reported due to drainage issues"
          badgeText="208 Responses"
        >
          <DonutChart
            data={surveyData?.q9_mosquito_problems || {}}
            size={200}
            centerLabel="Total"
            centerValue="208"
          />
        </ChartCard>

        {/* Q10 Flooding During Heavy Rain */}
        <ChartCard
          title="Q10: Monsoon Flooding"
          subtitle="Streets or houses waterlogged during heavy monsoon rainfall"
          badgeText="208 Responses"
        >
          <DonutChart
            data={surveyData?.q10_flooding || {}}
            size={200}
            centerLabel="Flooding"
            centerValue={`${surveyData?.q10_flooding?.Yes || 92}`}
          />
        </ChartCard>

        {/* Q11 Garbage Collection */}
        <ChartCard
          title="Q11: Regular Garbage Collection"
          subtitle="Frequency of door-to-door sanitation waste collection"
          badgeText="208 Responses"
        >
          <DonutChart
            data={surveyData?.q11_garbage_collection || {}}
            size={200}
            centerLabel="Total"
            centerValue="208"
          />
        </ChartCard>

        {/* Q12 Community Suggestions */}
        <ChartCard
          title="Q12: Community Improvement Suggestions"
          subtitle="Top citizen priorities for government intervention"
          badgeText="208 Responses"
        >
          <HorizontalBarChart
            data={surveyData?.q12_suggestion || {}}
            color="#10b981"
          />
        </ChartCard>
      </div>

      {/* Key Findings Callout List */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '14px' }}>
          Key Analytical Conclusions & Recommendations
        </h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyleType: 'none' }}>
          {surveyData?.key_findings?.map((finding, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.88rem', color: '#334155' }}>
              <span style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }}>
                <CheckCircleIcon size={16} />
              </span>
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
