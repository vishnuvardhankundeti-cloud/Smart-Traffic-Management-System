package com.traffic.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String registrationNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehicleType vehicleType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VehiclePriority priority;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_road_id")
    private Road currentRoad;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_road_id")
    private Road destinationRoad;

    private Double speed = 45.0; // km/h

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, WAITING, MOVING, COMPLETED, EMERGENCY_TRANSIT

    @Column(nullable = false)
    private LocalDateTime entryTime = LocalDateTime.now();

    private LocalDateTime lastUpdated = LocalDateTime.now();

    public Vehicle() {}

    public Vehicle(Long id, String registrationNumber, VehicleType vehicleType, VehiclePriority priority,
                   Road currentRoad, Road destinationRoad, Double speed, String status) {
        this.id = id;
        this.registrationNumber = registrationNumber;
        this.vehicleType = vehicleType;
        this.priority = priority != null ? priority : getDefaultPriority(vehicleType);
        this.currentRoad = currentRoad;
        this.destinationRoad = destinationRoad;
        this.speed = speed != null ? speed : 45.0;
        this.status = status != null ? status : "ACTIVE";
        this.entryTime = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }

    public static VehiclePriority getDefaultPriority(VehicleType type) {
        if (type == null) return VehiclePriority.NORMAL;
        return switch (type) {
            case AMBULANCE -> VehiclePriority.EMERGENCY_HIGH;
            case FIRE_ENGINE -> VehiclePriority.EMERGENCY_MEDIUM;
            case POLICE_VEHICLE -> VehiclePriority.EMERGENCY_LOW;
            case BUS -> VehiclePriority.HIGH;
            case TRUCK -> VehiclePriority.LOW;
            default -> VehiclePriority.NORMAL;
        };
    }

    public boolean isEmergency() {
        return vehicleType != null && vehicleType.isEmergency();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(VehicleType vehicleType) {
        this.vehicleType = vehicleType;
    }

    public VehiclePriority getPriority() {
        return priority;
    }

    public void setPriority(VehiclePriority priority) {
        this.priority = priority;
    }

    public Road getCurrentRoad() {
        return currentRoad;
    }

    public void setCurrentRoad(Road currentRoad) {
        this.currentRoad = currentRoad;
    }

    public Road getDestinationRoad() {
        return destinationRoad;
    }

    public void setDestinationRoad(Road destinationRoad) {
        this.destinationRoad = destinationRoad;
    }

    public Double getSpeed() {
        return speed;
    }

    public void setSpeed(Double speed) {
        this.speed = speed;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getEntryTime() {
        return entryTime;
    }

    public void setEntryTime(LocalDateTime entryTime) {
        this.entryTime = entryTime;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
