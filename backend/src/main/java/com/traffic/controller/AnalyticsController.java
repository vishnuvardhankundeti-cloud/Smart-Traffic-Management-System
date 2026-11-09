package com.traffic.controller;

import com.traffic.dto.AnalyticsSummaryDto;
import com.traffic.dto.ApiResponse;
import com.traffic.service.AnalyticsService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AnalyticsSummaryDto>> getAnalyticsSummary() {
        AnalyticsSummaryDto summary = analyticsService.getAnalyticsSummary();
        return ResponseEntity.ok(ApiResponse.success("Analytics summary retrieved", summary));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AnalyticsSummaryDto>> getDashboardAnalytics() {
        AnalyticsSummaryDto summary = analyticsService.getAnalyticsSummary();
        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics retrieved", summary));
    }

    @GetMapping("/vehicle-distribution")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getVehicleDistribution() {
        AnalyticsSummaryDto summary = analyticsService.getAnalyticsSummary();
        return ResponseEntity.ok(ApiResponse.success("Vehicle distribution retrieved", summary.getVehicleDistribution()));
    }

    @GetMapping("/traffic-density")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTrafficDensityTrends() {
        AnalyticsSummaryDto summary = analyticsService.getAnalyticsSummary();
        return ResponseEntity.ok(ApiResponse.success("Traffic density trends retrieved", summary.getDensityTrends()));
    }

    @GetMapping("/road-performance")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRoadPerformance() {
        AnalyticsSummaryDto summary = analyticsService.getAnalyticsSummary();
        return ResponseEntity.ok(ApiResponse.success("Road performance metrics retrieved", summary.getRoadPerformance()));
    }

    @GetMapping("/congestion")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getCongestionBreakdown() {
        AnalyticsSummaryDto summary = analyticsService.getAnalyticsSummary();
        return ResponseEntity.ok(ApiResponse.success("Congestion breakdown retrieved", summary.getCongestionDistribution()));
    }

    @GetMapping("/export/vehicles")
    public ResponseEntity<InputStreamResource> exportVehiclesCsv() {
        ByteArrayInputStream in = analyticsService.exportVehiclesCsv();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=stms-vehicles-report.csv");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/export/roads")
    public ResponseEntity<InputStreamResource> exportRoadsCsv() {
        ByteArrayInputStream in = analyticsService.exportRoadsCsv();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=stms-roads-report.csv");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(new InputStreamResource(in));
    }
}
