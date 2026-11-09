package com.traffic.service;

import com.traffic.algorithms.DijkstraShortestPath;
import com.traffic.algorithms.OptimizationCriteria;
import com.traffic.dto.RouteRequestDto;
import com.traffic.dto.RouteResponseDto;
import com.traffic.exception.ResourceNotFoundException;
import com.traffic.model.Intersection;
import com.traffic.model.Road;
import com.traffic.model.Route;
import com.traffic.repository.IntersectionRepository;
import com.traffic.repository.RouteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RouteService {

    private final DijkstraShortestPath dijkstraShortestPath;
    private final IntersectionRepository intersectionRepository;
    private final RouteRepository routeRepository;

    public RouteService(DijkstraShortestPath dijkstraShortestPath,
                        IntersectionRepository intersectionRepository,
                        RouteRepository routeRepository) {
        this.dijkstraShortestPath = dijkstraShortestPath;
        this.intersectionRepository = intersectionRepository;
        this.routeRepository = routeRepository;
    }

    @Transactional
    public RouteResponseDto calculateOptimalRoute(RouteRequestDto request) {
        Intersection start = intersectionRepository.findById(request.getStartIntersectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Start intersection ID " + request.getStartIntersectionId() + " not found"));
        Intersection dest = intersectionRepository.findById(request.getDestinationIntersectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination intersection ID " + request.getDestinationIntersectionId() + " not found"));

        OptimizationCriteria criteria = request.getCriteria() != null ? request.getCriteria() : OptimizationCriteria.SHORTEST_DISTANCE;

        // 1. Calculate Recommended Path using Dijkstra's Algorithm
        DijkstraShortestPath.PathResult primaryResult = dijkstraShortestPath.findOptimalPath(
                request.getStartIntersectionId(), request.getDestinationIntersectionId(), criteria, null);

        RouteResponseDto response = new RouteResponseDto();
        response.setPathFound(primaryResult.isFound());
        response.setStartIntersectionId(start.getId());
        response.setStartIntersectionName(start.getIntersectionName());
        response.setDestinationIntersectionId(dest.getId());
        response.setDestinationIntersectionName(dest.getIntersectionName());
        response.setCriteria(criteria);

        if (!primaryResult.isFound()) {
            return response;
        }

        // Map Recommended Nodes
        List<RouteResponseDto.IntersectionInfo> recommendedNodes = primaryResult.getNodeSequence().stream()
                .map(n -> new RouteResponseDto.IntersectionInfo(n.getId(), n.getIntersectionName(), n.getLatitude(), n.getLongitude()))
                .collect(Collectors.toList());
        response.setRecommendedPath(recommendedNodes);

        // Map Recommended Roads
        List<RouteResponseDto.RoadInfo> recommendedRoads = primaryResult.getRoadSequence().stream()
                .map(r -> new RouteResponseDto.RoadInfo(r.getId(), r.getRoadName(), r.getDistanceKm(), r.getTrafficDensity(), r.getRoadStatus()))
                .collect(Collectors.toList());
        response.setRecommendedRoads(recommendedRoads);
        response.setTotalDistanceKm(primaryResult.getTotalDistanceKm());
        response.setEstimatedTravelTimeMinutes(primaryResult.getEstimatedTravelTimeMinutes());

        // 2. Calculate Alternative Path by temporarily excluding the longest/busiest road on the primary route
        Long excludedRoadId = primaryResult.getRoadSequence().stream()
                .max(Comparator.comparingDouble(Road::getDistanceKm))
                .map(Road::getId)
                .orElse(null);

        if (excludedRoadId != null && primaryResult.getRoadSequence().size() > 1) {
            DijkstraShortestPath.PathResult altResult = dijkstraShortestPath.findOptimalPath(
                    request.getStartIntersectionId(), request.getDestinationIntersectionId(), criteria, excludedRoadId);

            if (altResult.isFound()) {
                List<RouteResponseDto.IntersectionInfo> altNodes = altResult.getNodeSequence().stream()
                        .map(n -> new RouteResponseDto.IntersectionInfo(n.getId(), n.getIntersectionName(), n.getLatitude(), n.getLongitude()))
                        .collect(Collectors.toList());
                response.setAlternativePath(altNodes);

                List<RouteResponseDto.RoadInfo> altRoads = altResult.getRoadSequence().stream()
                        .map(r -> new RouteResponseDto.RoadInfo(r.getId(), r.getRoadName(), r.getDistanceKm(), r.getTrafficDensity(), r.getRoadStatus()))
                        .collect(Collectors.toList());
                response.setAlternativeRoads(altRoads);
                response.setAlternativeDistanceKm(altResult.getTotalDistanceKm());
                response.setAlternativeTravelTimeMinutes(altResult.getEstimatedTravelTimeMinutes());
            }
        }

        // Save route calculation to history
        String nodeIds = primaryResult.getNodeSequence().stream()
                .map(n -> String.valueOf(n.getId()))
                .collect(Collectors.joining(" -> "));
        String roadNames = primaryResult.getRoadSequence().stream()
                .map(Road::getRoadName)
                .collect(Collectors.joining(" -> "));

        Route historyRoute = new Route(
                null,
                start.getIntersectionName() + " to " + dest.getIntersectionName(),
                start,
                dest,
                primaryResult.getTotalDistanceKm(),
                primaryResult.getEstimatedTravelTimeMinutes(),
                nodeIds,
                roadNames,
                criteria.name()
        );
        routeRepository.save(historyRoute);

        return response;
    }

    public List<Route> getRouteHistory() {
        return routeRepository.findTop10ByOrderByCalculatedAtDesc();
    }
}
