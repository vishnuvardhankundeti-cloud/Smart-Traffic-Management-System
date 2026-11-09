package com.traffic.model;

public enum VehicleType {
    CAR,
    BIKE,
    BUS,
    TRUCK,
    AMBULANCE,
    FIRE_ENGINE,
    POLICE_VEHICLE;

    public boolean isEmergency() {
        return this == AMBULANCE || this == FIRE_ENGINE || this == POLICE_VEHICLE;
    }
}
