package com.traffic.service;

import com.traffic.dto.RoadDto;
import com.traffic.dto.TrafficOverviewDto;
import com.traffic.model.Road;
import com.traffic.model.Vehicle;
import com.traffic.model.VehicleType;
import com.traffic.repository.RoadRepository;
import com.traffic.repository.TrafficSignalRepository;
import com.traffic.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TrafficMonitoringService {

    private final VehicleRepository vehicleRepository;
    private final RoadRepository roadRepository;
    private final TrafficSignalRepository trafficSignalRepository;
    private final RoadService roadService;

    public TrafficMonitoringService(VehicleRepository vehicleRepository,
                                  RoadRepository roadRepository,
                                  TrafficSignalRepository trafficSignalRepository,
                                  RoadService roadService) {
        this.vehicleRepository = vehicleRepository;
        this.roadRepository = roadRepository;
        this.trafficSignalRepository = trafficSignalRepository;
        this.roadService = roadService;
    }

    /**
     * Demonstrates Java Stream API aggregations:
     * - Grouping by vehicle type
     * - Grouping by road status
     * - Averaging road traffic density
     * - Counting with predicate filters
     */
    public TrafficOverviewDto getTrafficOverview() {
        List<Road> allRoads = roadRepository.findAll();
        List<Vehicle> allVehicles = vehicleRepository.findAll();

        TrafficOverviewDto overview = new TrafficOverviewDto();
        overview.setTotalVehicles(allVehicles.size());
        overview.setActiveRoads(allRoads.size());

        // Average Traffic Density using Stream API
        double avgDensity = allRoads.stream()
                .mapToDouble(Road::getTrafficDensity)
                .average()
                .orElse(0.0);
        overview.setAverageTrafficDensity(Math.round(avgDensity * 10.0) / 10.0);

        // Congested roads count using Stream API
        long congested = allRoads.stream()
                .filter(r -> "CONGESTED".equalsIgnoreCase(r.getRoadStatus()) || r.getTrafficDensity() >= 75.0)
                .count();
        overview.setCongestedRoadsCount(congested);

        // Active emergency vehicles using Stream API
        long emergencyCount = allVehicles.stream()
                .filter(Vehicle::isEmergency)
                .filter(v -> "EMERGENCY_TRANSIT".equalsIgnoreCase(v.getStatus()) || "ACTIVE".equalsIgnoreCase(v.getStatus()))
                .count();
        overview.setActiveEmergencyVehicles(emergencyCount);

        // Operational signals count
        overview.setOperationalSignalsCount(trafficSignalRepository.count());

        // Live Roads DTOs
        List<RoadDto> roadDtos = allRoads.stream()
                .map(roadService::toDto)
                .collect(Collectors.toList());
        overview.setLiveRoads(roadDtos);

        // Vehicle Distribution Map using Collectors.groupingBy
        Map<String, Long> vehicleDistribution = allVehicles.stream()
                .collect(Collectors.groupingBy(v -> v.getVehicleType().name(), Collectors.counting()));
        overview.setVehicleTypeDistribution(vehicleDistribution);

        // Road Status Map using Collectors.groupingBy
        Map<String, Long> statusDistribution = allRoads.stream()
                .collect(Collectors.groupingBy(Road::getRoadStatus, Collectors.counting()));
        overview.setRoadStatusCounts(statusDistribution);

        return overview;
    }
}
