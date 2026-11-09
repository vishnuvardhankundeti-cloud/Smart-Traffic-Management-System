package com.traffic.controller;

import com.traffic.dto.ApiResponse;
import com.traffic.dto.VehicleDto;
import com.traffic.service.EmergencyService;
import com.traffic.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emergency")
@CrossOrigin
public class EmergencyController {

    private final EmergencyService emergencyService;
    private final VehicleService vehicleService;

    public EmergencyController(EmergencyService emergencyService,
                               VehicleService vehicleService) {
        this.emergencyService = emergencyService;
        this.vehicleService = vehicleService;
    }

    @GetMapping("/vehicles")
    public ResponseEntity<ApiResponse<List<VehicleDto>>> getEmergencyVehicles() {
        List<VehicleDto> list = vehicleService.getEmergencyVehicles();
        return ResponseEntity.ok(ApiResponse.success("Emergency vehicles retrieved", list));
    }

    @PostMapping("/vehicles")
    public ResponseEntity<ApiResponse<VehicleDto>> dispatchEmergencyVehicle(@Valid @RequestBody VehicleDto dto) {
        VehicleDto dispatched = emergencyService.dispatchEmergencyVehicle(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Emergency vehicle dispatched with high-priority queueing and signal preemption", dispatched));
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<VehicleDto>> resolveEmergency(@PathVariable Long id) {
        VehicleDto resolved = emergencyService.resolveEmergency(id);
        return ResponseEntity.ok(ApiResponse.success("Emergency transit mission marked completed", resolved));
    }

    @GetMapping("/priority-queue")
    public ResponseEntity<ApiResponse<List<VehicleDto>>> getPriorityQueue() {
        List<VehicleDto> queue = emergencyService.getPriorityQueueSnapshot();
        return ResponseEntity.ok(ApiResponse.success("Emergency PriorityQueue extracted in priority-comparator order", queue));
    }
}
