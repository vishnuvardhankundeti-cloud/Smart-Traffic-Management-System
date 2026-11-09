import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  TrafficCone,
  RotateCcw,
  Sliders,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  X
} from 'lucide-react';
import { getSignals, cycleSignal, updateSignal } from '../services/api';
import { useSimulation } from '../context/SimulationContext';

export default function TrafficSignals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSignal, setEditingSignal] = useState(null);
  const { simulationStatus } = useSimulation();

  const [timings, setTimings] = useState({
    greenDurationSeconds: 45,
    yellowDurationSeconds: 5,
    redDurationSeconds: 50
  });

  const loadSignals = async () => {
    try {
      const res = await getSignals();
      setSignals(res.data || []);
    } catch (err) {
      toast.error('Failed to load signals: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
  }, [simulationStatus?.runtimeSeconds]);

  const handleManualCycle = async (id) => {
    try {
      const res = await cycleSignal(id);
      toast.success(`Signal at ${res.data.intersectionName} cycled to ${res.data.currentSignalState}!`);
      loadSignals();
    } catch (err) {
      toast.error('Failed to cycle signal: ' + err.message);
    }
  };

  const handleOpenEdit = (sig) => {
    setEditingSignal(sig);
    setTimings({
      greenDurationSeconds: sig.greenDurationSeconds || 45,
      yellowDurationSeconds: sig.yellowDurationSeconds || 5,
      redDurationSeconds: sig.redDurationSeconds || 50
    });
  };

  const handleSaveTimings = async (e) => {
    e.preventDefault();
    if (!editingSignal) return;
    try {
      await updateSignal(editingSignal.id, {
        ...editingSignal,
        greenDurationSeconds: Number(timings.greenDurationSeconds),
        yellowDurationSeconds: Number(timings.yellowDurationSeconds),
        redDurationSeconds: Number(timings.redDurationSeconds)
      });
      toast.success(`Timings updated for ${editingSignal.intersectionName}`);
      setEditingSignal(null);
      loadSignals();
    } catch (err) {
      toast.error('Failed to update timings: ' + err.message);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Traffic Signal Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Simulated automated traffic lights with autonomous countdown cycles and emergency preemption.
          </p>
        </div>

        <button onClick={loadSignals} className="btn btn-secondary btn-icon" title="Refresh Signals">
          <RotateCw size={15} />
        </button>
      </div>

      {/* Signal Grid with Animated Traffic Lights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {signals.map(sig => {
          const state = sig.currentSignalState; // RED, YELLOW, GREEN

          return (
            <div key={sig.id} className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    SIG-{String(sig.id).padStart(3, '0')}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.15rem 0' }}>
                    {sig.intersectionName}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Mode: <strong style={{ color: sig.mode === 'EMERGENCY_PREEMPT' ? '#F43F5E' : 'var(--text-primary)' }}>{sig.mode}</strong>
                  </div>
                </div>

                <span className={`badge ${
                  state === 'GREEN' ? 'badge-green' : state === 'YELLOW' ? 'badge-yellow' : 'badge-red'
                }`}>
                  {state}
                </span>
              </div>

              {/* Realistic Animated Traffic Light Box */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '1.5rem',
                  padding: '1rem',
                  background: 'rgba(0, 0, 0, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  marginBottom: '1rem'
                }}
              >
                {/* Visual Light Enclosure */}
                <div
                  style={{
                    background: '#111827',
                    padding: '8px 10px',
                    borderRadius: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)'
                  }}
                >
                  {/* RED LIGHT */}
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: state === 'RED' ? '#EF4444' : '#450A0A',
                      boxShadow: state === 'RED' ? '0 0 16px #EF4444' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />

                  {/* YELLOW LIGHT */}
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: state === 'YELLOW' ? '#FBBF24' : '#451A03',
                      boxShadow: state === 'YELLOW' ? '0 0 16px #FBBF24' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />

                  {/* GREEN LIGHT */}
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: state === 'GREEN' ? '#10B981' : '#064E3B',
                      boxShadow: state === 'GREEN' ? '0 0 16px #10B981' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>

                {/* Countdown Timer Display */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>REMAINING IN PHASE</div>
                  <div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      color: state === 'GREEN' ? '#10B981' : state === 'YELLOW' ? '#F59E0B' : '#EF4444',
                      lineHeight: 1
                    }}
                  >
                    {Math.max(0, sig.cycleRemainingSeconds || 0)}s
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    G: {sig.greenDurationSeconds}s | Y: {sig.yellowDurationSeconds}s | R: {sig.redDurationSeconds}s
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleManualCycle(sig.id)}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '0.78rem' }}
                >
                  <RotateCw size={13} /> Cycle Phase
                </button>
                <button
                  onClick={() => handleOpenEdit(sig)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.78rem' }}
                >
                  <Settings2 size={13} /> Timings
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timing Configuration Modal */}
      {editingSignal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Configure Timings: {editingSignal.intersectionName}
              </h3>
              <button onClick={() => setEditingSignal(null)} className="btn btn-secondary btn-icon" style={{ width: 28, height: 28, border: 'none' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTimings}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Green Phase Duration (seconds)</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    required
                    value={timings.greenDurationSeconds}
                    onChange={(e) => setTimings({ ...timings, greenDurationSeconds: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Yellow Phase Duration (seconds)</label>
                  <input
                    type="number"
                    min="2"
                    max="15"
                    required
                    value={timings.yellowDurationSeconds}
                    onChange={(e) => setTimings({ ...timings, yellowDurationSeconds: e.target.value })}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Red Phase Duration (seconds)</label>
                  <input
                    type="number"
                    min="10"
                    max="180"
                    required
                    value={timings.redDurationSeconds}
                    onChange={(e) => setTimings({ ...timings, redDurationSeconds: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setEditingSignal(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Signal Timings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
