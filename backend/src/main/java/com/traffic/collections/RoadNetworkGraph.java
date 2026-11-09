package com.traffic.collections;

import com.traffic.model.Intersection;
import com.traffic.model.Road;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Demonstrates:
 * - HashMap for adjacency list representation and ID lookups
 * - HashSet for duplicate edge detection
 * - ArrayList for road listings and iteration
 */
@Component
public class RoadNetworkGraph {

    // Adjacency List: Intersection ID -> List of Outgoing Road Edges
    private final Map<Long, List<RoadEdge>> adjacencyList = new ConcurrentHashMap<>();

    // Quick lookup maps: ID -> Entity
    private final Map<Long, Intersection> intersectionMap = new ConcurrentHashMap<>();
    private final Map<Long, Road> roadMap = new ConcurrentHashMap<>();

    // HashSet to prevent duplicate road connection registrations
    private final Set<String> registeredConnections = Collections.synchronizedSet(new HashSet<>());

    // ArrayList of all active roads
    private final List<Road> allRoads = Collections.synchronizedList(new ArrayList<>());

    public synchronized void rebuild(List<Intersection> intersections, List<Road> roads) {
        adjacencyList.clear();
        intersectionMap.clear();
        roadMap.clear();
        registeredConnections.clear();
        allRoads.clear();

        for (Intersection intersection : intersections) {
            addIntersection(intersection);
        }

        for (Road road : roads) {
            addRoad(road);
        }
    }

    public void addIntersection(Intersection intersection) {
        if (intersection == null || intersection.getId() == null) return;
        intersectionMap.put(intersection.getId(), intersection);
        adjacencyList.putIfAbsent(intersection.getId(), new ArrayList<>());
    }

    public synchronized void addRoad(Road road) {
        if (road == null || road.getStartIntersection() == null || road.getEndIntersection() == null) return;

        Long u = road.getStartIntersection().getId();
        Long v = road.getEndIntersection().getId();

        String connectionKey = u + "->" + v + ":" + road.getRoadName();
        if (registeredConnections.contains(connectionKey)) {
            return; // Duplicate avoided via HashSet
        }
        registeredConnections.add(connectionKey);

        intersectionMap.putIfAbsent(u, road.getStartIntersection());
        intersectionMap.putIfAbsent(v, road.getEndIntersection());
        roadMap.put(road.getId(), road);
        allRoads.add(road);

        adjacencyList.computeIfAbsent(u, k -> new ArrayList<>())
                     .add(new RoadEdge(road, road.getStartIntersection(), road.getEndIntersection()));

        // Also add reverse edge for bidirectional road representation
        adjacencyList.computeIfAbsent(v, k -> new ArrayList<>())
                     .add(new RoadEdge(road, road.getEndIntersection(), road.getStartIntersection()));
    }

    public List<RoadEdge> getOutgoingEdges(Long intersectionId) {
        return adjacencyList.getOrDefault(intersectionId, Collections.emptyList());
    }

    public Intersection getIntersection(Long intersectionId) {
        return intersectionMap.get(intersectionId);
    }

    public Road getRoad(Long roadId) {
        return roadMap.get(roadId);
    }

    public Collection<Intersection> getAllIntersections() {
        return intersectionMap.values();
    }

    public List<Road> getAllRoads() {
        return new ArrayList<>(allRoads);
    }

    public Map<Long, List<RoadEdge>> getAdjacencyList() {
        return Collections.unmodifiableMap(adjacencyList);
    }
}
