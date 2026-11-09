package com.traffic.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String routeName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "start_intersection_id", nullable = false)
    private Intersection startIntersection;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "end_intersection_id", nullable = false)
    private Intersection endIntersection;

    @Column(nullable = false)
    private Double totalDistanceKm;

    @Column(nullable = false)
    private Double estimatedTravelTimeMinutes;

    @Column(length = 1000)
    private String pathNodeIds; // e.g. "1 -> 4 -> 6 -> 9"

    @Column(length = 2000)
    private String pathRoadNames; // e.g. "Broadway -> 5th Ave -> Park Rd"

    private String optimizationType; // SHORTEST_DISTANCE, LOWEST_TRAFFIC, MIN_TRAVEL_TIME

    private LocalDateTime calculatedAt = LocalDateTime.now();

    public Route() {}

    public Route(Long id, String routeName, Intersection startIntersection, Intersection endIntersection,
                 Double totalDistanceKm, Double estimatedTravelTimeMinutes, String pathNodeIds,
                 String pathRoadNames, String optimizationType) {
        this.id = id;
        this.routeName = routeName;
        this.startIntersection = startIntersection;
        this.endIntersection = endIntersection;
        this.totalDistanceKm = totalDistanceKm;
        this.estimatedTravelTimeMinutes = estimatedTravelTimeMinutes;
        this.pathNodeIds = pathNodeIds;
        this.pathRoadNames = pathRoadNames;
        this.optimizationType = optimizationType;
        this.calculatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRouteName() {
        return routeName;
    }

    public void setRouteName(String routeName) {
        this.routeName = routeName;
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

    public Double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(Double totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }

    public Double getEstimatedTravelTimeMinutes() {
        return estimatedTravelTimeMinutes;
    }

    public void setEstimatedTravelTimeMinutes(Double estimatedTravelTimeMinutes) {
        this.estimatedTravelTimeMinutes = estimatedTravelTimeMinutes;
    }

    public String getPathNodeIds() {
        return pathNodeIds;
    }

    public void setPathNodeIds(String pathNodeIds) {
        this.pathNodeIds = pathNodeIds;
    }

    public String getPathRoadNames() {
        return pathRoadNames;
    }

    public void setPathRoadNames(String pathRoadNames) {
        this.pathRoadNames = pathRoadNames;
    }

    public String getOptimizationType() {
        return optimizationType;
    }

    public void setOptimizationType(String optimizationType) {
        this.optimizationType = optimizationType;
    }

    public LocalDateTime getCalculatedAt() {
        return calculatedAt;
    }

    public void setCalculatedAt(LocalDateTime calculatedAt) {
        this.calculatedAt = calculatedAt;
    }
}
