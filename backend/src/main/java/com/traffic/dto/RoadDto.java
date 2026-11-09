package com.traffic.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class RoadDto {
    private Long id;

    @NotBlank(message = "Road name is required")
    private String roadName;

    @NotNull(message = "Start intersection ID is required")
    private Long startIntersectionId;
    private String startIntersectionName;

    @NotNull(message = "End intersection ID is required")
    private Long endIntersectionId;
    private String endIntersectionName;

    @NotNull(message = "Distance is required")
    @Positive(message = "Distance must be positive")
    private Double distanceKm;

    @NotNull(message = "Max capacity is required")
    @Positive(message = "Capacity must be positive")
    private Integer maxCapacity;

    private Integer currentVehicleCount;
    private Double trafficDensity;
    private Double averageSpeed;
    private String roadStatus;
    private Integer speedLimit;
    private String lastUpdated;

    public RoadDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRoadName() {
        return roadName;
    }

    public void setRoadName(String roadName) {
        this.roadName = roadName;
    }

    public Long getStartIntersectionId() {
        return startIntersectionId;
    }

    public void setStartIntersectionId(Long startIntersectionId) {
        this.startIntersectionId = startIntersectionId;
    }

    public String getStartIntersectionName() {
        return startIntersectionName;
    }

    public void setStartIntersectionName(String startIntersectionName) {
        this.startIntersectionName = startIntersectionName;
    }

    public Long getEndIntersectionId() {
        return endIntersectionId;
    }

    public void setEndIntersectionId(Long endIntersectionId) {
        this.endIntersectionId = endIntersectionId;
    }

    public String getEndIntersectionName() {
        return endIntersectionName;
    }

    public void setEndIntersectionName(String endIntersectionName) {
        this.endIntersectionName = endIntersectionName;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Integer getMaxCapacity() {
        return maxCapacity;
    }

    public void setMaxCapacity(Integer maxCapacity) {
        this.maxCapacity = maxCapacity;
    }

    public Integer getCurrentVehicleCount() {
        return currentVehicleCount;
    }

    public void setCurrentVehicleCount(Integer currentVehicleCount) {
        this.currentVehicleCount = currentVehicleCount;
    }

    public Double getTrafficDensity() {
        return trafficDensity;
    }

    public void setTrafficDensity(Double trafficDensity) {
        this.trafficDensity = trafficDensity;
    }

    public Double getAverageSpeed() {
        return averageSpeed;
    }

    public void setAverageSpeed(Double averageSpeed) {
        this.averageSpeed = averageSpeed;
    }

    public String getRoadStatus() {
        return roadStatus;
    }

    public void setRoadStatus(String roadStatus) {
        this.roadStatus = roadStatus;
    }

    public Integer getSpeedLimit() {
        return speedLimit;
    }

    public void setSpeedLimit(Integer speedLimit) {
        this.speedLimit = speedLimit;
    }

    public String getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(String lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
