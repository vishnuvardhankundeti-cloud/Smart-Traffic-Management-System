package com.traffic.controller;

import com.traffic.dto.ApiResponse;
import com.traffic.dto.TrafficSignalDto;
import com.traffic.service.TrafficSignalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/signals")
@CrossOrigin
public class TrafficSignalController {

    private final TrafficSignalService trafficSignalService;

    public TrafficSignalController(TrafficSignalService trafficSignalService) {
        this.trafficSignalService = trafficSignalService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TrafficSignalDto>>> getAllSignals() {
        List<TrafficSignalDto> signals = trafficSignalService.getAllSignals();
        return ResponseEntity.ok(ApiResponse.success("Traffic signals retrieved", signals));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TrafficSignalDto>> getSignalById(@PathVariable Long id) {
        TrafficSignalDto signal = trafficSignalService.getSignalById(id);
        return ResponseEntity.ok(ApiResponse.success("Traffic signal found", signal));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TrafficSignalDto>> createSignal(@Valid @RequestBody TrafficSignalDto dto) {
        TrafficSignalDto created = trafficSignalService.createSignal(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Traffic signal configured", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TrafficSignalDto>> updateSignal(
            @PathVariable Long id,
            @Valid @RequestBody TrafficSignalDto dto) {
        TrafficSignalDto updated = trafficSignalService.updateSignal(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Traffic signal updated", updated));
    }

    @PostMapping("/{id}/cycle")
    public ResponseEntity<ApiResponse<TrafficSignalDto>> cycleSignal(@PathVariable Long id) {
        TrafficSignalDto cycled = trafficSignalService.cycleSignalManually(id);
        return ResponseEntity.ok(ApiResponse.success("Signal manually transitioned to next state", cycled));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<TrafficSignalDto>>> getSignalHistory() {
        List<TrafficSignalDto> signals = trafficSignalService.getAllSignals();
        return ResponseEntity.ok(ApiResponse.success("Signal state snapshots retrieved", signals));
    }
}
