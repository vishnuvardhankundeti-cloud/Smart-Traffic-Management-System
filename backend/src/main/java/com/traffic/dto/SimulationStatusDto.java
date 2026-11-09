package com.traffic.dto;

import com.traffic.simulation.SimulationLog;
import com.traffic.simulation.SimulationState;
import java.util.List;

public class SimulationStatusDto {
    private SimulationState state;
    private long runtimeSeconds;
    private int speedMultiplier;
    private int activeThreads;
    private int vehiclesGenerated;
    private int vehiclesProcessed;
    private int currentQueueSize;
    private double currentAvgDensity;
    private List<SimulationLog> recentLogs;

    public SimulationStatusDto() {}

    public SimulationState getState() { return state; }
    public void setState(SimulationState state) { this.state = state; }

    public long getRuntimeSeconds() { return runtimeSeconds; }
    public void setRuntimeSeconds(long runtimeSeconds) { this.runtimeSeconds = runtimeSeconds; }

    public int getSpeedMultiplier() { return speedMultiplier; }
    public void setSpeedMultiplier(int speedMultiplier) { this.speedMultiplier = speedMultiplier; }

    public int getActiveThreads() { return activeThreads; }
    public void setActiveThreads(int activeThreads) { this.activeThreads = activeThreads; }

    public int getVehiclesGenerated() { return vehiclesGenerated; }
    public void setVehiclesGenerated(int vehiclesGenerated) { this.vehiclesGenerated = vehiclesGenerated; }

    public int getVehiclesProcessed() { return vehiclesProcessed; }
    public void setVehiclesProcessed(int vehiclesProcessed) { this.vehiclesProcessed = vehiclesProcessed; }

    public int getCurrentQueueSize() { return currentQueueSize; }
    public void setCurrentQueueSize(int currentQueueSize) { this.currentQueueSize = currentQueueSize; }

    public double getCurrentAvgDensity() { return currentAvgDensity; }
    public void setCurrentAvgDensity(double currentAvgDensity) { this.currentAvgDensity = currentAvgDensity; }

    public List<SimulationLog> getRecentLogs() { return recentLogs; }
    public void setRecentLogs(List<SimulationLog> recentLogs) { this.recentLogs = recentLogs; }
}
