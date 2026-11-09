import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileSpreadsheet,
  TrendingUp,
  Clock,
  Gauge,
  Milestone,
  Siren,
  RotateCw
} from 'lucide-react';
import { Line, Doughnut, Bar, PolarArea } from 'react-chartjs-2';
import '../services/chartSetup';
import { useTheme } from '../context/ThemeContext';
import { getAnalyticsSummary, getExportVehiclesUrl, getExportRoadsUrl } from '../services/api';

export default function AnalyticsReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  const loadData = () => {
    setLoading(true);
    getAnalyticsSummary()
      .then(res => setData(res.data))
      .catch(err => toast.error('Failed to load analytics: ' + err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartTextColor = isDark ? '#94A3B8' : '#475569';
  const chartGridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

  // Chart 1: Traffic Density Over Time (Line)
  const lineChartData = {
    labels: data?.densityTrends?.map(d => d.time) || ['T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'Now'],
    datasets: [
      {
        label: 'Average Traffic Density (%)',
        data: data?.densityTrends?.map(d => d.density) || [35, 42, 48, 55, 49, 44],
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 4
      }
    ]
  };

  // Chart 2: Vehicle Distribution (Doughnut)
  const vehicleDist = data?.vehicleDistribution || { CAR: 15, BIKE: 6, BUS: 4, TRUCK: 3, AMBULANCE: 2, FIRE_ENGINE: 2 };
  const doughnutData = {
    labels: Object.keys(vehicleDist),
    datasets: [
      {
        data: Object.values(vehicleDist),
        backgroundColor: ['#6366F1', '#10B981', '#F59E0B', '#06B6D4', '#F43F5E', '#EC4899', '#8B5CF6'],
        borderWidth: 2,
        borderColor: isDark ? '#1E293B' : '#FFFFFF'
      }
    ]
  };

  // Chart 3: Road-wise Traffic Comparison (Bar)
  const roadPerf = data?.roadPerformance || [];
  const barChartData = {
    labels: roadPerf.slice(0, 8).map(r => r.roadName),
    datasets: [
      {
        label: 'Current Traffic Density (%)',
        data: roadPerf.slice(0, 8).map(r => r.density),
        backgroundColor: '#8B5CF6',
        borderRadius: 6
      },
      {
        label: 'Average Speed (km/h)',
        data: roadPerf.slice(0, 8).map(r => r.speed),
        backgroundColor: '#06B6D4',
        borderRadius: 6
      }
    ]
  };

  // Chart 4: Vehicle Category Polar Area
  const polarData = {
    labels: Object.keys(vehicleDist),
    datasets: [
      {
        data: Object.values(vehicleDist),
        backgroundColor: [
          'rgba(99, 102, 241, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(6, 182, 212, 0.7)',
          'rgba(244, 63, 94, 0.7)',
          'rgba(236, 72, 153, 0.7)',
          'rgba(139, 92, 246, 0.7)'
        ],
        borderWidth: 1,
        borderColor: isDark ? '#1E293B' : '#FFFFFF'
      }
    ]
  };

  // Chart 5: Congestion Distribution (Bar)
  const congestionMap = data?.congestionDistribution || { LOW: 8, MODERATE: 4, HEAVY: 3, CONGESTED: 1 };
  const congestionBarData = {
    labels: Object.keys(congestionMap),
    datasets: [
      {
        label: 'Road Corridors',
        data: Object.values(congestionMap),
        backgroundColor: ['#10B981', '#F59E0B', '#F97316', '#F43F5E'],
        borderRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: chartTextColor, font: { size: 10 } } }
    },
    scales: {
      x: { grid: { color: chartGridColor }, ticks: { color: chartTextColor, font: { size: 10 } } },
      y: { grid: { color: chartGridColor }, ticks: { color: chartTextColor, font: { size: 10 } } }
    }
  };

  return (
    <div>
      {/* Header & CSV Download Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Analytics &amp; Intelligence Reports
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Comprehensive performance diagnostics generated via backend Java Stream API aggregations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <a
            href={getExportVehiclesUrl()}
            download="stms-vehicles-report.csv"
            className="btn btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <FileSpreadsheet size={15} color="#10B981" /> Export Vehicles CSV
          </a>
          <a
            href={getExportRoadsUrl()}
            download="stms-roads-report.csv"
            className="btn btn-secondary"
            style={{ textDecoration: 'none' }}
          >
            <Download size={15} color="#6366F1" /> Export Roads CSV
          </a>
          <button onClick={loadData} className="btn btn-secondary btn-icon" title="Refresh Analytics">
            <RotateCw size={15} />
          </button>
        </div>
      </div>

      {/* Performance Summary Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL VEHICLES PROCESSED</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            {data?.totalVehiclesProcessed || 32}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10B981' }}>Queued &amp; cleared</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVG WAITING TIME</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            {data?.averageWaitingTimeSeconds || 24.5}s
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>At simulated signals</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>MOST CONGESTED ROAD</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F43F5E', margin: '0.2rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data?.mostCongestedRoad || 'Downtown Link'}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#F43F5E' }}>Stream.max() detected</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>BUSIEST INTERSECTION</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8B5CF6', margin: '0.2rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data?.busiestIntersection || 'Central Square'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Highest converging volume</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>EMERGENCY MISSIONS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F43F5E', margin: '0.2rem 0' }}>
            {data?.emergencyVehiclesProcessed || 4}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#F43F5E' }}>Priority corridor clears</div>
        </div>

        <div className="glass-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL DISTANCE SIMULATED</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#06B6D4', margin: '0.2rem 0' }}>
            {data?.totalDistanceCoveredKm || 1420} km
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Across all 16 roads</div>
        </div>
      </div>

      {/* 5 Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Chart 1: Traffic Density Over Time */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            1. Traffic Density Over Time
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Line chart showing historical density fluctuations
          </p>
          <div style={{ height: 260 }}>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 2: Vehicle Distribution */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            2. Vehicle Category Distribution
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Doughnut chart of active vehicle categories in simulation
          </p>
          <div style={{ height: 260 }}>
            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Chart 3: Road-wise Traffic Comparison */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            3. Road-wise Traffic Comparison
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Bar chart comparing density and speed across corridors
          </p>
          <div style={{ height: 260 }}>
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Chart 4: Category Polar Area */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            4. Fleet Category Proportions
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Polar area visualization of vehicle classes
          </p>
          <div style={{ height: 260 }}>
            <PolarArea data={polarData} options={{ responsive: true, maintainAspectRatio: false, scales: { r: { ticks: { display: false } } } }} />
          </div>
        </div>

        {/* Chart 5: Congestion Level Breakdown */}
        <div className="glass-card" style={{ gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            5. Congestion Severity Breakdown
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Distribution of road statuses across urban network
          </p>
          <div style={{ height: 260 }}>
            <Bar data={congestionBarData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}
