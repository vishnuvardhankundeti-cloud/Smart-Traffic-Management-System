package com.traffic.simulation;

import com.traffic.collections.EmergencyPriorityQueue;
import com.traffic.collections.IntersectionVehicleQueue;
import com.traffic.collections.RoadNetworkGraph;
import com.traffic.dto.SimulationStatusDto;
import com.traffic.model.*;
import com.traffic.repository.*;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * High-performance Multithreaded Traffic Simulation Engine
 * Demonstrates:
 * - Java ExecutorService / ScheduledExecutorService
 * - Concurrent execution of 5 specialized worker threads:
 *   1. Vehicle Arrival & Movement Thread
 *   2. Road Density & Congestion Detection Thread
 *   3. Intersection Queue Scheduling Thread
 *   4. Traffic Signal State Transition Thread
 *   5. Analytics Snapshot & Event Logging Thread
 * - Thread-safe synchronization, Atomic variables, and Concurrent collections
 */
@Service
public class TrafficSimulationEngine {

    private static final Logger log = LoggerFactory.getLogger(TrafficSimulationEngine.class);

    private final RoadRepository roadRepository;
    private final VehicleRepository vehicleRepository;
    private final TrafficSignalRepository trafficSignalRepository;
    private final TrafficEventRepository trafficEventRepository;
    private final SimulationHistoryRepository simulationHistoryRepository;
    private final IntersectionVehicleQueue intersectionVehicleQueue;
    private final EmergencyPriorityQueue emergencyPriorityQueue;
    private final RoadNetworkGraph roadNetworkGraph;

    private ScheduledExecutorService executorService;
    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private final AtomicBoolean isPaused = new AtomicBoolean(false);
    private final AtomicInteger speedMultiplier = new AtomicInteger(1);
    private final AtomicLong simulationSeconds = new AtomicLong(0);
    private final AtomicInteger vehiclesGeneratedCount = new AtomicInteger(32);

    private final List<SimulationLog> activityLogs = Collections.synchronizedList(new LinkedList<>());
    private final Random random = new Random();

    public TrafficSimulationEngine(RoadRepository roadRepository,
                                   VehicleRepository vehicleRepository,
                                   TrafficSignalRepository trafficSignalRepository,
                                   TrafficEventRepository trafficEventRepository,
                                   SimulationHistoryRepository simulationHistoryRepository,
                                   IntersectionVehicleQueue intersectionVehicleQueue,
                                   EmergencyPriorityQueue emergencyPriorityQueue,
                                   RoadNetworkGraph roadNetworkGraph) {
        this.roadRepository = roadRepository;
        this.vehicleRepository = vehicleRepository;
        this.trafficSignalRepository = trafficSignalRepository;
        this.trafficEventRepository = trafficEventRepository;
        this.simulationHistoryRepository = simulationHistoryRepository;
        this.intersectionVehicleQueue = intersectionVehicleQueue;
        this.emergencyPriorityQueue = emergencyPriorityQueue;
        this.roadNetworkGraph = roadNetworkGraph;
    }

    @PostConstruct
    public void init() {
        start(); // Automatically start simulation in background on application start
    }

    @PreDestroy
    public void cleanup() {
        stop();
    }

