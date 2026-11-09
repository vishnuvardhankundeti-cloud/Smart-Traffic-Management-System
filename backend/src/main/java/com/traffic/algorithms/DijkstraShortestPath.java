package com.traffic.algorithms;

import com.traffic.collections.RoadEdge;
import com.traffic.collections.RoadNetworkGraph;
import com.traffic.model.Intersection;
import com.traffic.model.Road;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Implements Dijkstra's Shortest Path Algorithm using Java Collections:
 * - PriorityQueue for greedy lowest-cost node expansion (O(E log V))
 * - HashMap for minimum cost table, predecessor node map, and visited tracking
 * - HashSet for finalized nodes
 * - ArrayList for constructed route sequence
 */
@Service
public class DijkstraShortestPath {

    private final RoadNetworkGraph graph;

    public DijkstraShortestPath(RoadNetworkGraph graph) {
        this.graph = graph;
    }

    public static class PathResult {
        private final boolean found;
        private final List<Intersection> nodeSequence;
        private final List<Road> roadSequence;
        private final double totalDistanceKm;
        private final double estimatedTravelTimeMinutes;
        private final double calculatedCost;
        private final OptimizationCriteria criteria;

        public PathResult(boolean found, List<Intersection> nodeSequence, List<Road> roadSequence,
                          double totalDistanceKm, double estimatedTravelTimeMinutes, double calculatedCost,
                          OptimizationCriteria criteria) {
            this.found = found;
            this.nodeSequence = nodeSequence;
            this.roadSequence = roadSequence;
            this.totalDistanceKm = Math.round(totalDistanceKm * 100.0) / 100.0;
            this.estimatedTravelTimeMinutes = Math.round(estimatedTravelTimeMinutes * 10.0) / 10.0;
            this.calculatedCost = Math.round(calculatedCost * 100.0) / 100.0;
            this.criteria = criteria;
        }

        public static PathResult notFound(OptimizationCriteria criteria) {
            return new PathResult(false, Collections.emptyList(), Collections.emptyList(), 0, 0, 0, criteria);
        }

        public boolean isFound() { return found; }
        public List<Intersection> getNodeSequence() { return nodeSequence; }
        public List<Road> getRoadSequence() { return roadSequence; }
        public double getTotalDistanceKm() { return totalDistanceKm; }
        public double getEstimatedTravelTimeMinutes() { return estimatedTravelTimeMinutes; }
        public double getCalculatedCost() { return calculatedCost; }
        public OptimizationCriteria getCriteria() { return criteria; }
    }

    private static class NodeDistance implements Comparable<NodeDistance> {
        final Long intersectionId;
        final double distance;

        NodeDistance(Long intersectionId, double distance) {
            this.intersectionId = intersectionId;
            this.distance = distance;
        }

        @Override
        public int compareTo(NodeDistance other) {
            return Double.compare(this.distance, other.distance);
        }
    }

    /**
     * Executes Dijkstra's algorithm from start to destination intersection.
     * Optionally accepts an excludedRoadId to calculate an alternative route.
     */
    public PathResult findOptimalPath(Long startId, Long endId, OptimizationCriteria criteria, Long excludedRoadId) {
        if (startId == null || endId == null || startId.equals(endId)) {
            Intersection start = graph.getIntersection(startId);
            if (start != null && startId.equals(endId)) {
                return new PathResult(true, List.of(start), Collections.emptyList(), 0.0, 0.0, 0.0, criteria);
            }
            return PathResult.notFound(criteria);
        }

        // PriorityQueue to always pop the node with lowest accumulated cost
        PriorityQueue<NodeDistance> pq = new PriorityQueue<>();

        // Maps to track costs, predecessors, and edges traversed
        Map<Long, Double> minCostMap = new HashMap<>();
        Map<Long, Long> prevNodeMap = new HashMap<>();
        Map<Long, RoadEdge> prevEdgeMap = new HashMap<>();
        Set<Long> visited = new HashSet<>();

        // Initialize source
        minCostMap.put(startId, 0.0);
        pq.offer(new NodeDistance(startId, 0.0));

        while (!pq.isEmpty()) {
            NodeDistance current = pq.poll();
            Long u = current.intersectionId;

            if (visited.contains(u)) continue;
            visited.add(u);

            if (u.equals(endId)) {
                break; // Target reached
            }

            for (RoadEdge edge : graph.getOutgoingEdges(u)) {
                // Skip excluded road when searching for alternative path
                if (excludedRoadId != null && edge.getRoad().getId().equals(excludedRoadId)) {
                    continue;
                }

                Long v = edge.getDestination().getId();
                if (visited.contains(v)) continue;

                double edgeWeight = computeEdgeWeight(edge, criteria);
                double newCost = minCostMap.get(u) + edgeWeight;

                if (newCost < minCostMap.getOrDefault(v, Double.MAX_VALUE)) {
                    minCostMap.put(v, newCost);
                    prevNodeMap.put(v, u);
                    prevEdgeMap.put(v, edge);
                    pq.offer(new NodeDistance(v, newCost));
                }
            }
        }

        if (!minCostMap.containsKey(endId)) {
            return PathResult.notFound(criteria);
        }

        // Reconstruct path
        List<Intersection> nodes = new ArrayList<>();
        List<Road> roads = new ArrayList<>();
        double totalDistance = 0.0;
        double totalTravelTime = 0.0;

        Long curr = endId;
        while (curr != null) {
            Intersection intersection = graph.getIntersection(curr);
            if (intersection != null) {
                nodes.add(intersection);
            }
            RoadEdge edge = prevEdgeMap.get(curr);
            if (edge != null) {
                roads.add(edge.getRoad());
                totalDistance += edge.getDistanceKm();
                totalTravelTime += edge.getDynamicTravelTimeMinutes();
            }
            curr = prevNodeMap.get(curr);
        }

        Collections.reverse(nodes);
        Collections.reverse(roads);

        return new PathResult(true, nodes, roads, totalDistance, totalTravelTime, minCostMap.get(endId), criteria);
    }

    private double computeEdgeWeight(RoadEdge edge, OptimizationCriteria criteria) {
        if (criteria == null) criteria = OptimizationCriteria.SHORTEST_DISTANCE;

        return switch (criteria) {
            case SHORTEST_DISTANCE -> edge.getDistanceKm();
            case LOWEST_TRAFFIC -> edge.getCongestionWeight();
            case MIN_TRAVEL_TIME -> edge.getDynamicTravelTimeMinutes();
        };
    }
}
