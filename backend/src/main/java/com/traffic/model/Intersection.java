package com.traffic.model;

import jakarta.persistence.*;
import java.util.Objects;

@Entity
@Table(name = "intersections")
public class Intersection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String intersectionName;

    private Double latitude;
    private Double longitude;

    private String intersectionType; // e.g., 4-WAY, 3-WAY, ROUNDABOUT
    private String zone;             // e.g., Downtown, North Sector, Airport Way

    public Intersection() {}

    public Intersection(Long id, String intersectionName, Double latitude, Double longitude, String intersectionType, String zone) {
        this.id = id;
        this.intersectionName = intersectionName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.intersectionType = intersectionType;
        this.zone = zone;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIntersectionName() {
        return intersectionName;
    }

    public void setIntersectionName(String intersectionName) {
        this.intersectionName = intersectionName;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getIntersectionType() {
        return intersectionType;
    }

    public void setIntersectionType(String intersectionType) {
        this.intersectionType = intersectionType;
    }

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Intersection that = (Intersection) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
