package com.traffic.repository;

import com.traffic.model.Intersection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IntersectionRepository extends JpaRepository<Intersection, Long> {
    Optional<Intersection> findByIntersectionName(String intersectionName);
}
