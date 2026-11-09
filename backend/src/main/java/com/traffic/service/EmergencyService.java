package com.traffic.service;

import com.traffic.algorithms.DijkstraShortestPath;
import com.traffic.algorithms.OptimizationCriteria;
import com.traffic.collections.EmergencyPriorityQueue;
import com.traffic.dto.VehicleDto;
import com.traffic.exception.ResourceNotFoundException;
import com.traffic.model.Intersection;
import com.traffic.model.Vehicle;
import com.traffic.model.VehiclePriority;
import com.traffic.model.VehicleType;
import com.traffic.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmergencyService {

    private final EmergencyPriorityQueue emergencyPriorityQueue;
    private final VehicleRepository vehicleRepository;
    private final VehicleService vehicleService;
    private final TrafficSignalService trafficSignalService;
    private final DijkstraShortestPath dijkstraShortestPath;

    public EmergencyService(EmergencyPriorityQueue emergencyPriorityQueue,
                            VehicleRepository vehicleRepository,
                            VehicleService vehicleService,
                            TrafficSignalService trafficSignalService,
                            DijkstraShortestPath dijkstraShortestPath) {
        this.emergencyPriorityQueue = emergencyPriorityQueue;
        this.vehicleRepository = vehicleRepository;
        this.vehicleService = vehicleService;
        this.trafficSignalService = trafficSignalService;
        this.dijkstraShortestPath = dijkstraShortestPath;
    }

    public List<VehicleDto> getPriorityQueueSnapshot() {
        return emergencyPriorityQueue.getSnapshot().stream()
                .map(vehicleService::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleDto dispatchEmergencyVehicle(VehicleDto dto) {
        if (dto.getVehicleType() == null || !dto.getVehicleType().isEmergency()) {
            dto.setVehicleType(VehicleType.AMBULANCE);
        }
        if (dto.getPriority() == null) {
            dto.setPriority(VehiclePriority.EMERGENCY_HIGH);
        }
        dto.setStatus("EMERGENCY_TRANSIT");

        VehicleDto created = vehicleService.createVehicle(dto);

        // Preempt signals along fastest corridor if road endpoints are known
        if (dto.getCurrentRoadId() != null && dto.getDestinationRoadId() != null) {
            Vehicle vehicle = vehicleRepository.findById(created.getId()).orElse(null);
            if (vehicle != null && vehicle.getCurrentRoad() != null && vehicle.getDestinationRoad() != null) {
                Long startNode = vehicle.getCurrentRoad().getStartIntersection().getId();
                Long endNode = vehicle.getDestinationRoad().getEndIntersection().getId();

                DijkstraShortestPath.PathResult path = dijkstraShortestPath.findOptimalPath(
                        startNode, endNode, OptimizationCriteria.MIN_TRAVEL_TIME, null);

                if (path.isFound()) {
                    for (Intersection node : path.getNodeSequence()) {
                        trafficSignalService.emergencyPreempt(node.getId());
                    }
                }
            }
        }

        return created;
    }

    @Transactional
    public VehicleDto resolveEmergency(Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency vehicle ID " + vehicleId + " not found"));

        vehicle.setStatus("COMPLETED");
        vehicle.setLastUpdated(LocalDateTime.now());
        emergencyPriorityQueue.remove(vehicleId);

        return vehicleService.toDto(vehicleRepository.save(vehicle));
    }
}
