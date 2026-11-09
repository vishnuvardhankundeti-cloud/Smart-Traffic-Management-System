package com.traffic.dto;

import com.traffic.algorithms.OptimizationCriteria;
import jakarta.validation.constraints.NotNull;

public class RouteRequestDto {
    @NotNull(message = "Start intersection ID is required")
    private Long startIntersectionId;

    @NotNull(message = "Destination intersection ID is required")
    private Long destinationIntersectionId;

    private OptimizationCriteria criteria = OptimizationCriteria.SHORTEST_DISTANCE;

    public RouteRequestDto() {}

    public Long getStartIntersectionId() {
        return startIntersectionId;
    }

    public void setStartIntersectionId(Long startIntersectionId) {
        this.startIntersectionId = startIntersectionId;
    }

    public Long getDestinationIntersectionId() {
        return destinationIntersectionId;
    }

    public void setDestinationIntersectionId(Long destinationIntersectionId) {
        this.destinationIntersectionId = destinationIntersectionId;
    }

    public OptimizationCriteria getCriteria() {
        return criteria;
    }

    public void setCriteria(OptimizationCriteria criteria) {
        this.criteria = criteria;
    }
}
