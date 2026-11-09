package com.traffic.controller;

import com.traffic.dto.ApiResponse;
import com.traffic.dto.RoadDto;
import com.traffic.service.RoadService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roads")
@CrossOrigin
public class RoadController {

    private final RoadService roadService;

    public RoadController(RoadService roadService) {
        this.roadService = roadService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoadDto>>> getAllRoads(
            @RequestParam(required = false) String status) {
        List<RoadDto> roads = roadService.getAllRoads(status);
        return ResponseEntity.ok(ApiResponse.success("Roads retrieved successfully", roads));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoadDto>> getRoadById(@PathVariable Long id) {
        RoadDto road = roadService.getRoadById(id);
        return ResponseEntity.ok(ApiResponse.success("Road found", road));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoadDto>> createRoad(@Valid @RequestBody RoadDto dto) {
        RoadDto created = roadService.createRoad(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Road registered successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoadDto>> updateRoad(
            @PathVariable Long id,
            @Valid @RequestBody RoadDto dto) {
        RoadDto updated = roadService.updateRoad(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Road updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoad(@PathVariable Long id) {
        roadService.deleteRoad(id);
        return ResponseEntity.ok(ApiResponse.success("Road deleted successfully", null));
    }
}
