import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Car,
  Milestone,
  TrafficCone,
  Siren,
  Compass,
  BarChart3,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSimulation } from '../context/SimulationContext';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [time, setTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, toggleTheme, isDark } = useTheme();
  const { simulationStatus, isBackendOnline, startSimulation, pauseSimulation, resetSimulation } = useSimulation();
  const navigate = useNavigate();

  // Digital clock update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Live Traffic', path: '/traffic', icon: Activity },
    { name: 'Vehicles', path: '/vehicles', icon: Car },
    { name: 'Roads & Routes', path: '/roads', icon: Milestone },
    { name: 'Traffic Signals', path: '/signals', icon: TrafficCone },
    { name: 'Emergency Priority', path: '/emergency', icon: Siren, highlight: true },
    { name: 'Route Optimization', path: '/routes', icon: Compass },
    { name: 'Analytics & Reports', path: '/analytics', icon: BarChart3 },
    { name: 'Simulation Control', path: '/simulation', icon: Cpu },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    if (q.includes('veh') || q.includes('car')) navigate('/vehicles');
    else if (q.includes('road')) navigate('/roads');
    else if (q.includes('sig')) navigate('/signals');
    else if (q.includes('emerg') || q.includes('ambul')) navigate('/emergency');
    else if (q.includes('rout') || q.includes('path') || q.includes('dijk')) navigate('/routes');
    else if (q.includes('analyt') || q.includes('chart') || q.includes('rep')) navigate('/analytics');
    else if (q.includes('sim')) navigate('/simulation');
    else navigate('/traffic');
  };

  const simState = simulationStatus?.state || 'RUNNING';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--topbar-height)',
            padding: collapsed ? '0 1rem' : '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--border-color)',
            background: 'rgba(0, 0, 0, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
              }}
            >
              🚦
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  STMS
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Smart Traffic System
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn btn-icon btn-secondary"
            style={{ width: 28, height: 28, border: 'none' }}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: collapsed ? '0.75rem 0' : '0.65rem 0.85rem',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s ease',
                  position: 'relative'
                })}
                title={collapsed ? item.name : undefined}
              >
                <Icon size={19} color={item.highlight ? '#F43F5E' : 'currentColor'} />
                {!collapsed && (
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </span>
                )}
                {item.highlight && !collapsed && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.65rem',
                      background: 'rgba(244, 63, 94, 0.2)',
                      color: '#F43F5E',
                      padding: '2px 6px',
                      borderRadius: 10,
                      fontWeight: 700
                    }}
                  >
                    PRIORITY
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Simulation Quick Controls in Sidebar Footer */}
        {!collapsed && (
          <div
            style={{
              padding: '1rem',
              margin: '0.75rem',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>SIMULATION ENGINE</span>
              <span className={`badge ${simState === 'RUNNING' ? 'badge-green' : simState === 'PAUSED' ? 'badge-yellow' : 'badge-red'}`} style={{ fontSize: '0.65rem' }}>
                {simState}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {simState === 'RUNNING' ? (
                <button onClick={pauseSimulation} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}>
                  <Pause size={13} /> Pause
                </button>
              ) : (
                <button onClick={startSimulation} className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }}>
                  <Play size={13} /> Run
                </button>
              )}
              <button onClick={resetSimulation} className="btn btn-secondary" style={{ padding: '0.4rem 0.6rem' }} title="Reset Simulation">
                <RotateCcw size={13} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Top Navigation Bar */}
        <header
          style={{
            height: 'var(--topbar-height)',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Global Search Bar */}
          <form onSubmit={handleGlobalSearch} style={{ position: 'relative', width: '320px' }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search vehicles, roads, signals... [Enter]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '2.4rem', fontSize: '0.8rem', height: '38px', borderRadius: 'var(--radius-full)' }}
            />
          </form>

          {/* Right Topbar Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Live Clock */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {time.toLocaleTimeString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>

            <div style={{ width: 1, height: 26, background: 'var(--border-color)' }} />

            {/* Backend Status Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: isBackendOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                border: `1px solid ${isBackendOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: isBackendOnline ? '#10B981' : '#F43F5E'
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: isBackendOnline ? '#10B981' : '#F43F5E',
                  boxShadow: `0 0 8px ${isBackendOnline ? '#10B981' : '#F43F5E'}`
                }}
              />
              {isBackendOnline ? 'SYSTEM ONLINE' : 'SERVER DISCONNECTED'}
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-icon btn-secondary"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            >
              {isDark ? <Sun size={17} color="#F59E0B" /> : <Moon size={17} color="#6366F1" />}
            </button>

            {/* Profile Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: '#FFFFFF'
                }}
              >
                AD
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Traffic Admin</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Chief Controller</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main style={{ padding: '2rem', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
