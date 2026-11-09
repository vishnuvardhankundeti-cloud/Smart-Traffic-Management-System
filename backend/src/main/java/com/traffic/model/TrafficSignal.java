package com.traffic.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "traffic_signals")
public class TrafficSignal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "intersection_id", nullable = false)
    private Intersection intersection;

    private String intersectionName;

    private String connectedRoads;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SignalState currentSignalState = SignalState.RED;

    @Column(nullable = false)
    private Integer greenDurationSeconds = 45;

    @Column(nullable = false)
    private Integer yellowDurationSeconds = 5;

    @Column(nullable = false)
    private Integer redDurationSeconds = 50;

    @Column(nullable = false)
    private Integer cycleRemainingSeconds = 45;

    @Column(nullable = false)
    private String operationalStatus = "OPERATIONAL"; // OPERATIONAL, MAINTENANCE, EMERGENCY_OVERRIDE

    @Column(nullable = false)
    private String mode = "AUTOMATIC"; // AUTOMATIC, MANUAL, EMERGENCY_PREEMPT

    private LocalDateTime lastStateChange = LocalDateTime.now();

    public TrafficSignal() {}

    public TrafficSignal(Long id, Intersection intersection, String intersectionName, String connectedRoads,
                         SignalState currentSignalState, Integer greenDuration, Integer yellowDuration, Integer redDuration) {
        this.id = id;
        this.intersection = intersection;
        this.intersectionName = intersectionName != null ? intersectionName : (intersection != null ? intersection.getIntersectionName() : "Signal");
        this.connectedRoads = connectedRoads;
        this.currentSignalState = currentSignalState != null ? currentSignalState : SignalState.RED;
        this.greenDurationSeconds = greenDuration != null ? greenDuration : 45;
        this.yellowDurationSeconds = yellowDuration != null ? yellowDuration : 5;
        this.redDurationSeconds = redDuration != null ? redDuration : 50;
        this.cycleRemainingSeconds = this.greenDurationSeconds;
        this.lastStateChange = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Intersection getIntersection() {
        return intersection;
    }

    public void setIntersection(Intersection intersection) {
        this.intersection = intersection;
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
        this.lastStateChange = LocalDateTime.now();
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

    public LocalDateTime getLastStateChange() {
        return lastStateChange;
    }

    public void setLastStateChange(LocalDateTime lastStateChange) {
        this.lastStateChange = lastStateChange;
    }
}
