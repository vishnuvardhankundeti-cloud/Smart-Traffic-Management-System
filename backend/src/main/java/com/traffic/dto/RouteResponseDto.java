package com.traffic.dto;

import com.traffic.algorithms.OptimizationCriteria;
import java.util.List;

public class RouteResponseDto {
    private boolean pathFound;
    private Long startIntersectionId;
    private String startIntersectionName;
    private Long destinationIntersectionId;
    private String destinationIntersectionName;
    private OptimizationCriteria criteria;

    // Recommended Best Route
    private List<IntersectionInfo> recommendedPath;
    private List<RoadInfo> recommendedRoads;
    private double totalDistanceKm;
    private double estimatedTravelTimeMinutes;

    // Alternative Route for comparison
    private List<IntersectionInfo> alternativePath;
    private List<RoadInfo> alternativeRoads;
    private double alternativeDistanceKm;
    private double alternativeTravelTimeMinutes;

    public static class IntersectionInfo {
        private Long id;
        private String name;
        private Double latitude;
        private Double longitude;

        public IntersectionInfo(Long id, String name, Double latitude, Double longitude) {
            this.id = id;
            this.name = name;
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public Double getLatitude() { return latitude; }
        public Double getLongitude() { return longitude; }
    }

    public static class RoadInfo {
        private Long id;
        private String name;
        private double distanceKm;
        private double trafficDensity;
        private String status;

        public RoadInfo(Long id, String name, double distanceKm, double trafficDensity, String status) {
            this.id = id;
            this.name = name;
            this.distanceKm = distanceKm;
            this.trafficDensity = trafficDensity;
            this.status = status;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public double getDistanceKm() { return distanceKm; }
        public double getTrafficDensity() { return trafficDensity; }
        public String getStatus() { return status; }
    }

    public RouteResponseDto() {}

    public boolean isPathFound() {
        return pathFound;
    }

    public void setPathFound(boolean pathFound) {
        this.pathFound = pathFound;
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

    public Long getDestinationIntersectionId() {
        return destinationIntersectionId;
    }

    public void setDestinationIntersectionId(Long destinationIntersectionId) {
        this.destinationIntersectionId = destinationIntersectionId;
    }

    public String getDestinationIntersectionName() {
        return destinationIntersectionName;
    }

    public void setDestinationIntersectionName(String destinationIntersectionName) {
        this.destinationIntersectionName = destinationIntersectionName;
    }

    public OptimizationCriteria getCriteria() {
        return criteria;
    }

    public void setCriteria(OptimizationCriteria criteria) {
        this.criteria = criteria;
    }

    public List<IntersectionInfo> getRecommendedPath() {
        return recommendedPath;
    }

    public void setRecommendedPath(List<IntersectionInfo> recommendedPath) {
        this.recommendedPath = recommendedPath;
    }

    public List<RoadInfo> getRecommendedRoads() {
        return recommendedRoads;
    }

    public void setRecommendedRoads(List<RoadInfo> recommendedRoads) {
        this.recommendedRoads = recommendedRoads;
    }

    public double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public void setTotalDistanceKm(double totalDistanceKm) {
        this.totalDistanceKm = totalDistanceKm;
    }

    public double getEstimatedTravelTimeMinutes() {
        return estimatedTravelTimeMinutes;
    }

    public void setEstimatedTravelTimeMinutes(double estimatedTravelTimeMinutes) {
        this.estimatedTravelTimeMinutes = estimatedTravelTimeMinutes;
    }

    public List<IntersectionInfo> getAlternativePath() {
        return alternativePath;
    }

    public void setAlternativePath(List<IntersectionInfo> alternativePath) {
        this.alternativePath = alternativePath;
    }

    public List<RoadInfo> getAlternativeRoads() {
        return alternativeRoads;
    }

    public void setAlternativeRoads(List<RoadInfo> alternativeRoads) {
        this.alternativeRoads = alternativeRoads;
    }

    public double getAlternativeDistanceKm() {
        return alternativeDistanceKm;
    }

    public void setAlternativeDistanceKm(double alternativeDistanceKm) {
        this.alternativeDistanceKm = alternativeDistanceKm;
    }

    public double getAlternativeTravelTimeMinutes() {
        return alternativeTravelTimeMinutes;
    }

    public void setAlternativeTravelTimeMinutes(double alternativeTravelTimeMinutes) {
        this.alternativeTravelTimeMinutes = alternativeTravelTimeMinutes;
    }
}
