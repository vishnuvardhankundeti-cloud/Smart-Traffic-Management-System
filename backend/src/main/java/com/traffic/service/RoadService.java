package com.traffic.service;

import com.traffic.collections.RoadNetworkGraph;
import com.traffic.dto.RoadDto;
import com.traffic.exception.ResourceNotFoundException;
import com.traffic.model.Intersection;
import com.traffic.model.Road;
import com.traffic.repository.IntersectionRepository;
import com.traffic.repository.RoadRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoadService {

    private final RoadRepository roadRepository;
    private final IntersectionRepository intersectionRepository;
    private final RoadNetworkGraph roadNetworkGraph;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public RoadService(RoadRepository roadRepository,
                       IntersectionRepository intersectionRepository,
                       RoadNetworkGraph roadNetworkGraph) {
        this.roadRepository = roadRepository;
        this.intersectionRepository = intersectionRepository;
        this.roadNetworkGraph = roadNetworkGraph;
    }

    /**
     * Demonstrates Java Stream API:
     * - Filtering by road congestion status
     * - Mapping entities to DTOs
     */
    public List<RoadDto> getAllRoads(String statusFilter) {
        return roadRepository.findAll().stream()
                .filter(r -> statusFilter == null || statusFilter.isBlank() || r.getRoadStatus().equalsIgnoreCase(statusFilter))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public RoadDto getRoadById(Long id) {
        Road road = roadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Road with ID " + id + " not found"));
        return toDto(road);
    }

    @Transactional
    public RoadDto createRoad(RoadDto dto) {
        Intersection start = intersectionRepository.findById(dto.getStartIntersectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Start intersection ID " + dto.getStartIntersectionId() + " not found"));
        Intersection end = intersectionRepository.findById(dto.getEndIntersectionId())
                .orElseThrow(() -> new ResourceNotFoundException("End intersection ID " + dto.getEndIntersectionId() + " not found"));

        Road road = new Road();
        road.setRoadName(dto.getRoadName().trim());
        road.setStartIntersection(start);
        road.setEndIntersection(end);
        road.setDistanceKm(dto.getDistanceKm());
        road.setMaxCapacity(dto.getMaxCapacity());
        road.setCurrentVehicleCount(dto.getCurrentVehicleCount() != null ? dto.getCurrentVehicleCount() : 0);
        road.setSpeedLimit(dto.getSpeedLimit() != null ? dto.getSpeedLimit() : 60);
        road.recalculateTrafficMetrics();

        Road saved = roadRepository.save(road);
        roadNetworkGraph.addRoad(saved);
        return toDto(saved);
    }

    @Transactional
    public RoadDto updateRoad(Long id, RoadDto dto) {
        Road road = roadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Road with ID " + id + " not found"));

        if (dto.getStartIntersectionId() != null) {
            Intersection start = intersectionRepository.findById(dto.getStartIntersectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Start intersection ID " + dto.getStartIntersectionId() + " not found"));
            road.setStartIntersection(start);
        }

        if (dto.getEndIntersectionId() != null) {
            Intersection end = intersectionRepository.findById(dto.getEndIntersectionId())
                    .orElseThrow(() -> new ResourceNotFoundException("End intersection ID " + dto.getEndIntersectionId() + " not found"));
            road.setEndIntersection(end);
        }

        road.setRoadName(dto.getRoadName().trim());
        road.setDistanceKm(dto.getDistanceKm());
        road.setMaxCapacity(dto.getMaxCapacity());
        if (dto.getCurrentVehicleCount() != null) {
            road.setCurrentVehicleCount(dto.getCurrentVehicleCount());
        }
        if (dto.getSpeedLimit() != null) {
            road.setSpeedLimit(dto.getSpeedLimit());
        }
        road.recalculateTrafficMetrics();

        Road updated = roadRepository.save(road);
        roadNetworkGraph.rebuild(intersectionRepository.findAll(), roadRepository.findAll());
        return toDto(updated);
    }

    @Transactional
    public void deleteRoad(Long id) {
        Road road = roadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Road with ID " + id + " not found"));
        roadRepository.delete(road);
        roadNetworkGraph.rebuild(intersectionRepository.findAll(), roadRepository.findAll());
    }

    public List<RoadDto> getCongestedRoads() {
        return roadRepository.findAll().stream()
                .filter(r -> r.getTrafficDensity() >= 75.0 || "CONGESTED".equalsIgnoreCase(r.getRoadStatus()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public RoadDto toDto(Road r) {
        RoadDto dto = new RoadDto();
        dto.setId(r.getId());
        dto.setRoadName(r.getRoadName());
        if (r.getStartIntersection() != null) {
            dto.setStartIntersectionId(r.getStartIntersection().getId());
            dto.setStartIntersectionName(r.getStartIntersection().getIntersectionName());
        }
        if (r.getEndIntersection() != null) {
            dto.setEndIntersectionId(r.getEndIntersection().getId());
            dto.setEndIntersectionName(r.getEndIntersection().getIntersectionName());
        }
        dto.setDistanceKm(r.getDistanceKm());
        dto.setMaxCapacity(r.getMaxCapacity());
        dto.setCurrentVehicleCount(r.getCurrentVehicleCount());
        dto.setTrafficDensity(r.getTrafficDensity());
        dto.setAverageSpeed(r.getAverageSpeed());
        dto.setRoadStatus(r.getRoadStatus());
        dto.setSpeedLimit(r.getSpeedLimit());
        dto.setLastUpdated(r.getLastUpdated() != null ? r.getLastUpdated().format(FORMATTER) : null);
        return dto;
    }
}
