package com.traffic.dto;

import java.util.List;
import java.util.Map;

public class AnalyticsSummaryDto {
    private int totalVehiclesProcessed;
    private double averageWaitingTimeSeconds;
    private String mostCongestedRoad;
    private String busiestIntersection;
    private int emergencyVehiclesProcessed;
    private double averageTrafficDensity;
    private double totalDistanceCoveredKm;

    private List<Map<String, Object>> densityTrends;
    private Map<String, Long> vehicleDistribution;
    private List<Map<String, Object>> roadPerformance;
    private Map<String, Long> congestionDistribution;

    public AnalyticsSummaryDto() {}

    public int getTotalVehiclesProcessed() { return totalVehiclesProcessed; }
    public void setTotalVehiclesProcessed(int totalVehiclesProcessed) { this.totalVehiclesProcessed = totalVehiclesProcessed; }

    public double getAverageWaitingTimeSeconds() { return averageWaitingTimeSeconds; }
    public void setAverageWaitingTimeSeconds(double averageWaitingTimeSeconds) { this.averageWaitingTimeSeconds = averageWaitingTimeSeconds; }

    public String getMostCongestedRoad() { return mostCongestedRoad; }
    public void setMostCongestedRoad(String mostCongestedRoad) { this.mostCongestedRoad = mostCongestedRoad; }

    public String getBusiestIntersection() { return busiestIntersection; }
    public void setBusiestIntersection(String busiestIntersection) { this.busiestIntersection = busiestIntersection; }

    public int getEmergencyVehiclesProcessed() { return emergencyVehiclesProcessed; }
    public void setEmergencyVehiclesProcessed(int emergencyVehiclesProcessed) { this.emergencyVehiclesProcessed = emergencyVehiclesProcessed; }

    public double getAverageTrafficDensity() { return averageTrafficDensity; }
    public void setAverageTrafficDensity(double averageTrafficDensity) { this.averageTrafficDensity = averageTrafficDensity; }

    public double getTotalDistanceCoveredKm() { return totalDistanceCoveredKm; }
    public void setTotalDistanceCoveredKm(double totalDistanceCoveredKm) { this.totalDistanceCoveredKm = totalDistanceCoveredKm; }

    public List<Map<String, Object>> getDensityTrends() { return densityTrends; }
    public void setDensityTrends(List<Map<String, Object>> densityTrends) { this.densityTrends = densityTrends; }

    public Map<String, Long> getVehicleDistribution() { return vehicleDistribution; }
    public void setVehicleDistribution(Map<String, Long> vehicleDistribution) { this.vehicleDistribution = vehicleDistribution; }

    public List<Map<String, Object>> getRoadPerformance() { return roadPerformance; }
    public void setRoadPerformance(List<Map<String, Object>> roadPerformance) { this.roadPerformance = roadPerformance; }

    public Map<String, Long> getCongestionDistribution() { return congestionDistribution; }
    public void setCongestionDistribution(Map<String, Long> congestionDistribution) { this.congestionDistribution = congestionDistribution; }
}
