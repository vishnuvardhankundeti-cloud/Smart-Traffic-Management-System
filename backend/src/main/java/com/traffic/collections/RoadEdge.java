package com.traffic.collections;

import com.traffic.model.Intersection;
import com.traffic.model.Road;

public class RoadEdge {
    private final Road road;
    private final Intersection source;
    private final Intersection destination;
    private final double distanceKm;
    private final double speedLimit;

    public RoadEdge(Road road, Intersection source, Intersection destination) {
        this.road = road;
        this.source = source;
        this.destination = destination;
        this.distanceKm = road.getDistanceKm();
        this.speedLimit = road.getSpeedLimit() != null ? road.getSpeedLimit() : 50.0;
    }

    public Road getRoad() {
        return road;
    }

    public Intersection getSource() {
        return source;
    }

    public Intersection getDestination() {
        return destination;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public double getSpeedLimit() {
        return speedLimit;
    }

    public double getDynamicTravelTimeMinutes() {
        double currentSpeed = road.getAverageSpeed() != null && road.getAverageSpeed() > 1.0 
                ? road.getAverageSpeed() 
                : 10.0;
        return (distanceKm / currentSpeed) * 60.0;
    }

    public double getCongestionWeight() {
        double density = road.getTrafficDensity() != null ? road.getTrafficDensity() : 0.0;
        // Exponential penalty for severe congestion (>70%)
        double penaltyFactor = 1.0 + (density / 20.0);
        if (density > 80.0) {
            penaltyFactor *= 2.0;
        }
        return distanceKm * penaltyFactor;
    }
}
