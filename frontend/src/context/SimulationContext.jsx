import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getSimulationStatus,
  startSimulation as apiStartSim,
  pauseSimulation as apiPauseSim,
  resumeSimulation as apiResumeSim,
  stopSimulation as apiStopSim,
  resetSimulation as apiResetSim,
  setSimulationSpeed as apiSetSpeed,
  getTrafficOverview
} from '../services/api';

const SimulationContext = createContext();

export function SimulationProvider({ children }) {
  const [simulationStatus, setSimulationStatus] = useState({
    state: 'RUNNING',
    runtimeSeconds: 0,
    speedMultiplier: 1,
    activeThreads: 5,
    vehiclesGenerated: 32,
    vehiclesProcessed: 0,
    currentQueueSize: 0,
    currentAvgDensity: 42.5,
    recentLogs: []
  });

  const [trafficOverview, setTrafficOverview] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const [simRes, overviewRes] = await Promise.allSettled([
        getSimulationStatus(),
        getTrafficOverview()
      ]);

      if (simRes.status === 'fulfilled' && simRes.value?.data) {
        setSimulationStatus(simRes.value.data);
        setIsBackendOnline(true);
      }
      if (overviewRes.status === 'fulfilled' && overviewRes.value?.data) {
        setTrafficOverview(overviewRes.value.data);
      }
    } catch {
      setIsBackendOnline(false);
    }
  }, []);

  // Poll simulation telemetry every 2.5 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2500);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleStart = async () => {
    try {
      setLoading(true);
      const res = await apiStartSim();
      setSimulationStatus(res.data);
      toast.success('Simulation started: 5 concurrent threads active');
    } catch (err) {
      toast.error('Failed to start simulation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setLoading(true);
      const res = await apiPauseSim();
      setSimulationStatus(res.data);
      toast('Simulation paused', { icon: '⏸️' });
    } catch (err) {
      toast.error('Failed to pause simulation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    try {
      setLoading(true);
      const res = await apiResumeSim();
      setSimulationStatus(res.data);
      toast.success('Simulation resumed');
    } catch (err) {
      toast.error('Failed to resume simulation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    try {
      setLoading(true);
      const res = await apiStopSim();
      setSimulationStatus(res.data);
      toast('Simulation stopped', { icon: '⏹️' });
    } catch (err) {
      toast.error('Failed to stop simulation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setLoading(true);
      const res = await apiResetSim();
      setSimulationStatus(res.data);
      toast.success('Simulation reset to baseline state');
      await fetchStatus();
    } catch (err) {
      toast.error('Failed to reset simulation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetSpeed = async (multiplier) => {
    try {
      const res = await apiSetSpeed(multiplier);
      setSimulationStatus(res.data);
      toast.success(`Simulation speed adjusted to ${multiplier}x`);
    } catch (err) {
      toast.error('Failed to change speed: ' + err.message);
    }
  };

  return (
    <SimulationContext.Provider value={{
      simulationStatus,
      trafficOverview,
      isBackendOnline,
      loading,
      refreshData: fetchStatus,
      startSimulation: handleStart,
      pauseSimulation: handlePause,
      resumeSimulation: handleResume,
      stopSimulation: handleStop,
      resetSimulation: handleReset,
      setSpeed: handleSetSpeed
    }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  return useContext(SimulationContext);
}
