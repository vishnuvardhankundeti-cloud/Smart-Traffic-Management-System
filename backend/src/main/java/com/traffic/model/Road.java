package com.traffic.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "roads")
public class Road {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String roadName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "start_intersection_id", nullable = false)
    private Intersection startIntersection;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "end_intersection_id", nullable = false)
    private Intersection endIntersection;

    @Column(nullable = false)
    private Double distanceKm;

    @Column(nullable = false)
    private Integer maxCapacity;

    @Column(nullable = false)
    private Integer currentVehicleCount = 0;

    @Column(nullable = false)
    private Double trafficDensity = 0.0; // percentage 0 - 100%

    @Column(nullable = false)
    private Double averageSpeed = 50.0; // km/h

    @Column(nullable = false)
    private String roadStatus = "LOW"; // LOW, MODERATE, HEAVY, CONGESTED

    private Integer speedLimit = 60; // km/h

    private LocalDateTime lastUpdated = LocalDateTime.now();

    public Road() {}

    public Road(Long id, String roadName, Intersection startIntersection, Intersection endIntersection,
                Double distanceKm, Integer maxCapacity, Integer currentVehicleCount, Integer speedLimit) {
        this.id = id;
        this.roadName = roadName;
        this.startIntersection = startIntersection;
        this.endIntersection = endIntersection;
        this.distanceKm = distanceKm;
        this.maxCapacity = maxCapacity;
        this.currentVehicleCount = currentVehicleCount;
        this.speedLimit = speedLimit;
        this.recalculateTrafficMetrics();
    }

    public void recalculateTrafficMetrics() {
        if (maxCapacity != null && maxCapacity > 0) {
            double density = ((double) currentVehicleCount / maxCapacity) * 100.0;
            this.trafficDensity = Math.round(density * 10.0) / 10.0;
        } else {
            this.trafficDensity = 0.0;
        }

        if (this.trafficDensity < 35.0) {
            this.roadStatus = "LOW";
            this.averageSpeed = speedLimit != null ? (double) speedLimit : 50.0;
        } else if (this.trafficDensity < 65.0) {
            this.roadStatus = "MODERATE";
            this.averageSpeed = Math.max(25.0, (speedLimit != null ? speedLimit : 50.0) * 0.75);
        } else if (this.trafficDensity < 85.0) {
            this.roadStatus = "HEAVY";
            this.averageSpeed = Math.max(15.0, (speedLimit != null ? speedLimit : 50.0) * 0.45);
        } else {
            this.roadStatus = "CONGESTED";
            this.averageSpeed = Math.max(5.0, (speedLimit != null ? speedLimit : 50.0) * 0.20);
        }

        this.lastUpdated = LocalDateTime.now();
    }

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

    public Intersection getStartIntersection() {
        return startIntersection;
    }

    public void setStartIntersection(Intersection startIntersection) {
        this.startIntersection = startIntersection;
    }

    public Intersection getEndIntersection() {
        return endIntersection;
    }

    public void setEndIntersection(Intersection endIntersection) {
        this.endIntersection = endIntersection;
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
        this.recalculateTrafficMetrics();
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

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
