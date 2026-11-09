package com.traffic.model;

public enum VehiclePriority {
    EMERGENCY_HIGH(1),     // e.g. Ambulance with critical patient
    EMERGENCY_MEDIUM(2),   // e.g. Fire Engine en route
    EMERGENCY_LOW(3),      // e.g. Police cruiser
    HIGH(4),               // e.g. Public transit bus
    NORMAL(5),             // e.g. Standard car, bike
    LOW(6);                // e.g. Heavy commercial logistics

    private final int rank;

    VehiclePriority(int rank) {
        this.rank = rank;
    }

    public int getRank() {
        return rank;
    }
}
