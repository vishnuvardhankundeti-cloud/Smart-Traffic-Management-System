package com.traffic.service;

import com.traffic.collections.EmergencyPriorityQueue;
import com.traffic.collections.RoadNetworkGraph;
import com.traffic.model.*;
import com.traffic.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class DataInitializationService {

    private static final Logger log = LoggerFactory.getLogger(DataInitializationService.class);

    private final IntersectionRepository intersectionRepository;
    private final RoadRepository roadRepository;
    private final VehicleRepository vehicleRepository;
    private final TrafficSignalRepository trafficSignalRepository;
    private final RoadNetworkGraph roadNetworkGraph;
    private final EmergencyPriorityQueue emergencyPriorityQueue;

    public DataInitializationService(IntersectionRepository intersectionRepository,
                                   RoadRepository roadRepository,
                                   VehicleRepository vehicleRepository,
                                   TrafficSignalRepository trafficSignalRepository,
                                   RoadNetworkGraph roadNetworkGraph,
                                   EmergencyPriorityQueue emergencyPriorityQueue) {
        this.intersectionRepository = intersectionRepository;
        this.roadRepository = roadRepository;
        this.vehicleRepository = vehicleRepository;
        this.trafficSignalRepository = trafficSignalRepository;
        this.roadNetworkGraph = roadNetworkGraph;
        this.emergencyPriorityQueue = emergencyPriorityQueue;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initDemoData() {
        if (intersectionRepository.count() > 0) {
            log.info("Database already contains data. Initializing in-memory road graph and priority queue...");
            refreshGraphAndQueues();
            return;
        }

        log.info("Initializing Smart Traffic Management System default demo dataset...");

        // 1. Create 10 Intersections across urban grid
        List<Intersection> intersections = List.of(
                new Intersection(null, "Central Square", 40.7128, -74.0060, "4-WAY", "Downtown"),
                new Intersection(null, "North Plaza", 40.7228, -74.0040, "4-WAY", "North Sector"),
                new Intersection(null, "Airport Interchange", 40.7350, -73.9900, "ROUNDABOUT", "Airport Way"),
                new Intersection(null, "Tech Park Crossing", 40.7290, -74.0150, "4-WAY", "Tech Park"),
                new Intersection(null, "Harbor Junction", 40.7050, -74.0180, "3-WAY", "Harbor District"),
                new Intersection(null, "East End Boulevard", 40.7180, -73.9850, "4-WAY", "East End"),
                new Intersection(null, "South Gate Gateway", 40.6990, -74.0080, "4-WAY", "South Gate"),
                new Intersection(null, "Westview Junction", 40.7150, -74.0250, "3-WAY", "West District"),
                new Intersection(null, "University Circle", 40.7310, -74.0020, "ROUNDABOUT", "University Campus"),
                new Intersection(null, "Metro Station Hub", 40.7250, -73.9950, "4-WAY", "Midtown Transit")
        );
        intersections = intersectionRepository.saveAll(intersections);
        Map<String, Intersection> iMap = new HashMap<>();
        intersections.forEach(i -> iMap.put(i.getIntersectionName(), i));

        // 2. Create 16 Roads connecting intersections in a realistic urban graph
        List<Road> roads = List.of(
                new Road(null, "Grand Avenue", iMap.get("Central Square"), iMap.get("North Plaza"), 2.4, 120, 45, 60),
                new Road(null, "Tech Expressway", iMap.get("North Plaza"), iMap.get("Tech Park Crossing"), 3.1, 150, 78, 80),
                new Road(null, "Airport Parkway", iMap.get("North Plaza"), iMap.get("Airport Interchange"), 4.5, 200, 110, 90),
                new Road(null, "University Way", iMap.get("North Plaza"), iMap.get("University Circle"), 1.8, 80, 22, 45),
                new Road(null, "Metro Tunnel Bypass", iMap.get("Airport Interchange"), iMap.get("Metro Station Hub"), 2.9, 140, 85, 70),
                new Road(null, "Innovation Blvd", iMap.get("Tech Park Crossing"), iMap.get("Westview Junction"), 2.2, 90, 68, 50),
                new Road(null, "Harbor Coastline Rd", iMap.get("Westview Junction"), iMap.get("Harbor Junction"), 3.5, 110, 40, 60),
                new Road(null, "Downtown Link", iMap.get("Central Square"), iMap.get("Harbor Junction"), 1.9, 100, 72, 45),
                new Road(null, "South Gate Connector", iMap.get("Harbor Junction"), iMap.get("South Gate Gateway"), 2.0, 100, 35, 55),
                new Road(null, "Liberty Ring", iMap.get("Central Square"), iMap.get("South Gate Gateway"), 2.5, 130, 90, 50),
                new Road(null, "East Commerce St", iMap.get("Central Square"), iMap.get("East End Boulevard"), 2.1, 110, 50, 50),
                new Road(null, "Transit Corridor", iMap.get("East End Boulevard"), iMap.get("Metro Station Hub"), 1.7, 95, 42, 50),
                new Road(null, "Campus Loop", iMap.get("University Circle"), iMap.get("Metro Station Hub"), 1.5, 75, 18, 40),
                new Road(null, "Outer Beltway East", iMap.get("Metro Station Hub"), iMap.get("East End Boulevard"), 2.8, 160, 55, 80),
                new Road(null, "Waterfront Passage", iMap.get("South Gate Gateway"), iMap.get("East End Boulevard"), 3.8, 140, 30, 65),
                new Road(null, "Skyline Highway", iMap.get("Westview Junction"), iMap.get("Central Square"), 2.7, 130, 80, 60)
        );
        roads = roadRepository.saveAll(roads);
        Map<String, Road> rMap = new HashMap<>();
        roads.forEach(r -> rMap.put(r.getRoadName(), r));

        // 3. Create Traffic Signals for key intersections
        List<TrafficSignal> signals = new ArrayList<>();
        int count = 0;
        SignalState[] states = {SignalState.GREEN, SignalState.RED, SignalState.YELLOW, SignalState.GREEN, SignalState.RED};
        for (Intersection intersection : intersections) {
            SignalState initState = states[count % states.length];
            TrafficSignal sig = new TrafficSignal(
                    null,
                    intersection,
                    intersection.getIntersectionName(),
                    "Connected routes for " + intersection.getIntersectionName(),
                    initState,
                    45 + (count * 5) % 25,
                    5,
                    50 + (count * 5) % 20
            );
            signals.add(sig);
            count++;
        }
        trafficSignalRepository.saveAll(signals);

        // 4. Create 32 realistic Vehicles (Cars, Bikes, Buses, Trucks, and Emergency Vehicles)
        List<Vehicle> vehicles = List.of(
                // Emergency Vehicles
                new Vehicle(null, "MED-911-A", VehicleType.AMBULANCE, VehiclePriority.EMERGENCY_HIGH, rMap.get("Grand Avenue"), rMap.get("Metro Tunnel Bypass"), 65.0, "EMERGENCY_TRANSIT"),
                new Vehicle(null, "MED-911-B", VehicleType.AMBULANCE, VehiclePriority.EMERGENCY_HIGH, rMap.get("Tech Expressway"), rMap.get("Downtown Link"), 70.0, "EMERGENCY_TRANSIT"),
                new Vehicle(null, "FIRE-101-A", VehicleType.FIRE_ENGINE, VehiclePriority.EMERGENCY_MEDIUM, rMap.get("Downtown Link"), rMap.get("Harbor Coastline Rd"), 55.0, "EMERGENCY_TRANSIT"),
                new Vehicle(null, "FIRE-101-B", VehicleType.FIRE_ENGINE, VehiclePriority.EMERGENCY_MEDIUM, rMap.get("East Commerce St"), rMap.get("Airport Parkway"), 50.0, "EMERGENCY_TRANSIT"),
                new Vehicle(null, "POLICE-201", VehicleType.POLICE_VEHICLE, VehiclePriority.EMERGENCY_LOW, rMap.get("Liberty Ring"), rMap.get("Campus Loop"), 60.0, "ACTIVE"),
                new Vehicle(null, "POLICE-202", VehicleType.POLICE_VEHICLE, VehiclePriority.EMERGENCY_LOW, rMap.get("Airport Parkway"), rMap.get("Westview Junction"), 62.0, "ACTIVE"),

                // Public Transit Buses
                new Vehicle(null, "BUS-CITY-01", VehicleType.BUS, VehiclePriority.HIGH, rMap.get("Grand Avenue"), rMap.get("East End Boulevard"), 40.0, "ACTIVE"),
                new Vehicle(null, "BUS-CITY-02", VehicleType.BUS, VehiclePriority.HIGH, rMap.get("Metro Tunnel Bypass"), rMap.get("South Gate Gateway"), 38.0, "WAITING"),
                new Vehicle(null, "BUS-EXPR-09", VehicleType.BUS, VehiclePriority.HIGH, rMap.get("Tech Expressway"), rMap.get("Campus Loop"), 45.0, "ACTIVE"),
                new Vehicle(null, "BUS-AIR-15", VehicleType.BUS, VehiclePriority.HIGH, rMap.get("Airport Parkway"), rMap.get("Downtown Link"), 42.0, "ACTIVE"),

                // Commercial Trucks
                new Vehicle(null, "TRK-LOG-441", VehicleType.TRUCK, VehiclePriority.LOW, rMap.get("Outer Beltway East"), rMap.get("Harbor Coastline Rd"), 48.0, "ACTIVE"),
                new Vehicle(null, "TRK-CARGO-78", VehicleType.TRUCK, VehiclePriority.LOW, rMap.get("Waterfront Passage"), rMap.get("Tech Expressway"), 45.0, "ACTIVE"),
                new Vehicle(null, "TRK-FREIGHT-1", VehicleType.TRUCK, VehiclePriority.LOW, rMap.get("South Gate Connector"), rMap.get("East Commerce St"), 40.0, "WAITING"),

                // Standard Cars
                new Vehicle(null, "CAR-NY-4921", VehicleType.CAR, VehiclePriority.NORMAL, rMap.get("Grand Avenue"), rMap.get("Airport Parkway"), 52.0, "ACTIVE"),
                new Vehicle(null, "CAR-CA-8832", VehicleType.CAR, VehiclePriority.NORMAL, rMap.get("Grand Avenue"), rMap.get("University Way"), 48.0, "ACTIVE"),
                new Vehicle(null, "CAR-TX-1092", VehicleType.CAR, VehiclePriority.NORMAL, rMap.get("Tech Expressway"), rMap.get("Innovation Blvd"), 58.0, "ACTIVE"),
                new Vehicle(null, "CAR-IL-5541", VehicleType.CAR, VehiclePriority.NORMAL, rMap.get("Tech Expressway"), rMap.get("Metro Tunnel Bypass"), 60.0, "ACTIVE"),
                new Vehicle(null, "CAR-FL-3312", VehicleType.CAR, VehiclePriority.NORMAL, rMap.get("Airport Parkway"), rMap.get("East End Boulevard"), 55.0, "ACTIVE"),
                new Vehicle(null, "CAR-WA-7729", VehicleType.CAR, VehiclePriority.NORMAL, rMap.get("Innovation Blvd"), rMap.get("Central Square"), 45.0, "WAITING"),
                new Vehicle(null, "CAR-OH-9104", VehicleType.CAR, VehiclePriority.NORMAL, rMap.get("Downtown Link"), rMap.get("South Gate Connector"), 35.0, "ACTIVE"),
                new Vehicle(null, "CAR-MA-4281", VehicleType.CAR, VehiclePriority.NORMAL, rMap.get("Liberty Ring"), rMap.get("Waterfront Passage"), 30.0, "WAITING"),
                new Vehicle(null, "CAR-NJ-6321", VehicleType.CAR, VehiclePriority.NORMAL, rMap.get("East Commerce St"), rMap.get("Campus Loop"), 48.0, "ACTIVE"),
                new Vehicle(null, "CAR-PA-1598", VehicleType.CAR, VehiclePriority.NORMAL, rMap.get("Transit Corridor"), rMap.get("Airport Parkway"), 50.0, "ACTIVE"),
                new Vehicle(null, "CAR-CO-8214", VehicleType.CAR, VehiclePriority.NORMAL, rMap.get("Skyline Highway"), rMap.get("Harbor Coastline Rd"), 52.0, "ACTIVE"),
                new Vehicle(null, "CAR-AZ-3691", VehicleType.CAR, VehiclePriority.NORMAL, rMap.get("Campus Loop"), rMap.get("Tech Park Crossing"), 40.0, "ACTIVE"),

                // Bikes
                new Vehicle(null, "BIKE-URB-01", VehicleType.BIKE, VehiclePriority.NORMAL, rMap.get("University Way"), rMap.get("Central Square"), 28.0, "ACTIVE"),
                new Vehicle(null, "BIKE-URB-02", VehicleType.BIKE, VehiclePriority.NORMAL, rMap.get("Campus Loop"), rMap.get("Metro Station Hub"), 30.0, "ACTIVE"),
                new Vehicle(null, "BIKE-SPD-11", VehicleType.BIKE, VehiclePriority.NORMAL, rMap.get("Grand Avenue"), rMap.get("Downtown Link"), 32.0, "ACTIVE"),
                new Vehicle(null, "BIKE-ECO-22", VehicleType.BIKE, VehiclePriority.NORMAL, rMap.get("Innovation Blvd"), rMap.get("Westview Junction"), 26.0, "ACTIVE"),
                new Vehicle(null, "BIKE-FAST-8", VehicleType.BIKE, VehiclePriority.NORMAL, rMap.get("East Commerce St"), rMap.get("Transit Corridor"), 34.0, "ACTIVE"),
                new Vehicle(null, "BIKE-COMM-9", VehicleType.BIKE, VehiclePriority.NORMAL, rMap.get("Harbor Coastline Rd"), rMap.get("South Gate Gateway"), 25.0, "ACTIVE")
        );
        vehicleRepository.saveAll(vehicles);

        refreshGraphAndQueues();
        log.info("Demo data initialization complete! Initialized {} intersections, {} roads, {} vehicles, {} signals.",
                intersections.size(), roads.size(), vehicles.size(), signals.size());
    }

    public synchronized void refreshGraphAndQueues() {
        List<Intersection> allIntersections = intersectionRepository.findAll();
        List<Road> allRoads = roadRepository.findAll();
        roadNetworkGraph.rebuild(allIntersections, allRoads);

        // Populate emergency priority queue with active emergency vehicles
        emergencyPriorityQueue.clear();
        List<Vehicle> emergencyVehicles = vehicleRepository.findAll().stream()
                .filter(Vehicle::isEmergency)
                .toList();
        emergencyVehicles.forEach(emergencyPriorityQueue::enqueue);
    }
}
