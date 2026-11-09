package com.traffic.dto;

import java.util.List;
import java.util.Map;

public class TrafficOverviewDto {
    private long totalVehicles;
    private long activeRoads;
    private double averageTrafficDensity;
    private long congestedRoadsCount;
    private long activeEmergencyVehicles;
    private long operationalSignalsCount;

    private List<RoadDto> liveRoads;
    private Map<String, Long> vehicleTypeDistribution;
    private Map<String, Long> roadStatusCounts;

    public TrafficOverviewDto() {}

    public long getTotalVehicles() { return totalVehicles; }
    public void setTotalVehicles(long totalVehicles) { this.totalVehicles = totalVehicles; }

    public long getActiveRoads() { return activeRoads; }
    public void setActiveRoads(long activeRoads) { this.activeRoads = activeRoads; }

    public double getAverageTrafficDensity() { return averageTrafficDensity; }
    public void setAverageTrafficDensity(double averageTrafficDensity) { this.averageTrafficDensity = averageTrafficDensity; }

    public long getCongestedRoadsCount() { return congestedRoadsCount; }
    public void setCongestedRoadsCount(long congestedRoadsCount) { this.congestedRoadsCount = congestedRoadsCount; }

    public long getActiveEmergencyVehicles() { return activeEmergencyVehicles; }
    public void setActiveEmergencyVehicles(long activeEmergencyVehicles) { this.activeEmergencyVehicles = activeEmergencyVehicles; }

    public long getOperationalSignalsCount() { return operationalSignalsCount; }
    public void setOperationalSignalsCount(long operationalSignalsCount) { this.operationalSignalsCount = operationalSignalsCount; }

    public List<RoadDto> getLiveRoads() { return liveRoads; }
    public void setLiveRoads(List<RoadDto> liveRoads) { this.liveRoads = liveRoads; }

    public Map<String, Long> getVehicleTypeDistribution() { return vehicleTypeDistribution; }
    public void setVehicleTypeDistribution(Map<String, Long> vehicleTypeDistribution) { this.vehicleTypeDistribution = vehicleTypeDistribution; }

    public Map<String, Long> getRoadStatusCounts() { return roadStatusCounts; }
    public void setRoadStatusCounts(Map<String, Long> roadStatusCounts) { this.roadStatusCounts = roadStatusCounts; }
}
