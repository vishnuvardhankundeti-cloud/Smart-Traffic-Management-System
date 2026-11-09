package com.traffic.service;

import com.traffic.collections.EmergencyPriorityQueue;
import com.traffic.dto.VehicleDto;
import com.traffic.exception.InvalidOperationException;
import com.traffic.exception.ResourceNotFoundException;
import com.traffic.model.Road;
import com.traffic.model.Vehicle;
import com.traffic.model.VehicleType;
import com.traffic.repository.RoadRepository;
import com.traffic.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final RoadRepository roadRepository;
    private final EmergencyPriorityQueue emergencyPriorityQueue;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public VehicleService(VehicleRepository vehicleRepository,
                          RoadRepository roadRepository,
                          EmergencyPriorityQueue emergencyPriorityQueue) {
        this.vehicleRepository = vehicleRepository;
        this.roadRepository = roadRepository;
        this.emergencyPriorityQueue = emergencyPriorityQueue;
    }

    /**
     * Demonstrates Java Stream API:
     * - Filtering by vehicle type, road, status
     * - Sorting by priority rank, registration number, or entry time
     * - Mapping to DTOs
     */
    public List<VehicleDto> getAllVehicles(String typeFilter, Long roadIdFilter, String statusFilter, String sortBy) {
        return vehicleRepository.findAll().stream()
                .filter(v -> typeFilter == null || typeFilter.isBlank() || v.getVehicleType().name().equalsIgnoreCase(typeFilter))
                .filter(v -> roadIdFilter == null || (v.getCurrentRoad() != null && v.getCurrentRoad().getId().equals(roadIdFilter)))
                .filter(v -> statusFilter == null || statusFilter.isBlank() || v.getStatus().equalsIgnoreCase(statusFilter))
                .sorted((v1, v2) -> {
                    if ("priority".equalsIgnoreCase(sortBy)) {
                        int r1 = v1.getPriority() != null ? v1.getPriority().getRank() : 99;
                        int r2 = v2.getPriority() != null ? v2.getPriority().getRank() : 99;
                        return Integer.compare(r1, r2);
                    } else if ("registration".equalsIgnoreCase(sortBy)) {
                        return v1.getRegistrationNumber().compareToIgnoreCase(v2.getRegistrationNumber());
                    } else if ("entryTime".equalsIgnoreCase(sortBy)) {
                        return v2.getEntryTime().compareTo(v1.getEntryTime()); // newest first
                    }
                    return Long.compare(v1.getId(), v2.getId());
                })
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public VehicleDto getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle with ID " + id + " not found"));
        return toDto(vehicle);
    }

    @Transactional
    public VehicleDto createVehicle(VehicleDto dto) {
        if (vehicleRepository.existsByRegistrationNumber(dto.getRegistrationNumber())) {
            throw new InvalidOperationException("Registration number '" + dto.getRegistrationNumber() + "' already exists");
        }

        Road currentRoad = null;
        if (dto.getCurrentRoadId() != null) {
            currentRoad = roadRepository.findById(dto.getCurrentRoadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Current road ID " + dto.getCurrentRoadId() + " not found"));
        }

        Road destRoad = null;
        if (dto.getDestinationRoadId() != null) {
            destRoad = roadRepository.findById(dto.getDestinationRoadId()).orElse(null);
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setRegistrationNumber(dto.getRegistrationNumber().trim().toUpperCase());
        vehicle.setVehicleType(dto.getVehicleType());
        vehicle.setPriority(dto.getPriority() != null ? dto.getPriority() : Vehicle.getDefaultPriority(dto.getVehicleType()));
        vehicle.setCurrentRoad(currentRoad);
        vehicle.setDestinationRoad(destRoad);
        vehicle.setSpeed(dto.getSpeed() != null ? dto.getSpeed() : 45.0);
        vehicle.setStatus(dto.getStatus() != null ? dto.getStatus() : (vehicle.isEmergency() ? "EMERGENCY_TRANSIT" : "ACTIVE"));
        vehicle.setEntryTime(LocalDateTime.now());
        vehicle.setLastUpdated(LocalDateTime.now());

        // Update road capacity metrics
        if (currentRoad != null) {
            currentRoad.setCurrentVehicleCount(currentRoad.getCurrentVehicleCount() + 1);
            roadRepository.save(currentRoad);
        }

        Vehicle saved = vehicleRepository.save(vehicle);

        if (saved.isEmergency()) {
            emergencyPriorityQueue.enqueue(saved);
        }

        return toDto(saved);
    }

    @Transactional
    public VehicleDto updateVehicle(Long id, VehicleDto dto) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle with ID " + id + " not found"));

        if (!vehicle.getRegistrationNumber().equalsIgnoreCase(dto.getRegistrationNumber())) {
            if (vehicleRepository.existsByRegistrationNumber(dto.getRegistrationNumber())) {
                throw new InvalidOperationException("Registration number '" + dto.getRegistrationNumber() + "' is already in use");
            }
            vehicle.setRegistrationNumber(dto.getRegistrationNumber().trim().toUpperCase());
        }

        vehicle.setVehicleType(dto.getVehicleType());
        if (dto.getPriority() != null) {
            vehicle.setPriority(dto.getPriority());
        }

        // Handle road change if applicable
        if (dto.getCurrentRoadId() != null && (vehicle.getCurrentRoad() == null || !vehicle.getCurrentRoad().getId().equals(dto.getCurrentRoadId()))) {
            if (vehicle.getCurrentRoad() != null) {
                Road oldRoad = vehicle.getCurrentRoad();
                oldRoad.setCurrentVehicleCount(Math.max(0, oldRoad.getCurrentVehicleCount() - 1));
                roadRepository.save(oldRoad);
            }
            Road newRoad = roadRepository.findById(dto.getCurrentRoadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Road ID " + dto.getCurrentRoadId() + " not found"));
            newRoad.setCurrentVehicleCount(newRoad.getCurrentVehicleCount() + 1);
            roadRepository.save(newRoad);
            vehicle.setCurrentRoad(newRoad);
        }

        if (dto.getDestinationRoadId() != null) {
            Road destRoad = roadRepository.findById(dto.getDestinationRoadId()).orElse(null);
            vehicle.setDestinationRoad(destRoad);
        }

        if (dto.getSpeed() != null) {
            vehicle.setSpeed(dto.getSpeed());
        }

        if (dto.getStatus() != null) {
            vehicle.setStatus(dto.getStatus());
        }

        vehicle.setLastUpdated(LocalDateTime.now());
        Vehicle updated = vehicleRepository.save(vehicle);

        if (updated.isEmergency()) {
            emergencyPriorityQueue.enqueue(updated);
        } else {
            emergencyPriorityQueue.remove(updated.getId());
        }

        return toDto(updated);
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle with ID " + id + " not found"));

        if (vehicle.getCurrentRoad() != null) {
            Road road = vehicle.getCurrentRoad();
            road.setCurrentVehicleCount(Math.max(0, road.getCurrentVehicleCount() - 1));
            roadRepository.save(road);
        }

        emergencyPriorityQueue.remove(id);
        vehicleRepository.delete(vehicle);
    }

    public List<VehicleDto> getEmergencyVehicles() {
        return vehicleRepository.findAll().stream()
                .filter(Vehicle::isEmergency)
                .sorted(Comparator.comparing(v -> v.getPriority().getRank()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public VehicleDto toDto(Vehicle v) {
        VehicleDto dto = new VehicleDto();
        dto.setId(v.getId());
        dto.setRegistrationNumber(v.getRegistrationNumber());
        dto.setVehicleType(v.getVehicleType());
        dto.setPriority(v.getPriority());
        if (v.getCurrentRoad() != null) {
            dto.setCurrentRoadId(v.getCurrentRoad().getId());
            dto.setCurrentRoadName(v.getCurrentRoad().getRoadName());
        }
        if (v.getDestinationRoad() != null) {
            dto.setDestinationRoadId(v.getDestinationRoad().getId());
            dto.setDestinationRoadName(v.getDestinationRoad().getRoadName());
        }
        dto.setSpeed(v.getSpeed());
        dto.setStatus(v.getStatus());
        dto.setEntryTime(v.getEntryTime() != null ? v.getEntryTime().format(FORMATTER) : null);
        return dto;
    }
}