    public synchronized void start() {
        if (isRunning.get()) {
            if (isPaused.get()) {
                resume();
            }
            return;
        }

        executorService = Executors.newScheduledThreadPool(5, new ThreadFactory() {
            private int counter = 1;
            @Override
            public Thread newThread(Runnable r) {
                Thread t = new Thread(r, "TrafficSim-Worker-" + (counter++));
                t.setDaemon(true);
                return t;
            }
        });

        isRunning.set(true);
        isPaused.set(false);
        addLog("Engine", "Traffic Simulation Engine initialized with 5 concurrent worker threads.", "SUCCESS");

        // Thread 1: Vehicle Arrivals & Movement (every 3000ms / speed)
        executorService.scheduleWithFixedDelay(this::runVehicleArrivalTask, 1000, 3000, TimeUnit.MILLISECONDS);

        // Thread 2: Road Traffic Density & Congestion (every 2000ms / speed)
        executorService.scheduleWithFixedDelay(this::runRoadDensityTask, 1500, 2000, TimeUnit.MILLISECONDS);

        // Thread 3: Vehicle Queue Processing at Intersections (every 2500ms / speed)
        executorService.scheduleWithFixedDelay(this::runQueueProcessingTask, 2000, 2500, TimeUnit.MILLISECONDS);

        // Thread 4: Traffic Signal State Transitions (every 1000ms / speed)
        executorService.scheduleWithFixedDelay(this::runSignalCycleTask, 1000, 1000, TimeUnit.MILLISECONDS);

        // Thread 5: Analytics Snapshots (every 8000ms)
        executorService.scheduleWithFixedDelay(this::runAnalyticsSnapshotTask, 5000, 8000, TimeUnit.MILLISECONDS);
    }

    public void pause() {
        if (isRunning.get() && !isPaused.get()) {
            isPaused.set(true);
            addLog("Engine", "Simulation PAUSED by operator.", "WARNING");
        }
    }

    public void resume() {
        if (isRunning.get() && isPaused.get()) {
            isPaused.set(false);
            addLog("Engine", "Simulation RESUMED.", "INFO");
        }
    }

    public synchronized void stop() {
        if (isRunning.get()) {
            isRunning.set(false);
            isPaused.set(false);
            if (executorService != null && !executorService.isShutdown()) {
                executorService.shutdownNow();
            }
            addLog("Engine", "Simulation STOPPED. All worker threads terminated.", "ALERT");
        }
    }

    public void setSpeed(int speed) {
        if (speed >= 1 && speed <= 10) {
            speedMultiplier.set(speed);
            addLog("Engine", "Simulation speed updated to " + speed + "x.", "INFO");
        }
    }

    public synchronized void resetDemo() {
        stop();
        activityLogs.clear();
        simulationSeconds.set(0);
        vehiclesGeneratedCount.set(32);
        intersectionVehicleQueue.clearAll();
        emergencyPriorityQueue.clear();

        List<Road> roads = roadRepository.findAll();
        for (Road road : roads) {
            road.setCurrentVehicleCount(Math.min(road.getMaxCapacity() / 3, 30));
            road.recalculateTrafficMetrics();
        }
        roadRepository.saveAll(roads);

        start();
        addLog("Engine", "Simulation environment reset to factory baseline.", "SUCCESS");
    }

    // =========================================================================
    // CONCURRENT WORKER TASKS
    // =========================================================================

    /**
     * THREAD 1: Simulate dynamic vehicle arrivals, route changes, and road loading
     */
    private void runVehicleArrivalTask() {
        if (!isRunning.get() || isPaused.get()) return;
        try {
            List<Road> roads = roadRepository.findAll();
            if (roads.isEmpty()) return;

            // Pick 2 random roads to adjust vehicle counts
            Road road1 = roads.get(random.nextInt(roads.size()));
            int delta1 = random.nextBoolean() ? 1 + random.nextInt(3) : -(1 + random.nextInt(2));
            int newCount = Math.max(2, Math.min(road1.getMaxCapacity(), road1.getCurrentVehicleCount() + delta1));
            road1.setCurrentVehicleCount(newCount);
            roadRepository.save(road1);

            vehiclesGeneratedCount.incrementAndGet();

            // Occasionally enqueue vehicle to intersection queue
            if (road1.getStartIntersection() != null && random.nextInt(10) < 4) {
                Vehicle mockVeh = new Vehicle();
                mockVeh.setId((long) (1000 + random.nextInt(9000)));
                mockVeh.setRegistrationNumber("SIM-" + (100 + random.nextInt(900)));
                mockVeh.setVehicleType(random.nextInt(15) == 0 ? VehicleType.AMBULANCE : VehicleType.CAR);
                mockVeh.setPriority(mockVeh.isEmergency() ? VehiclePriority.EMERGENCY_HIGH : VehiclePriority.NORMAL);
                mockVeh.setEntryTime(LocalDateTime.now());
                intersectionVehicleQueue.addVehicle(road1.getStartIntersection().getId(), mockVeh);
            }

            if (random.nextInt(10) < 3) {
                addLog("Thread-1 [Arrivals]", "Road '" + road1.getRoadName() + "' adjusted to " + road1.getCurrentVehicleCount() + " active vehicles.", "INFO");
            }
        } catch (Exception e) {
            log.error("Error in vehicle arrival thread: {}", e.getMessage());
        }
    }

