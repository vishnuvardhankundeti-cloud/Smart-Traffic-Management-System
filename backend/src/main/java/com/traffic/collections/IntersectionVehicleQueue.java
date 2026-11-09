package com.traffic.collections;

import com.traffic.model.Vehicle;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Demonstrates:
 * - Queue interface implemented via LinkedList
 * - Deque for emergency preemption at head of queue
 * - ConcurrentHashMap for per-intersection waiting queues
 * - Queue Scheduling metrics: waiting time, processed counts
 */
@Component
public class IntersectionVehicleQueue {

    // Intersection ID -> LinkedList Deque for waiting vehicles
    private final Map<Long, Deque<Vehicle>> intersectionQueues = new ConcurrentHashMap<>();

    // Processed vehicle counter
    private final AtomicInteger processedCount = new AtomicInteger(0);

    // Queue history for analytics
    private final List<Map<String, Object>> queueHistory = Collections.synchronizedList(new LinkedList<>());

    public void addVehicle(Long intersectionId, Vehicle vehicle) {
        if (intersectionId == null || vehicle == null) return;

        Deque<Vehicle> queue = intersectionQueues.computeIfAbsent(intersectionId, k -> new LinkedList<>());
        synchronized (queue) {
            // Remove if already present in queue to avoid duplicates
            queue.removeIf(v -> Objects.equals(v.getId(), vehicle.getId()));

            if (vehicle.isEmergency()) {
                // Emergency vehicles jump to front of line using Deque.addFirst()
                queue.addFirst(vehicle);
            } else {
                // Regular vehicles queued at tail (FIFO)
                queue.addLast(vehicle);
            }
        }
    }

    public Vehicle processNextVehicle(Long intersectionId) {
        Deque<Vehicle> queue = intersectionQueues.get(intersectionId);
        if (queue == null) return null;

        Vehicle processed = null;
        synchronized (queue) {
            processed = queue.pollFirst();
        }

        if (processed != null) {
            processedCount.incrementAndGet();
            long waitSeconds = 0;
            if (processed.getEntryTime() != null) {
                waitSeconds = Duration.between(processed.getEntryTime(), LocalDateTime.now()).getSeconds();
            }

            Map<String, Object> logEntry = new HashMap<>();
            logEntry.put("vehicleId", processed.getId());
            logEntry.put("registration", processed.getRegistrationNumber());
            logEntry.put("type", processed.getVehicleType().name());
            logEntry.put("intersectionId", intersectionId);
            logEntry.put("processedAt", LocalDateTime.now());
            logEntry.put("waitDurationSeconds", waitSeconds);

            queueHistory.add(0, logEntry);
            if (queueHistory.size() > 100) {
                queueHistory.remove(queueHistory.size() - 1);
            }
        }

        return processed;
    }

    public List<Vehicle> getWaitingVehicles(Long intersectionId) {
        Deque<Vehicle> queue = intersectionQueues.get(intersectionId);
        if (queue == null) return Collections.emptyList();
        synchronized (queue) {
            return new ArrayList<>(queue);
        }
    }

    public int getTotalWaitingCount() {
        return intersectionQueues.values().stream()
                .mapToInt(Deque::size)
                .sum();
    }

    public int getWaitingCount(Long intersectionId) {
        Deque<Vehicle> queue = intersectionQueues.get(intersectionId);
        return queue != null ? queue.size() : 0;
    }

    public int getProcessedCount() {
        return processedCount.get();
    }

    public List<Map<String, Object>> getQueueHistory() {
        return new ArrayList<>(queueHistory);
    }

    public void clearAll() {
        intersectionQueues.values().forEach(Collection::clear);
        processedCount.set(0);
        queueHistory.clear();
    }
}
