import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Cpu,
  Play,
  Pause,
  Square,
  RotateCcw,
  Zap,
  Activity,
  Layers,
  Terminal,
  Clock,
  Car,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';
import { getSimulationLogs } from '../services/api';

export default function SimulationControl() {
  const {
    simulationStatus,
    startSimulation,
    pauseSimulation,
    resumeSimulation,
    stopSimulation,
    resetSimulation,
    setSpeed
  } = useSimulation();

  const [logs, setLogs] = useState([]);
  const [autoScroll, setAutoScroll] = useState(true);

  const status = simulationStatus || {
    state: 'RUNNING',
    runtimeSeconds: 0,
    speedMultiplier: 1,
    activeThreads: 5,
    vehiclesGenerated: 32,
    vehiclesProcessed: 0,
    currentQueueSize: 0,
    currentAvgDensity: 42.5,
    recentLogs: []
  };

  useEffect(() => {
    getSimulationLogs(50)
      .then(res => setLogs(res.data || []))
      .catch(() => {});
  }, [status.runtimeSeconds]);

  const state = status.state;

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Cpu color="#6366F1" size={28} /> Simulation Control Center
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Manage backend <strong>Java ExecutorService multithreading</strong>, thread worker tasks, and real-time execution speeds.
        </p>
      </div>

      {/* Control Station Card */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: state === 'RUNNING' ? '#10B981' : state === 'PAUSED' ? '#F59E0B' : '#F43F5E',
                boxShadow: `0 0 14px ${state === 'RUNNING' ? '#10B981' : state === 'PAUSED' ? '#F59E0B' : '#F43F5E'}`
              }}
            />
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT STATE</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {state}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {state === 'STOPPED' ? (
              <button onClick={startSimulation} className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
                <Play size={16} /> Start Engine
              </button>
            ) : state === 'PAUSED' ? (
              <button onClick={resumeSimulation} className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
                <Play size={16} /> Resume Simulation
              </button>
            ) : (
              <button onClick={pauseSimulation} className="btn btn-secondary" style={{ padding: '0.65rem 1.4rem' }}>
                <Pause size={16} /> Pause Simulation
              </button>
            )}

            {state !== 'STOPPED' && (
              <button onClick={stopSimulation} className="btn btn-danger" style={{ padding: '0.65rem 1.4rem' }}>
                <Square size={16} /> Terminate
              </button>
            )}

            <button onClick={resetSimulation} className="btn btn-secondary" style={{ padding: '0.65rem 1.4rem' }}>
              <RotateCcw size={16} /> Reset Default
            </button>
          </div>
        </div>

        {/* Speed Adjustment Bar */}
        <div style={{ padding: '1rem', background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} color="#F59E0B" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Simulation Speed:</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
              {status.speedMultiplier}x Realtime
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2, 5, 10].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="btn btn-secondary"
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  backgroundColor: status.speedMultiplier === s ? 'var(--primary)' : undefined,
                  color: status.speedMultiplier === s ? '#FFFFFF' : undefined,
                  borderColor: status.speedMultiplier === s ? 'var(--primary)' : undefined
                }}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5 Real-Time Engine Telemetry KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONCURRENT WORKER THREADS</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', margin: '0.2rem 0' }}>
            {status.activeThreads}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10B981' }}>ExecutorService pool</div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SIMULATION RUNTIME</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', margin: '0.2rem 0' }}>
            {Math.floor(status.runtimeSeconds / 60)}m {status.runtimeSeconds % 60}s
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Active ticks</div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>VEHICLES SPAWNED</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.2rem 0' }}>
            {status.vehiclesGenerated}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Arrival task total</div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>VEHICLES PROCESSED</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10B981', margin: '0.2rem 0' }}>
            {status.vehiclesProcessed}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#10B981' }}>Queues cleared</div>
        </div>

        <div className="glass-card">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>WAITING QUEUE SIZE</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#F59E0B', margin: '0.2rem 0' }}>
            {status.currentQueueSize}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#F59E0B' }}>Vehicles at signals</div>
        </div>
      </div>

      {/* Concurrent Worker Thread Architecture Overview */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Java Multithreading Task Allocation (ScheduledExecutorService)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#6366F1' }}>Thread 1: Arrivals</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Simulates vehicle arrivals and route entries across road graph every 3.0s.
            </p>
          </div>

          <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#06B6D4' }}>Thread 2: Density</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Recalculates occupancy &amp; average speeds, detecting congestion alerts every 2.0s.
            </p>
          </div>

          <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#10B981' }}>Thread 3: Queue Scheduler</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Processes intersection waiting FIFO and priority preemptions every 2.5s.
            </p>
          </div>

          <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#F59E0B' }}>Thread 4: Signal Cycling</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Autonomous countdown transitions (GREEN ➔ YELLOW ➔ RED) every 1.0s.
            </p>
          </div>

          <div style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: '#EC4899' }}>Thread 5: Analytics Logging</strong>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Records historical database snapshots &amp; telemetry streams every 8.0s.
            </p>
          </div>
        </div>
      </div>

      {/* Real-Time Simulation Activity Log Stream */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 0, 0, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Terminal size={17} color="#10B981" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Live Thread Activity Log
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Showing {logs.length} recent events
          </span>
        </div>

        <div
          style={{
            maxHeight: 380,
            overflowY: 'auto',
            padding: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            background: '#090D16'
          }}
        >
          {logs.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              Waiting for simulation log events...
            </div>
          ) : (
            logs.map(log => {
              const levelColor =
                log.level === 'ALERT' || log.level === 'CRITICAL' ? '#F43F5E' :
                log.level === 'WARNING' ? '#F59E0B' :
                log.level === 'SUCCESS' ? '#10B981' : '#38BDF8';

              return (
                <div key={log.id} style={{ display: 'flex', gap: '0.75rem', lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 70 }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span style={{ color: levelColor, minWidth: 150, fontWeight: 700 }}>
                    [{log.threadName}]
                  </span>
                  <span style={{ color: '#E2E8F0' }}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
