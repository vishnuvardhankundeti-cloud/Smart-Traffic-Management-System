package com.traffic.controller;

import com.traffic.dto.ApiResponse;
import com.traffic.dto.SimulationStatusDto;
import com.traffic.simulation.SimulationLog;
import com.traffic.simulation.TrafficSimulationEngine;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/simulation")
@CrossOrigin
public class SimulationController {

    private final TrafficSimulationEngine simulationEngine;

    public SimulationController(TrafficSimulationEngine simulationEngine) {
        this.simulationEngine = simulationEngine;
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<SimulationStatusDto>> startSimulation() {
        simulationEngine.start();
        return ResponseEntity.ok(ApiResponse.success("Simulation started with concurrent threads", simulationEngine.getStatus()));
    }

    @PostMapping("/pause")
    public ResponseEntity<ApiResponse<SimulationStatusDto>> pauseSimulation() {
        simulationEngine.pause();
        return ResponseEntity.ok(ApiResponse.success("Simulation paused", simulationEngine.getStatus()));
    }

    @PostMapping("/resume")
    public ResponseEntity<ApiResponse<SimulationStatusDto>> resumeSimulation() {
        simulationEngine.resume();
        return ResponseEntity.ok(ApiResponse.success("Simulation resumed", simulationEngine.getStatus()));
    }

    @PostMapping("/stop")
    public ResponseEntity<ApiResponse<SimulationStatusDto>> stopSimulation() {
        simulationEngine.stop();
        return ResponseEntity.ok(ApiResponse.success("Simulation stopped", simulationEngine.getStatus()));
    }

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<SimulationStatusDto>> resetSimulation() {
        simulationEngine.resetDemo();
        return ResponseEntity.ok(ApiResponse.success("Simulation reset to baseline state", simulationEngine.getStatus()));
    }

    @PostMapping("/speed/{multiplier}")
    public ResponseEntity<ApiResponse<SimulationStatusDto>> setSimulationSpeed(@PathVariable int multiplier) {
        simulationEngine.setSpeed(multiplier);
        return ResponseEntity.ok(ApiResponse.success("Simulation speed set to " + multiplier + "x", simulationEngine.getStatus()));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<SimulationStatusDto>> getSimulationStatus() {
        return ResponseEntity.ok(ApiResponse.success("Current simulation telemetry", simulationEngine.getStatus()));
    }

    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<List<SimulationLog>>> getSimulationLogs(
            @RequestParam(required = false, defaultValue = "30") int limit) {
        return ResponseEntity.ok(ApiResponse.success("Recent activity logs", simulationEngine.getRecentLogs(limit)));
    }
}