    /**
     * THREAD 2: Update road traffic density, check thresholds, trigger congestion alerts
     */
    private void runRoadDensityTask() {
        if (!isRunning.get() || isPaused.get()) return;
        try {
            List<Road> roads = roadRepository.findAll();
            for (Road road : roads) {
                String previousStatus = road.getRoadStatus();
                road.recalculateTrafficMetrics();

                if (!previousStatus.equals(road.getRoadStatus())) {
                    roadRepository.save(road);
                    if ("CONGESTED".equals(road.getRoadStatus())) {
                        String alertMsg = "Congestion detected on " + road.getRoadName() + " (Density: " + road.getTrafficDensity() + "%). Rerouting recommended.";
                        addLog("Thread-2 [Density]", alertMsg, "ALERT");
                        trafficEventRepository.save(new TrafficEvent(null, "CONGESTION_ALERT", road.getRoadName(), alertMsg, "CRITICAL"));
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error in road density thread: {}", e.getMessage());
        }
    }

    /**
     * THREAD 3: Process intersection vehicle queues according to traffic signals and emergency preemption
     */
    private void runQueueProcessingTask() {
        if (!isRunning.get() || isPaused.get()) return;
        try {
            // Process Emergency Priority Queue first
            if (!emergencyPriorityQueue.isEmpty()) {
                Vehicle emergency = emergencyPriorityQueue.peek();
                if (emergency != null) {
                    addLog("Thread-3 [Queue]", "Emergency vehicle " + emergency.getRegistrationNumber() + " prioritized through intersection corridor.", "SUCCESS");
                }
            }

            // Process intersection queues for signals that are currently GREEN
            List<TrafficSignal> greenSignals = trafficSignalRepository.findAll().stream()
                    .filter(s -> s.getCurrentSignalState() == SignalState.GREEN)
                    .toList();

            for (TrafficSignal sig : greenSignals) {
                if (sig.getIntersection() != null) {
                    Vehicle processed = intersectionVehicleQueue.processNextVehicle(sig.getIntersection().getId());
                    if (processed != null) {
                        addLog("Thread-3 [Queue]", "Vehicle " + processed.getRegistrationNumber() + " cleared intersection " + sig.getIntersection().getIntersectionName(), "INFO");
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error in queue processing thread: {}", e.getMessage());
        }
    }

    /**
     * THREAD 4: Real-time traffic signal state transitions (RED -> GREEN -> YELLOW -> RED)
     */
    private void runSignalCycleTask() {
        if (!isRunning.get() || isPaused.get()) return;
        try {
            simulationSeconds.incrementAndGet();
            int multiplier = speedMultiplier.get();

            List<TrafficSignal> signals = trafficSignalRepository.findAll();
            for (TrafficSignal signal : signals) {
                if ("MAINTENANCE".equalsIgnoreCase(signal.getOperationalStatus())) continue;

                int remaining = signal.getCycleRemainingSeconds() - multiplier;
                if (remaining <= 0) {
                    // Transition to next state
                    SignalState nextState;
                    int nextDuration;

                    switch (signal.getCurrentSignalState()) {
                        case GREEN -> {
                            nextState = SignalState.YELLOW;
                            nextDuration = signal.getYellowDurationSeconds();
                        }
                        case YELLOW -> {
                            nextState = SignalState.RED;
                            nextDuration = signal.getRedDurationSeconds();
                        }
                        default -> {
                            nextState = SignalState.GREEN;
                            nextDuration = signal.getGreenDurationSeconds();
                        }
                    }

                    signal.setCurrentSignalState(nextState);
                    signal.setCycleRemainingSeconds(nextDuration);
                    signal.setLastStateChange(LocalDateTime.now());
                    trafficSignalRepository.save(signal);

                    if (random.nextInt(10) < 2) {
                        addLog("Thread-4 [Signals]", "Signal at " + signal.getIntersectionName() + " switched to " + nextState, "INFO");
                    }
                } else {
                    signal.setCycleRemainingSeconds(remaining);
                    trafficSignalRepository.save(signal);
                }
            }
        } catch (Exception e) {
            log.error("Error in signal cycle thread: {}", e.getMessage());
        }
    }

    /**
     * THREAD 5: Periodic Analytics Snapshot and Historical Tracking
     */
    private void runAnalyticsSnapshotTask() {
        if (!isRunning.get() || isPaused.get()) return;
        try {
            List<Road> roads = roadRepository.findAll();
            List<Vehicle> vehicles = vehicleRepository.findAll();

            double avgDensity = roads.stream().mapToDouble(Road::getTrafficDensity).average().orElse(0.0);
            int congestedCount = (int) roads.stream().filter(r -> "CONGESTED".equalsIgnoreCase(r.getRoadStatus())).count();
            int emergencyCount = (int) vehicles.stream().filter(Vehicle::isEmergency).count();
            double avgSpeed = roads.stream().mapToDouble(Road::getAverageSpeed).average().orElse(45.0);

            SimulationHistory snapshot = new SimulationHistory(
                    vehicles.size(),
                    roads.size(),
                    Math.round(avgDensity * 10.0) / 10.0,
                    congestedCount,
                    emergencyCount,
                    intersectionVehicleQueue.getProcessedCount(),
                    Math.round(avgSpeed * 10.0) / 10.0
            );
            simulationHistoryRepository.save(snapshot);
        } catch (Exception e) {
            log.error("Error in analytics snapshot thread: {}", e.getMessage());
        }
    }

    private void addLog(String thread, String message, String level) {
        SimulationLog entry = new SimulationLog(thread, message, level);
        activityLogs.add(0, entry);
        if (activityLogs.size() > 80) {
            activityLogs.remove(activityLogs.size() - 1);
        }
    }

    // =========================================================================
    // STATUS & LOG RETRIEVAL
    // =========================================================================

    public SimulationStatusDto getStatus() {
        SimulationStatusDto dto = new SimulationStatusDto();
        dto.setState(isRunning.get() ? (isPaused.get() ? SimulationState.PAUSED : SimulationState.RUNNING) : SimulationState.STOPPED);
        dto.setRuntimeSeconds(simulationSeconds.get());
        dto.setSpeedMultiplier(speedMultiplier.get());
        dto.setActiveThreads(isRunning.get() ? 5 : 0);
        dto.setVehiclesGenerated(vehiclesGeneratedCount.get());
        dto.setVehiclesProcessed(intersectionVehicleQueue.getProcessedCount());
        dto.setCurrentQueueSize(intersectionVehicleQueue.getTotalWaitingCount() + emergencyPriorityQueue.size());

        List<Road> roads = roadRepository.findAll();
        double avgDensity = roads.stream().mapToDouble(Road::getTrafficDensity).average().orElse(0.0);
        dto.setCurrentAvgDensity(Math.round(avgDensity * 10.0) / 10.0);
        dto.setRecentLogs(getRecentLogs(20));

        return dto;
    }

    public List<SimulationLog> getRecentLogs(int limit) {
        synchronized (activityLogs) {
            return activityLogs.stream()
                    .limit(limit)
                    .toList();
        }
    }
}
