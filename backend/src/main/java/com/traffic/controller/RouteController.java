package com.traffic.controller;

import com.traffic.dto.ApiResponse;
import com.traffic.dto.RouteRequestDto;
import com.traffic.dto.RouteResponseDto;
import com.traffic.model.Route;
import com.traffic.service.RouteService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routes")
@CrossOrigin
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @PostMapping("/shortest-path")
    public ResponseEntity<ApiResponse<RouteResponseDto>> calculateShortestPath(
            @Valid @RequestBody RouteRequestDto request) {
        RouteResponseDto response = routeService.calculateOptimalRoute(request);
        return ResponseEntity.ok(ApiResponse.success("Shortest path computed using Dijkstra's Algorithm", response));
    }

    @PostMapping("/optimize")
    public ResponseEntity<ApiResponse<RouteResponseDto>> optimizeRoute(
            @Valid @RequestBody RouteRequestDto request) {
        RouteResponseDto response = routeService.calculateOptimalRoute(request);
        return ResponseEntity.ok(ApiResponse.success("Route optimized for dynamic conditions", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<Route>>> getRouteHistory() {
        List<Route> history = routeService.getRouteHistory();
        return ResponseEntity.ok(ApiResponse.success("Route history retrieved", history));
    }
}
