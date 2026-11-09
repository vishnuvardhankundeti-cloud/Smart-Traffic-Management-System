package com.traffic.collections;

import com.traffic.model.Vehicle;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Demonstrates:
 * - PriorityQueue with custom Comparator for Emergency Prioritization
 * - Dynamic ranking (Ambulance > Fire Engine > Police > Regular)
 * - FIFO ordering for ties using entry timestamps
 */
@Component
public class EmergencyPriorityQueue {

    private final PriorityQueue<Vehicle> priorityQueue;
    private final Object lock = new Object();

    public EmergencyPriorityQueue() {
        Comparator<Vehicle> emergencyComparator = (v1, v2) -> {
            boolean e1 = v1.isEmergency();
            boolean e2 = v2.isEmergency();

            // 1. Emergency vehicles preempt non-emergency vehicles
            if (e1 && !e2) return -1;
            if (!e1 && e2) return 1;

            // 2. Rank comparison (lower rank integer = higher priority)
            int r1 = v1.getPriority() != null ? v1.getPriority().getRank() : 99;
            int r2 = v2.getPriority() != null ? v2.getPriority().getRank() : 99;
            if (r1 != r2) {
                return Integer.compare(r1, r2);
            }

            // 3. FIFO tie-breaker based on entry time
            if (v1.getEntryTime() != null && v2.getEntryTime() != null) {
                return v1.getEntryTime().compareTo(v2.getEntryTime());
            }

            return Long.compare(v1.getId() != null ? v1.getId() : 0L, v2.getId() != null ? v2.getId() : 0L);
        };

        this.priorityQueue = new PriorityQueue<>(emergencyComparator);
    }

    public void enqueue(Vehicle vehicle) {
        if (vehicle == null) return;
        synchronized (lock) {
            priorityQueue.removeIf(v -> Objects.equals(v.getId(), vehicle.getId()));
            priorityQueue.offer(vehicle);
        }
    }

    public Vehicle dequeue() {
        synchronized (lock) {
            return priorityQueue.poll();
        }
    }

    public Vehicle peek() {
        synchronized (lock) {
            return priorityQueue.peek();
        }
    }

    public boolean remove(Long vehicleId) {
        synchronized (lock) {
            return priorityQueue.removeIf(v -> Objects.equals(v.getId(), vehicleId));
        }
    }

    public int size() {
        synchronized (lock) {
            return priorityQueue.size();
        }
    }

    public boolean isEmpty() {
        synchronized (lock) {
            return priorityQueue.isEmpty();
        }
    }

    /**
     * Returns a snapshot of vehicles sorted in true priority order
     */
    public List<Vehicle> getSnapshot() {
        synchronized (lock) {
            List<Vehicle> list = new ArrayList<>(priorityQueue);
            list.sort(priorityQueue.comparator());
            return list;
        }
    }

    public void clear() {
        synchronized (lock) {
            priorityQueue.clear();
        }
    }
}
