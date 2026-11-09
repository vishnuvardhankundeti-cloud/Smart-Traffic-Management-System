import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Compass,
  ArrowRight,
  Clock,
  Milestone,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  GitBranch,
  RotateCw
} from 'lucide-react';
import { calculateShortestPath, getIntersections, getRouteHistory } from '../services/api';

export default function RouteOptimization() {
  const [intersections, setIntersections] = useState([]);
  const [startId, setStartId] = useState('');
  const [destId, setDestId] = useState('');
  const [criteria, setCriteria] = useState('SHORTEST_DISTANCE');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getIntersections()
      .then(res => {
        const list = res.data || [];
        setIntersections(list);
        if (list.length >= 2) {
          setStartId(list[0].id);
          setDestId(list[4]?.id || list[1].id);
        }
      })
      .catch(() => {});

    loadHistory();
  }, []);

  const loadHistory = () => {
    getRouteHistory()
      .then(res => setHistory(res.data || []))
      .catch(() => {});
  };

  const handleCalculate = async (e) => {
    e?.preventDefault();
    if (!startId || !destId) {
      toast.error('Please select both starting and destination intersections');
      return;
    }
    if (startId === destId) {
      toast.error('Starting point and destination cannot be identical');
      return;
    }

    try {
      setLoading(true);
      const res = await calculateShortestPath({
        startIntersectionId: Number(startId),
        destinationIntersectionId: Number(destId),
        criteria: criteria
      });
      setResult(res.data);
      if (res.data?.pathFound) {
        toast.success('Optimal route calculated using Dijkstra algorithm!');
      } else {
        toast.error('No viable route found between selected nodes');
      }
      loadHistory();
    } catch (err) {
      toast.error('Calculation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Shortest Path &amp; Route Optimization
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Powered by Java <code>PriorityQueue</code> and <strong>Dijkstra's Shortest Path Algorithm</strong> with dynamic congestion weights.
        </p>
      </div>

      {/* Control Panel: Start, Destination, Mode Selection */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleCalculate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
            {/* Start Node */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>1. Starting Point (Origin)</label>
              <select
                value={startId}
                onChange={(e) => setStartId(Number(e.target.value))}
                className="form-control"
                style={{ height: 42 }}
              >
                {intersections.map(i => (
                  <option key={i.id} value={i.id}>{i.intersectionName} (Node {i.id})</option>
                ))}
              </select>
            </div>

            {/* Destination Node */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>2. Destination (Target)</label>
              <select
                value={destId}
                onChange={(e) => setDestId(Number(e.target.value))}
                className="form-control"
                style={{ height: 42 }}
              >
                {intersections.map(i => (
                  <option key={i.id} value={i.id}>{i.intersectionName} (Node {i.id})</option>
                ))}
              </select>
            </div>

            {/* Optimization Criterion */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>3. Optimization Objective</label>
              <select
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                className="form-control"
                style={{ height: 42 }}
              >
                <option value="SHORTEST_DISTANCE">Shortest Physical Distance</option>
                <option value="LOWEST_TRAFFIC">Lowest Traffic &amp; Avoid Congestion</option>
                <option value="MIN_TRAVEL_TIME">Minimum Estimated Travel Time</option>
              </select>
            </div>

            {/* Calculate Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ height: 42, width: '100%', fontSize: '0.9rem', fontWeight: 600 }}
              >
                <Compass size={17} /> {loading ? 'Computing Dijkstra...' : 'Calculate Optimal Path'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results View: Recommended Best Path vs Alternative Path */}
      {result && result.pathFound && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Recommended Route Card */}
          <div
            className="glass-card"
            style={{
              border: '2px solid var(--primary)',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.25)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderBottomLeftRadius: 8
              }}
            >
              RECOMMENDED OPTIMAL ROUTE
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
              <CheckCircle2 size={20} color="#10B981" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {result.startIntersectionName} ➔ {result.destinationIntersectionName}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TOTAL DISTANCE</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {result.totalDistanceKm} km
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ESTIMATED TIME</div>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                  {result.estimatedTravelTimeMinutes} mins
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CRITERIA</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
                  {result.criteria}
                </div>
              </div>
            </div>

            {/* Path Node Sequence Breadcrumb */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                WAYPOINTS &amp; INTERMEDIATE NODES ({result.recommendedPath?.length || 0}):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                {result.recommendedPath?.map((node, idx) => (
                  <React.Fragment key={node.id}>
                    <span
                      style={{
                        padding: '0.35rem 0.65rem',
                        background: idx === 0 ? 'rgba(16, 185, 129, 0.2)' : idx === result.recommendedPath.length - 1 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.07)',
                        border: `1px solid ${idx === 0 ? '#10B981' : idx === result.recommendedPath.length - 1 ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--text-primary)'
                      }}
                    >
                      {node.name}
                    </span>
                    {idx < result.recommendedPath.length - 1 && (
                      <ArrowRight size={14} color="var(--text-muted)" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Traversed Roads Detail */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                TRAVERSED ROAD CORRIDORS:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {result.recommendedRoads?.map((r, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(0, 0, 0, 0.15)',
                      borderRadius: 4,
                      fontSize: '0.8rem'
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{r.name}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{r.distanceKm} km | Density: {r.trafficDensity}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alternative Route Card for Comparison */}
          {result.alternativePath && result.alternativePath.length > 0 ? (
            <div className="glass-card" style={{ border: '1px solid var(--border-color)', position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderBottomLeftRadius: 8
                }}
              >
                ALTERNATIVE BYPASS ROUTE
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                <GitBranch size={20} color="#8B5CF6" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Secondary Alternate Corridor
                </h3>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', padding: '0.85rem 1rem', background: 'rgba(0, 0, 0, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>TOTAL DISTANCE</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {result.alternativeDistanceKm} km
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ESTIMATED TIME</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#F59E0B', fontFamily: 'var(--font-mono)' }}>
                    {result.alternativeTravelTimeMinutes} mins
                  </div>
                </div>
              </div>

              {/* Path Node Sequence Breadcrumb */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  WAYPOINTS ({result.alternativePath.length}):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                  {result.alternativePath.map((node, idx) => (
                    <React.Fragment key={node.id}>
                      <span
                        style={{
                          padding: '0.35rem 0.65rem',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          fontWeight: 500,
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {node.name}
                      </span>
                      {idx < result.alternativePath.length - 1 && (
                        <ArrowRight size={14} color="var(--text-muted)" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Traversed Roads Detail */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  ALTERNATIVE ROADS:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {result.alternativeRoads?.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(0, 0, 0, 0.15)',
                        borderRadius: 4,
                        fontSize: '0.8rem'
                      }}
                    >
                      <span>{r.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{r.distanceKm} km</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No alternative route exists for this specific topological node pair.
            </div>
          )}
        </div>
      )}

      {/* Calculation History */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Recent Route Optimization Queries
        </h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Route Description</th>
                <th>Distance</th>
                <th>Estimated Time</th>
                <th>Optimization Mode</th>
                <th>Calculated Waypoints</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No prior routes calculated yet.
                  </td>
                </tr>
              ) : (
                history.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.routeName}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{item.totalDistanceKm} km</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{item.estimatedTravelTimeMinutes} min</td>
                    <td><span className="badge badge-purple">{item.optimizationType}</span></td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.pathRoadNames || item.pathNodeIds}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
