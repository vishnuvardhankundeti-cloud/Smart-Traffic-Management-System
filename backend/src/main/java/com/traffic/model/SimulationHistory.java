package com.traffic.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "simulation_history")
public class SimulationHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime snapshotTime = LocalDateTime.now();

    private Integer totalVehicles = 0;
    private Integer activeRoads = 0;
    private Double averageTrafficDensity = 0.0;
    private Integer congestedRoadsCount = 0;
    private Integer emergencyVehiclesActive = 0;
    private Integer vehiclesProcessed = 0;
    private Double averageSpeed = 0.0;

    public SimulationHistory() {}

    public SimulationHistory(Integer totalVehicles, Integer activeRoads, Double averageTrafficDensity,
                             Integer congestedRoadsCount, Integer emergencyVehiclesActive,
                             Integer vehiclesProcessed, Double averageSpeed) {
        this.snapshotTime = LocalDateTime.now();
        this.totalVehicles = totalVehicles;
        this.activeRoads = activeRoads;
        this.averageTrafficDensity = averageTrafficDensity;
        this.congestedRoadsCount = congestedRoadsCount;
        this.emergencyVehiclesActive = emergencyVehiclesActive;
        this.vehiclesProcessed = vehiclesProcessed;
        this.averageSpeed = averageSpeed;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getSnapshotTime() {
        return snapshotTime;
    }

    public void setSnapshotTime(LocalDateTime snapshotTime) {
        this.snapshotTime = snapshotTime;
    }

    public Integer getTotalVehicles() {
        return totalVehicles;
    }

    public void setTotalVehicles(Integer totalVehicles) {
        this.totalVehicles = totalVehicles;
    }

    public Integer getActiveRoads() {
        return activeRoads;
    }

    public void setActiveRoads(Integer activeRoads) {
        this.activeRoads = activeRoads;
    }

    public Double getAverageTrafficDensity() {
        return averageTrafficDensity;
    }

    public void setAverageTrafficDensity(Double averageTrafficDensity) {
        this.averageTrafficDensity = averageTrafficDensity;
    }

    public Integer getCongestedRoadsCount() {
        return congestedRoadsCount;
    }

    public void setCongestedRoadsCount(Integer congestedRoadsCount) {
        this.congestedRoadsCount = congestedRoadsCount;
    }

    public Integer getEmergencyVehiclesActive() {
        return emergencyVehiclesActive;
    }

    public void setEmergencyVehiclesActive(Integer emergencyVehiclesActive) {
        this.emergencyVehiclesActive = emergencyVehiclesActive;
    }

    public Integer getVehiclesProcessed() {
        return vehiclesProcessed;
    }

    public void setVehiclesProcessed(Integer vehiclesProcessed) {
        this.vehiclesProcessed = vehiclesProcessed;
    }

    public Double getAverageSpeed() {
        return averageSpeed;
    }

    public void setAverageSpeed(Double averageSpeed) {
        this.averageSpeed = averageSpeed;
    }
}
