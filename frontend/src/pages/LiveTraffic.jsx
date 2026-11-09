import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Filter, RotateCw, Navigation, Siren, ShieldCheck } from 'lucide-react';
import { getRoads, getIntersections, getCongestedRoads } from '../services/api';
import { useSimulation } from '../context/SimulationContext';

export default function LiveTraffic() {
  const [filter, setFilter] = useState('ALL');
  const [roads, setRoads] = useState([]);
  const [intersections, setIntersections] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [loading, setLoading] = useState(true);
  const { trafficOverview, refreshData } = useSimulation();

  useEffect(() => {
    Promise.all([getRoads(), getIntersections()])
      .then(([roadsRes, interRes]) => {
        setRoads(roadsRes.data || []);
        setIntersections(interRes.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [trafficOverview]);

  const filteredRoads = roads.filter(road => {
    if (filter === 'ALL') return true;
    return road.roadStatus?.toUpperCase() === filter;
  });

  // Calculate coordinates for SVG simulated graph
  // Intersections mapped to fixed canvas coordinates (800x480)
  const nodePositions = {
    1: { x: 400, y: 240, label: 'Central Square' },
    2: { x: 400, y: 110, label: 'North Plaza' },
    3: { x: 620, y: 80, label: 'Airport Interchange' },
    4: { x: 190, y: 130, label: 'Tech Park' },
    5: { x: 260, y: 380, label: 'Harbor Junction' },
    6: { x: 640, y: 310, label: 'East End' },
    7: { x: 400, y: 410, label: 'South Gate' },
    8: { x: 140, y: 280, label: 'Westview' },
    9: { x: 520, y: 60, label: 'University' },
    10: { x: 570, y: 200, label: 'Metro Hub' },
  };

  const getNodeColor = (nodeId) => {
    if (selectedNode === nodeId) return '#6366F1';
    return '#1E293B';
  };

  const getEdgeStroke = (status) => {
    switch (status?.toUpperCase()) {
      case 'CONGESTED': return '#F43F5E';
      case 'HEAVY': return '#F97316';
      case 'MODERATE': return '#F59E0B';
      default: return '#10B981';
    }
  };

  return (
    <div>
      {/* Page Title & Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Live Traffic Monitoring
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time simulated road network topology, node telemetry, and automated congestion detection.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'LOW', 'MODERATE', 'HEAVY', 'CONGESTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="btn btn-secondary"
              style={{
                fontSize: '0.78rem',
                padding: '0.45rem 0.85rem',
                backgroundColor: filter === f ? 'var(--primary)' : undefined,
                color: filter === f ? '#FFFFFF' : undefined,
                borderColor: filter === f ? 'var(--primary)' : undefined
              }}
            >
              {f === 'ALL' ? 'All Roads' : f}
            </button>
          ))}
          <button onClick={refreshData} className="btn btn-secondary btn-icon" title="Refresh Telemetry">
            <RotateCw size={15} />
          </button>
        </div>
      </div>

      {/* Simulated Road Network Visual Map */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Interactive Network Topology (Adjacency Graph)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Click any intersection node or hover road edges to inspect simulated traffic flow &amp; emergency paths
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
              <span style={{ width: 10, height: 4, background: '#10B981', borderRadius: 2 }} /> Low (&lt;35%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B' }}>
              <span style={{ width: 10, height: 4, background: '#F59E0B', borderRadius: 2 }} /> Moderate
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F97316' }}>
              <span style={{ width: 10, height: 4, background: '#F97316', borderRadius: 2 }} /> Heavy
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F43F5E' }}>
              <span style={{ width: 10, height: 4, background: '#F43F5E', borderRadius: 2 }} /> Congested (&gt;75%)
            </span>
          </div>
        </div>

        {/* SVG Network Canvas */}
        <div style={{ width: '100%', height: '480px', background: 'rgba(11, 17, 32, 0.95)', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-color)' }}>
          <svg width="100%" height="100%" viewBox="0 0 800 480" style={{ width: '100%', height: '100%' }}>
            {/* Draw Graph Edges (Roads) */}
            {roads.map(road => {
              const u = nodePositions[road.startIntersectionId];
              const v = nodePositions[road.endIntersectionId];
              if (!u || !v) return null;

              const strokeColor = getEdgeStroke(road.roadStatus);
              const isSelected = selectedNode === road.startIntersectionId || selectedNode === road.endIntersectionId;
              const strokeWidth = isSelected ? 4 : (road.roadStatus === 'CONGESTED' ? 3.5 : 2.5);

              return (
                <g key={road.id}>
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeOpacity={isSelected ? 1.0 : 0.8}
                    strokeDasharray={road.roadStatus === 'CONGESTED' ? '6,3' : undefined}
                  />
                  {/* Midpoint Label badge showing vehicles */}
                  <circle
                    cx={(u.x + v.x) / 2}
                    cy={(u.y + v.y) / 2}
                    r={11}
                    fill="#111827"
                    stroke={strokeColor}
                    strokeWidth={1.5}
                  />
                  <text
                    x={(u.x + v.x) / 2}
                    y={(u.y + v.y) / 2 + 3.5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={8}
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                  >
                    {road.currentVehicleCount}
                  </text>
                </g>
              );
            })}

            {/* Draw Graph Nodes (Intersections) */}
            {intersections.map(node => {
              const pos = nodePositions[node.id];
              if (!pos) return null;
              const isSelected = selectedNode === node.id;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer pulse if selected */}
                  {isSelected && (
                    <circle cx={pos.x} cy={pos.y} r={28} fill="rgba(99, 102, 241, 0.25)">
                      <animate attributeName="r" values="24;32;24" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Main Node Circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 18 : 14}
                    fill={getNodeColor(node.id)}
                    stroke={isSelected ? '#6366F1' : '#38BDF8'}
                    strokeWidth={2}
                  />
                  {/* Node ID label */}
                  <text
                    x={pos.x}
                    y={pos.y + 4}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={10}
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                  >
                    N{node.id}
                  </text>
                  {/* Text Label */}
                  <text
                    x={pos.x}
                    y={pos.y - 20}
                    textAnchor="middle"
                    fill="var(--text-primary)"
                    fontSize={10}
                    fontWeight="600"
                  >
                    {node.intersectionName}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Node detail tooltip overlay if selected */}
          {selectedNode && (
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                background: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid var(--primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1.25rem',
                boxShadow: 'var(--shadow-lg)',
                maxWidth: '280px'
              }}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                SELECTED INTERSECTION
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', margin: '0.2rem 0' }}>
                {intersections.find(i => i.id === selectedNode)?.intersectionName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Zone: {intersections.find(i => i.id === selectedNode)?.zone} | Type: {intersections.find(i => i.id === selectedNode)?.intersectionType}
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="btn btn-secondary"
                style={{ marginTop: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Road Cards Grid */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
        Road Segments ({filteredRoads.length})
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filteredRoads.map(road => (
          <div key={road.id} className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                RD-{String(road.id).padStart(3, '0')}
              </span>
              <span className={`badge ${
                road.roadStatus === 'LOW' ? 'badge-green' :
                road.roadStatus === 'MODERATE' ? 'badge-yellow' :
                road.roadStatus === 'HEAVY' ? 'badge-orange' : 'badge-red'
              }`}>
                {road.roadStatus}
              </span>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {road.roadName}
            </h4>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
              {road.startIntersectionName} ➔ {road.endIntersectionName} ({road.distanceKm} km)
            </div>

            {/* Density Progress Bar */}
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Load: {road.currentVehicleCount} / {road.maxCapacity}</span>
                <span style={{ fontWeight: 700 }}>{road.trafficDensity}%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 3, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, road.trafficDensity)}%`,
                    height: '100%',
                    background: road.trafficDensity > 75 ? '#F43F5E' : road.trafficDensity > 50 ? '#F59E0B' : '#10B981',
                    borderRadius: 3
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <span>Avg Speed: <strong style={{ color: 'var(--text-primary)' }}>{road.averageSpeed} km/h</strong></span>
              <span>Limit: {road.speedLimit} km/h</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
