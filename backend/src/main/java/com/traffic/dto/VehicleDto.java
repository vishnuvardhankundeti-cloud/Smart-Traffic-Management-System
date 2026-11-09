package com.traffic.dto;

import com.traffic.model.VehiclePriority;
import com.traffic.model.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class VehicleDto {
    private Long id;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotNull(message = "Vehicle type is required")
    private VehicleType vehicleType;

    private VehiclePriority priority;
    private Long currentRoadId;
    private String currentRoadName;
    private Long destinationRoadId;
    private String destinationRoadName;
    private Double speed;
    private String status;
    private String entryTime;

    public VehicleDto() {}

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

    public Long getCurrentRoadId() {
        return currentRoadId;
    }

    public void setCurrentRoadId(Long currentRoadId) {
        this.currentRoadId = currentRoadId;
    }

    public String getCurrentRoadName() {
        return currentRoadName;
    }

    public void setCurrentRoadName(String currentRoadName) {
        this.currentRoadName = currentRoadName;
    }

    public Long getDestinationRoadId() {
        return destinationRoadId;
    }

    public void setDestinationRoadId(Long destinationRoadId) {
        this.destinationRoadId = destinationRoadId;
    }

    public String getDestinationRoadName() {
        return destinationRoadName;
    }

    public void setDestinationRoadName(String destinationRoadName) {
        this.destinationRoadName = destinationRoadName;
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

    public String getEntryTime() {
        return entryTime;
    }

    public void setEntryTime(String entryTime) {
        this.entryTime = entryTime;
    }
}
