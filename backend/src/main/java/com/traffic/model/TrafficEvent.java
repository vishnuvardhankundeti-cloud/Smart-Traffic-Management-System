package com.traffic.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "traffic_events")
public class TrafficEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String eventType; // CONGESTION_ALERT, EMERGENCY_DISPATCH, SIGNAL_CHANGE, SPEED_WARNING, ROUTE_RECALCULATED

    private String roadName;

    @Column(length = 1000, nullable = false)
    private String description;

    @Column(nullable = false)
    private String severity; // INFO, WARNING, CRITICAL

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    public TrafficEvent() {}

    public TrafficEvent(Long id, String eventType, String roadName, String description, String severity) {
        this.id = id;
        this.eventType = eventType;
        this.roadName = roadName;
        this.description = description;
        this.severity = severity;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getRoadName() {
        return roadName;
    }

    public void setRoadName(String roadName) {
        this.roadName = roadName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
