import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { SimulationProvider } from './context/SimulationContext';
import MainLayout from './layouts/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import LiveTraffic from './pages/LiveTraffic';
import VehicleManagement from './pages/VehicleManagement';
import RoadManagement from './pages/RoadManagement';
import TrafficSignals from './pages/TrafficSignals';
import EmergencyPriority from './pages/EmergencyPriority';
import RouteOptimization from './pages/RouteOptimization';
import AnalyticsReports from './pages/AnalyticsReports';
import SimulationControl from './pages/SimulationControl';
import SettingsPage from './pages/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <SimulationProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#1E293B',
                color: '#F8FAFC',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.85rem',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#FFFFFF'
                }
              },
              error: {
                iconTheme: {
                  primary: '#F43F5E',
                  secondary: '#FFFFFF'
                }
              }
            }}
          />
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="traffic" element={<LiveTraffic />} />
              <Route path="vehicles" element={<VehicleManagement />} />
              <Route path="roads" element={<RoadManagement />} />
              <Route path="signals" element={<TrafficSignals />} />
              <Route path="emergency" element={<EmergencyPriority />} />
              <Route path="routes" element={<RouteOptimization />} />
              <Route path="analytics" element={<AnalyticsReports />} />
              <Route path="simulation" element={<SimulationControl />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SimulationProvider>
    </ThemeProvider>
  );
}
