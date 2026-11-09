import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Siren,
  PlusCircle,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  Clock,
  Layers
} from 'lucide-react';
import { getEmergencyPriorityQueue, dispatchEmergencyVehicle, resolveEmergency, getRoads } from '../services/api';
import { useSimulation } from '../context/SimulationContext';

export default function EmergencyPriority() {
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [roads, setRoads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { simulationStatus } = useSimulation();

  // Dispatch Form
  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleType: 'AMBULANCE',
    currentRoadId: '',
    destinationRoadId: '',
    speed: 75
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [queueRes, roadsRes] = await Promise.all([
        getEmergencyPriorityQueue(),
        getRoads()
      ]);
      setPriorityQueue(queueRes.data || []);
      setRoads(roadsRes.data || []);
      if (!formData.currentRoadId && roadsRes.data?.length >= 2) {
        setFormData(prev => ({
          ...prev,
          currentRoadId: roadsRes.data[0].id,
          destinationRoadId: roadsRes.data[4]?.id || roadsRes.data[1].id
        }));
      }
    } catch (err) {
      toast.error('Failed to load emergency queue: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [simulationStatus?.runtimeSeconds]);

  const handleDispatch = async (e) => {
    e.preventDefault();
    if (!formData.currentRoadId || !formData.destinationRoadId) {
      toast.error('Please select both start and destination corridors');
      return;
    }

    try {
      const reg = formData.registrationNumber.trim() ||
        (formData.vehicleType === 'AMBULANCE' ? 'MED-' + Math.floor(100 + Math.random() * 900) :
         formData.vehicleType === 'FIRE_ENGINE' ? 'FIRE-' + Math.floor(100 + Math.random() * 900) :
         'POLICE-' + Math.floor(100 + Math.random() * 900));

      await dispatchEmergencyVehicle({
        registrationNumber: reg,
        vehicleType: formData.vehicleType,
        currentRoadId: Number(formData.currentRoadId),
        destinationRoadId: Number(formData.destinationRoadId),
        speed: Number(formData.speed)
      });

      toast.success(`Emergency Vehicle ${reg} dispatched with PriorityQueue preemption!`, {
        icon: '🚨',
        duration: 4000
      });

      setFormData(prev => ({
        ...prev,
        registrationNumber: ''
      }));
      loadData();
    } catch (err) {
      toast.error('Dispatch failed: ' + err.message);
    }
  };

  const handleResolve = async (id, reg) => {
    try {
      await resolveEmergency(id);
      toast.success(`Emergency mission for ${reg} completed! Corridors restored.`);
      loadData();
    } catch (err) {
      toast.error('Failed to resolve: ' + err.message);
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Siren color="#F43F5E" size={28} /> Emergency Vehicle Priority System
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Powered by Java <code>PriorityQueue&lt;Vehicle&gt;</code> with custom Comparator: Ambulance &gt; Fire Engine &gt; Police &gt; Normal.
        </p>
      </div>

      {/* Grid: Dispatch Form on left, Concept Highlights on right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Quick Dispatch Form */}
        <div className="glass-card" style={{ border: '1px solid rgba(244, 63, 94, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Siren size={18} color="#F43F5E" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Dispatch Emergency Priority Transit
            </h3>
          </div>

          <form onSubmit={handleDispatch}>
            <div className="form-group">
              <label className="form-label">Emergency Category</label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="form-control"
              >
                <option value="AMBULANCE">Ambulance (Rank 1 - Highest Priority)</option>
                <option value="FIRE_ENGINE">Fire Engine (Rank 2 - Medium Emergency)</option>
                <option value="POLICE_VEHICLE">Police Cruiser (Rank 3 - Law Enforcement)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Registration Code (Optional, auto-generated)</label>
              <input
                type="text"
                placeholder="e.g. MED-911-CRITICAL"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                className="form-control"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Origin Corridor</label>
                <select
                  value={formData.currentRoadId}
                  onChange={(e) => setFormData({ ...formData, currentRoadId: e.target.value })}
                  className="form-control"
                >
                  {roads.map(r => (
                    <option key={r.id} value={r.id}>{r.roadName}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Destination Corridor</label>
                <select
                  value={formData.destinationRoadId}
                  onChange={(e) => setFormData({ ...formData, destinationRoadId: e.target.value })}
                  className="form-control"
                >
                  {roads.map(r => (
                    <option key={r.id} value={r.id}>{r.roadName}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-danger" style={{ width: '100%', marginTop: '0.5rem', fontWeight: 700 }}>
              <Siren size={16} /> Enqueue &amp; Dispatch Priority Vehicle
            </button>
          </form>
        </div>

        {/* Java PriorityQueue Architecture Highlights */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Layers size={18} color="#6366F1" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Java Collections Architecture
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: '#F43F5E' }}>PriorityQueue&lt;Vehicle&gt; with Custom Comparator:</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Maintains a min-heap ordered by priority rank (1 through 6). Emergency vehicles naturally float to head of line in O(log N) time.
              </p>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: '#38BDF8' }}>Deque Preemption at Intersections:</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Intersection waiting lines implement <code>Deque.addFirst(vehicle)</code> for emergency preemption, bypassing normal FIFO waiting queues.
              </p>
            </div>

            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
              <strong style={{ color: '#10B981' }}>Automated Green Wave Corridor:</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Dijkstra calculates the fastest path to destination and flips all intermediate signals to GREEN with emergency override mode.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Priority Queue Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Active Priority Queue ({priorityQueue.length} Vehicles Enqueued)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Ranked in exact order of Comparator evaluation (highest priority at index 0)
            </p>
          </div>
          <button onClick={loadData} className="btn btn-secondary btn-icon" title="Refresh Queue">
            <RotateCw size={15} />
          </button>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Queue Position</th>
                <th>Registration</th>
                <th>Category</th>
                <th>Priority Rank</th>
                <th>Current Corridor</th>
                <th>Destination</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Corridor Control</th>
              </tr>
            </thead>
            <tbody>
              {priorityQueue.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No emergency vehicles currently enqueued. Standard FIFO scheduling active.
                  </td>
                </tr>
              ) : (
                priorityQueue.map((v, idx) => (
                  <tr key={v.id} style={{ background: idx === 0 ? 'rgba(244, 63, 94, 0.06)' : undefined }}>
                    <td>
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          background: idx === 0 ? '#F43F5E' : 'rgba(255, 255, 255, 0.1)',
                          color: '#FFFFFF'
                        }}
                      >
                        #{idx + 1}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, letterSpacing: '0.04em' }}>{v.registrationNumber}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        {v.vehicleType === 'AMBULANCE' ? '🚑 Ambulance' :
                         v.vehicleType === 'FIRE_ENGINE' ? '🚒 Fire Engine' : '🚓 Police Vehicle'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-red">
                        {v.priority}
                      </span>
                    </td>
                    <td>{v.currentRoadName || 'Corridor Transit'}</td>
                    <td>{v.destinationRoadName || 'Emergency Center'}</td>
                    <td>
                      <span className="badge badge-yellow">
                        {v.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleResolve(v.id, v.registrationNumber)}
                        className="btn btn-success"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      >
                        <CheckCircle2 size={13} /> Complete Mission
                      </button>
                    </td>
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
