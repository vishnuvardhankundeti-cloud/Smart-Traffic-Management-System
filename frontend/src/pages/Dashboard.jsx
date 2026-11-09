import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Milestone,
  Gauge,
  AlertOctagon,
  Siren,
  TrafficCone,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  Play,
  RotateCw,
  Compass
} from 'lucide-react';
import { Line, Doughnut, Bar, PolarArea } from 'react-chartjs-2';
import '../services/chartSetup';
import { useSimulation } from '../context/SimulationContext';
import { useTheme } from '../context/ThemeContext';
import { getAnalyticsSummary } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { trafficOverview, simulationStatus, startSimulation, refreshData } = useSimulation();
  const { isDark } = useTheme();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAnalyticsSummary()
      .then(res => setAnalytics(res.data))
      .catch(() => {});
  }, [trafficOverview]);

  const overview = trafficOverview || {
    totalVehicles: 32,
    activeRoads: 16,
    averageTrafficDensity: 46.8,
    congestedRoadsCount: 2,
    activeEmergencyVehicles: 4,
    operationalSignalsCount: 10,
    liveRoads: []
  };

  const chartTextColor = isDark ? '#94A3B8' : '#475569';
  const chartGridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

  // Chart 1: Traffic Density Over Time (Line)
  const lineChartData = {
    labels: analytics?.densityTrends?.map(t => t.time) || ['T-150s', 'T-120s', 'T-90s', 'T-60s', 'T-30s', 'Now'],
    datasets: [
      {
        label: 'Avg Traffic Density (%)',
        data: analytics?.densityTrends?.map(t => t.density) || [38, 42, 45, 52, 48, overview.averageTrafficDensity],
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  // Chart 2: Vehicle Distribution (Doughnut)
  const vehicleLabels = Object.keys(overview.vehicleTypeDistribution || { CAR: 14, BUS: 4, TRUCK: 3, BIKE: 6, AMBULANCE: 2, FIRE_ENGINE: 2, POLICE_VEHICLE: 1 });
  const vehicleValues = Object.values(overview.vehicleTypeDistribution || { CAR: 14, BUS: 4, TRUCK: 3, BIKE: 6, AMBULANCE: 2, FIRE_ENGINE: 2, POLICE_VEHICLE: 1 });
  const doughnutData = {
    labels: vehicleLabels,
    datasets: [
      {
        data: vehicleValues,
        backgroundColor: ['#6366F1', '#10B981', '#F59E0B', '#06B6D4', '#F43F5E', '#EC4899', '#8B5CF6'],
        borderWidth: 2,
        borderColor: isDark ? '#1E293B' : '#FFFFFF'
      }
    ]
  };

  // Chart 3: Road Comparison (Bar)
  const topRoads = (overview.liveRoads || []).slice(0, 7);
  const barChartData = {
    labels: topRoads.map(r => r.roadName),
    datasets: [
      {
        label: 'Current Vehicles',
        data: topRoads.map(r => r.currentVehicleCount),
        backgroundColor: '#8B5CF6',
        borderRadius: 6
      },
      {
        label: 'Traffic Density (%)',
        data: topRoads.map(r => r.trafficDensity),
        backgroundColor: '#06B6D4',
        borderRadius: 6
      }
    ]
  };

  // Chart 4: Traffic Flow Polar Area (by Road Status)
  const statusLabels = Object.keys(overview.roadStatusCounts || { LOW: 6, MODERATE: 5, HEAVY: 3, CONGESTED: 2 });
  const statusValues = Object.values(overview.roadStatusCounts || { LOW: 6, MODERATE: 5, HEAVY: 3, CONGESTED: 2 });
  const polarData = {
    labels: statusLabels,
    datasets: [
      {
        data: statusValues,
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',  // LOW: Green
          'rgba(245, 158, 11, 0.7)',  // MODERATE: Yellow
          'rgba(249, 115, 22, 0.7)',  // HEAVY: Orange
          'rgba(244, 63, 94, 0.7)'    // CONGESTED: Red
        ],
        borderWidth: 1,
        borderColor: isDark ? '#1E293B' : '#FFFFFF'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: chartTextColor, font: { family: 'Inter', size: 11 } }
      }
    },
    scales: {
      x: {
        grid: { color: chartGridColor },
        ticks: { color: chartTextColor, font: { size: 10 } }
      },
      y: {
        grid: { color: chartGridColor },
        ticks: { color: chartTextColor, font: { size: 10 } }
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'LOW': return <span className="badge badge-green">LOW TRAFFIC</span>;
      case 'MODERATE': return <span className="badge badge-yellow">MODERATE</span>;
      case 'HEAVY': return <span className="badge badge-orange">HEAVY TRAFFIC</span>;
      case 'CONGESTED': return <span className="badge badge-red">CONGESTED</span>;
      default: return <span className="badge badge-blue">{status}</span>;
    }
  };

  return (
    <div>
      {/* Header & Quick Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            System Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time urban traffic telemetry, live simulation control, and algorithmic optimization.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/vehicles')} className="btn btn-primary">
            <PlusCircle size={15} /> Add Vehicle
          </button>
          <button onClick={() => navigate('/roads')} className="btn btn-secondary">
            <Milestone size={15} /> Add Road
          </button>
          <button onClick={() => navigate('/routes')} className="btn btn-secondary">
            <Compass size={15} /> Optimize Route
          </button>
          {simulationStatus?.state !== 'RUNNING' && (
            <button onClick={startSimulation} className="btn btn-success">
              <Play size={15} /> Start Sim
            </button>
          )}
          <button onClick={refreshData} className="btn btn-secondary btn-icon" title="Refresh Live Data">
            <RotateCw size={15} />
          </button>
        </div>
      </div>

      {/* 6 KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {/* KPI 1 */}
        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Vehicles
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
              {overview.totalVehicles}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={12} /> Active in grid
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#6366F1' }}>
            <Car size={24} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Roads
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
              {overview.activeRoads}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Graph edges mapped
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8B5CF6' }}>
            <Milestone size={24} />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Average Density
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
              {overview.averageTrafficDensity}%
            </div>
            <div style={{ fontSize: '0.72rem', color: overview.averageTrafficDensity > 60 ? '#F59E0B' : '#10B981' }}>
              Capacity utilization
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06B6D4' }}>
            <Gauge size={24} />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Congested Roads
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F43F5E', margin: '0.2rem 0' }}>
              {overview.congestedRoadsCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#F43F5E' }}>
              Density &gt; 75% threshold
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#F43F5E' }}>
            <AlertOctagon size={24} />
          </div>
        </div>

        {/* KPI 5 */}
        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Emergency Active
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F43F5E', margin: '0.2rem 0' }}>
              {overview.activeEmergencyVehicles}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#F43F5E', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Siren size={12} /> Priority Queue active
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#F43F5E' }}>
            <Siren size={24} />
          </div>
        </div>

        {/* KPI 6 */}
        <div className="kpi-card">
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Traffic Signals
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
              {overview.operationalSignalsCount}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#10B981' }}>
              Autonomous cycle
            </div>
          </div>
          <div className="kpi-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
            <TrafficCone size={24} />
          </div>
        </div>
      </div>

      {/* 4 Interactive Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Chart 1: Line Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Traffic Density Overview</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dynamic urban road network density over time</p>
            </div>
            <span className="badge badge-blue">Live Telemetry</span>
          </div>
          <div style={{ height: 260 }}>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2: Doughnut Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Vehicle Distribution</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Categorized breakdown of simulated transit</p>
            </div>
            <span className="badge badge-purple">Categories</span>
          </div>
          <div style={{ height: 260 }}>
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { color: chartTextColor, font: { size: 10 } } }
                }
              }}
            />
          </div>
        </div>

        {/* Chart 3: Bar Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Road Capacity Comparison</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Comparing vehicle load &amp; density across major corridors</p>
            </div>
            <span className="badge badge-yellow">Capacity</span>
          </div>
          <div style={{ height: 260 }}>
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 4: Polar Area Chart */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Traffic Flow by Congestion Status</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Classification of active road segments</p>
            </div>
            <span className="badge badge-green">Flow Levels</span>
          </div>
          <div style={{ height: 260 }}>
            <PolarArea
              data={polarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'right', labels: { color: chartTextColor, font: { size: 10 } } }
                },
                scales: {
                  r: { grid: { color: chartGridColor }, ticks: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Live Traffic Overview Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Live Road Conditions</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Real-time road occupancy, density levels, and average speeds updated via multithreaded simulation
            </p>
          </div>
          <button onClick={() => navigate('/traffic')} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
            View Full Interactive Map <ArrowRight size={14} />
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Road ID</th>
                <th>Road Corridor Name</th>
                <th>Vehicle Count</th>
                <th>Traffic Density</th>
                <th>Average Speed</th>
                <th>Congestion Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {(overview.liveRoads || []).slice(0, 8).map((road) => (
                <tr key={road.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--primary)' }}>
                    RD-{String(road.id).padStart(3, '0')}
                  </td>
                  <td style={{ fontWeight: 600 }}>{road.roadName}</td>
                  <td>
                    <span style={{ fontWeight: 700 }}>{road.currentVehicleCount}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}> / {road.maxCapacity}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, minWidth: 60, height: 6, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 3, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, road.trafficDensity)}%`,
                            height: '100%',
                            background: road.trafficDensity > 75 ? '#F43F5E' : road.trafficDensity > 50 ? '#F59E0B' : '#10B981',
                            borderRadius: 3
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, minWidth: 38 }}>
                        {road.trafficDensity}%
                      </span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>
                    {road.averageSpeed} km/h
                  </td>
                  <td>{getStatusBadge(road.roadStatus)}</td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {road.lastUpdated || 'Just now'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
