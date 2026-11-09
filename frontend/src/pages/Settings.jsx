import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Settings,
  Database,
  Moon,
  Sun,
  RotateCcw,
  Code2,
  Cpu,
  Layers,
  CheckCircle2,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSimulation } from '../context/SimulationContext';

export default function SettingsPage() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { resetSimulation } = useSimulation();
  const [refreshInterval, setRefreshInterval] = useState('2500');

  const handleReset = async () => {
    if (window.confirm('Reset all simulated roads and vehicles back to baseline demo state?')) {
      await resetSimulation();
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          System Settings &amp; Technical Architecture
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Environment configurations, database diagnostics, and technical implementation evaluation notes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Appearance & Interface Settings */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Sliders size={20} color="#6366F1" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              UI &amp; Dashboard Preferences
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Interface Theme</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toggle between enterprise Dark and Light palettes</p>
              </div>
              <button onClick={toggleTheme} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
                {isDark ? <Moon size={15} color="#6366F1" /> : <Sun size={15} color="#F59E0B" />}
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Telemetry Refresh Rate</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Background API polling frequency</p>
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => {
                  setRefreshInterval(e.target.value);
                  toast.success(`Telemetry refresh interval set to ${e.target.value}ms`);
                }}
                className="form-control"
                style={{ width: 'auto', minWidth: 120 }}
              >
                <option value="1500">1.5s (Fast)</option>
                <option value="2500">2.5s (Default)</option>
                <option value="5000">5.0s (Relaxed)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Restore Baseline Demo Data</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Reset 16 roads, 10 signals, and 32 vehicles</p>
              </div>
              <button onClick={handleReset} className="btn btn-danger" style={{ fontSize: '0.8rem' }}>
                <RotateCcw size={14} /> Reset Data
              </button>
            </div>
          </div>
        </div>

        {/* Database & Backend Configuration */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Database size={20} color="#10B981" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Database &amp; Persistence Config
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.82rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Primary Database:</span>
                <strong style={{ color: '#10B981' }}>MySQL (smart_traffic_db)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Active Persistence Mode:</span>
                <strong style={{ fontFamily: 'var(--font-mono)' }}>Persistent File H2 (MySQL Mode)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Storage Location:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>./backend/data/smart_traffic_db.mv.db</span>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Data automatically survives application restarts through file-based journaling. To connect to an external live MySQL instance, launch Spring Boot with <code>--spring.profiles.active=mysql</code> or update <code>application.properties</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Technical Evaluation Guide (Java Concepts Showcase) */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Code2 size={22} color="#8B5CF6" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Technical Evaluation Guide: Implemented Java Concepts
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: '#6366F1', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              1. Java Collections Framework
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li><code>HashMap&lt;Long, List&lt;RoadEdge&gt;&gt;</code>: Adjacency list graph representation</li>
              <li><code>PriorityQueue&lt;Vehicle&gt;</code>: Min-heap with custom Comparator for Emergency vehicles</li>
              <li><code>LinkedList&lt;Vehicle&gt; / Deque</code>: FIFO waiting lines + front-of-line preemption</li>
              <li><code>HashSet&lt;String&gt;</code>: Edge uniqueness and loop prevention</li>
              <li><code>ArrayList&lt;Road&gt;</code>: Index-based iteration and path serialization</li>
            </ul>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: '#06B6D4', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              2. Dijkstra's Algorithm
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li>Greedy node relaxation using <code>PriorityQueue&lt;NodeDistance&gt;</code></li>
              <li>Dynamic cost weights: distance, congestion penalty, travel time</li>
              <li>Path predecessor backtracking via <code>HashMap&lt;Long, Long&gt;</code></li>
              <li>Alternative route discovery by edge penalization</li>
            </ul>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: '#10B981', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              3. Java Multithreading
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li><code>ScheduledExecutorService</code> with 5 concurrent daemon worker tasks</li>
              <li>Thread-safe <code>ConcurrentHashMap</code> &amp; synchronized queues</li>
              <li>Atomic state management: <code>AtomicBoolean</code>, <code>AtomicLong</code></li>
              <li>Start, Pause, Resume, Stop, Speed adjustment controls</li>
            </ul>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              4. Stream API &amp; Modern Java
            </h4>
            <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <li><code>Collectors.groupingBy()</code> for vehicle &amp; road aggregations</li>
              <li><code>Stream.filter()</code> for congested corridor alerts</li>
              <li><code>Stream.mapToDouble().average()</code> for real-time telemetry</li>
              <li><code>Stream.max(Comparator)</code> for finding peak congestion bottlenecks</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
