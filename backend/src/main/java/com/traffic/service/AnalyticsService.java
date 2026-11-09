package com.traffic.service;

import com.traffic.collections.IntersectionVehicleQueue;
import com.traffic.dto.AnalyticsSummaryDto;
import com.traffic.model.Intersection;
import com.traffic.model.Road;
import com.traffic.model.SimulationHistory;
import com.traffic.model.Vehicle;
import com.traffic.repository.IntersectionRepository;
import com.traffic.repository.RoadRepository;
import com.traffic.repository.SimulationHistoryRepository;
import com.traffic.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final RoadRepository roadRepository;
    private final VehicleRepository vehicleRepository;
    private final IntersectionRepository intersectionRepository;
    private final SimulationHistoryRepository simulationHistoryRepository;
    private final IntersectionVehicleQueue intersectionVehicleQueue;
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    public AnalyticsService(RoadRepository roadRepository,
                            VehicleRepository vehicleRepository,
                            IntersectionRepository intersectionRepository,
                            SimulationHistoryRepository simulationHistoryRepository,
                            IntersectionVehicleQueue intersectionVehicleQueue) {
        this.roadRepository = roadRepository;
        this.vehicleRepository = vehicleRepository;
        this.intersectionRepository = intersectionRepository;
        this.simulationHistoryRepository = simulationHistoryRepository;
        this.intersectionVehicleQueue = intersectionVehicleQueue;
    }

    /**
     * Demonstrates extensive Java Stream API capabilities:
     * - Finding max element with Comparator
     * - Grouping by vehicle type with frequency counting
     * - Transforming and projecting collections for chart rendering
     */
    public AnalyticsSummaryDto getAnalyticsSummary() {
        List<Road> roads = roadRepository.findAll();
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<SimulationHistory> history = simulationHistoryRepository.findTop30ByOrderBySnapshotTimeDesc();

        AnalyticsSummaryDto summary = new AnalyticsSummaryDto();

        summary.setTotalVehiclesProcessed(Math.max(vehicles.size(), intersectionVehicleQueue.getProcessedCount()));
        summary.setAverageWaitingTimeSeconds(24.5); // Simulated average queue wait

        // 1. Most Congested Road using Stream API max
        String mostCongested = roads.stream()
                .max(Comparator.comparingDouble(Road::getTrafficDensity))
                .map(r -> r.getRoadName() + " (" + r.getTrafficDensity() + "%)")
                .orElse("None");
        summary.setMostCongestedRoad(mostCongested);

        // 2. Busiest Intersection using Stream API
        String busiest = roads.stream()
                .collect(Collectors.groupingBy(r -> r.getStartIntersection().getIntersectionName(),
                        Collectors.summingInt(Road::getCurrentVehicleCount)))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> e.getKey() + " (" + e.getValue() + " veh)")
                .orElse("Central Square");
        summary.setBusiestIntersection(busiest);

        // 3. Emergency Vehicles Processed
        long emergencyCount = vehicles.stream().filter(Vehicle::isEmergency).count();
        summary.setEmergencyVehiclesProcessed((int) emergencyCount);

        // 4. Average Traffic Density
        double avgDensity = roads.stream()
                .mapToDouble(Road::getTrafficDensity)
                .average()
                .orElse(0.0);
        summary.setAverageTrafficDensity(Math.round(avgDensity * 10.0) / 10.0);

        // 5. Total Distance Covered
        double totalDist = roads.stream()
                .mapToDouble(r -> r.getDistanceKm() * r.getCurrentVehicleCount())
                .sum();
        summary.setTotalDistanceCoveredKm(Math.round(totalDist * 10.0) / 10.0);

        // 6. Density Trends over Time (Line Chart data)
        List<Map<String, Object>> trendList = new ArrayList<>();
        if (!history.isEmpty()) {
            for (int i = history.size() - 1; i >= 0; i--) {
                SimulationHistory h = history.get(i);
                Map<String, Object> point = new HashMap<>();
                point.put("time", h.getSnapshotTime().format(TIME_FMT));
                point.put("density", h.getAverageTrafficDensity());
                point.put("congestedRoads", h.getCongestedRoadsCount());
                point.put("vehicles", h.getTotalVehicles());
                trendList.add(point);
            }
        } else {
            // Generate synthetic trend baseline from current data
            for (int i = 5; i >= 0; i--) {
                Map<String, Object> point = new HashMap<>();
                point.put("time", "T-" + (i * 30) + "s");
                point.put("density", Math.max(10.0, avgDensity + ((i % 2 == 0 ? 1 : -1) * (i * 2.5))));
                point.put("congestedRoads", Math.max(1, i % 3));
                point.put("vehicles", vehicles.size() - (i * 2));
                trendList.add(point);
            }
        }
        summary.setDensityTrends(trendList);

        // 7. Vehicle Distribution (Doughnut Chart data)
        Map<String, Long> vehicleDist = vehicles.stream()
                .collect(Collectors.groupingBy(v -> v.getVehicleType().name(), Collectors.counting()));
        summary.setVehicleDistribution(vehicleDist);

        // 8. Road Performance comparison (Bar Chart data)
        List<Map<String, Object>> roadPerf = roads.stream()
                .sorted(Comparator.comparingDouble(Road::getTrafficDensity).reversed())
                .limit(10)
                .map(r -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("roadName", r.getRoadName());
                    m.put("density", r.getTrafficDensity());
                    m.put("speed", r.getAverageSpeed());
                    m.put("vehicleCount", r.getCurrentVehicleCount());
                    m.put("capacity", r.getMaxCapacity());
                    return m;
                })
                .collect(Collectors.toList());
        summary.setRoadPerformance(roadPerf);

        // 9. Congestion Distribution (Bar / Polar Chart data)
        Map<String, Long> congestionMap = roads.stream()
                .collect(Collectors.groupingBy(Road::getRoadStatus, Collectors.counting()));
        summary.setCongestionDistribution(congestionMap);

        return summary;
    }

    public ByteArrayInputStream exportVehiclesCsv() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("VehicleID,RegistrationNumber,Type,Priority,CurrentRoad,DestinationRoad,SpeedKmH,Status,EntryTime");
            for (Vehicle v : vehicles) {
                writer.printf("%d,%s,%s,%s,%s,%s,%.1f,%s,%s%n",
                        v.getId(),
                        v.getRegistrationNumber(),
                        v.getVehicleType().name(),
                        v.getPriority().name(),
                        v.getCurrentRoad() != null ? v.getCurrentRoad().getRoadName() : "N/A",
                        v.getDestinationRoad() != null ? v.getDestinationRoad().getRoadName() : "N/A",
                        v.getSpeed(),
                        v.getStatus(),
                        v.getEntryTime()
                );
            }
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream exportRoadsCsv() {
        List<Road> roads = roadRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8)) {
            writer.println("RoadID,RoadName,StartIntersection,EndIntersection,DistanceKm,MaxCapacity,CurrentVehicles,TrafficDensityPercent,AverageSpeedKmH,Status");
            for (Road r : roads) {
                writer.printf("%d,%s,%s,%s,%.2f,%d,%d,%.1f,%.1f,%s%n",
                        r.getId(),
                        r.getRoadName(),
                        r.getStartIntersection() != null ? r.getStartIntersection().getIntersectionName() : "N/A",
                        r.getEndIntersection() != null ? r.getEndIntersection().getIntersectionName() : "N/A",
                        r.getDistanceKm(),
                        r.getMaxCapacity(),
                        r.getCurrentVehicleCount(),
                        r.getTrafficDensity(),
                        r.getAverageSpeed(),
                        r.getRoadStatus()
                );
            }
        }
        return new ByteArrayInputStream(out.toByteArray());
    }
}
