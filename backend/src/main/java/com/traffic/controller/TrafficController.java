package com.traffic.controller;

import com.traffic.dto.ApiResponse;
import com.traffic.dto.RoadDto;
import com.traffic.dto.TrafficOverviewDto;
import com.traffic.service.RoadService;
import com.traffic.service.TrafficMonitoringService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/traffic")
@CrossOrigin
public class TrafficController {

    private final TrafficMonitoringService trafficMonitoringService;
    private final RoadService roadService;

    public TrafficController(TrafficMonitoringService trafficMonitoringService,
                             RoadService roadService) {
        this.trafficMonitoringService = trafficMonitoringService;
        this.roadService = roadService;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<TrafficOverviewDto>> getTrafficOverview() {
        TrafficOverviewDto overview = trafficMonitoringService.getTrafficOverview();
        return ResponseEntity.ok(ApiResponse.success("Traffic overview retrieved", overview));
    }

    @GetMapping("/density")
    public ResponseEntity<ApiResponse<Map<String, Double>>> getTrafficDensity() {
        List<RoadDto> roads = roadService.getAllRoads(null);
        Map<String, Double> densityMap = roads.stream()
                .collect(Collectors.toMap(RoadDto::getRoadName, RoadDto::getTrafficDensity, (k1, k2) -> k1));
        return ResponseEntity.ok(ApiResponse.success("Road density map retrieved", densityMap));
    }

    @GetMapping("/congested-roads")
    public ResponseEntity<ApiResponse<List<RoadDto>>> getCongestedRoads() {
        List<RoadDto> congested = roadService.getCongestedRoads();
        return ResponseEntity.ok(ApiResponse.success("Congested roads retrieved", congested));
    }

    @GetMapping("/road-status")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getRoadStatusDistribution() {
        TrafficOverviewDto overview = trafficMonitoringService.getTrafficOverview();
        return ResponseEntity.ok(ApiResponse.success("Road status breakdown retrieved", overview.getRoadStatusCounts()));
    }
}
