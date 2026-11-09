package com.traffic.dto;

import com.traffic.model.SignalState;
import jakarta.validation.constraints.NotNull;

public class TrafficSignalDto {
    private Long id;

    @NotNull(message = "Intersection ID is required")
    private Long intersectionId;
    private String intersectionName;
    private String connectedRoads;

    private SignalState currentSignalState;
    private Integer greenDurationSeconds;
    private Integer yellowDurationSeconds;
    private Integer redDurationSeconds;
    private Integer cycleRemainingSeconds;
    private String operationalStatus;
    private String mode;
    private String lastStateChange;

    public TrafficSignalDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIntersectionId() {
        return intersectionId;
    }

    public void setIntersectionId(Long intersectionId) {
        this.intersectionId = intersectionId;
    }

    public String getIntersectionName() {
        return intersectionName;
    }

    public void setIntersectionName(String intersectionName) {
        this.intersectionName = intersectionName;
    }

    public String getConnectedRoads() {
        return connectedRoads;
    }

    public void setConnectedRoads(String connectedRoads) {
        this.connectedRoads = connectedRoads;
    }

    public SignalState getCurrentSignalState() {
        return currentSignalState;
    }

    public void setCurrentSignalState(SignalState currentSignalState) {
        this.currentSignalState = currentSignalState;
    }

    public Integer getGreenDurationSeconds() {
        return greenDurationSeconds;
    }

    public void setGreenDurationSeconds(Integer greenDurationSeconds) {
        this.greenDurationSeconds = greenDurationSeconds;
    }

    public Integer getYellowDurationSeconds() {
        return yellowDurationSeconds;
    }

    public void setYellowDurationSeconds(Integer yellowDurationSeconds) {
        this.yellowDurationSeconds = yellowDurationSeconds;
    }

    public Integer getRedDurationSeconds() {
        return redDurationSeconds;
    }

    public void setRedDurationSeconds(Integer redDurationSeconds) {
        this.redDurationSeconds = redDurationSeconds;
    }

    public Integer getCycleRemainingSeconds() {
        return cycleRemainingSeconds;
    }

    public void setCycleRemainingSeconds(Integer cycleRemainingSeconds) {
        this.cycleRemainingSeconds = cycleRemainingSeconds;
    }

    public String getOperationalStatus() {
        return operationalStatus;
    }

    public void setOperationalStatus(String operationalStatus) {
        this.operationalStatus = operationalStatus;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public String getLastStateChange() {
        return lastStateChange;
    }

    public void setLastStateChange(String lastStateChange) {
        this.lastStateChange = lastStateChange;
    }
}
