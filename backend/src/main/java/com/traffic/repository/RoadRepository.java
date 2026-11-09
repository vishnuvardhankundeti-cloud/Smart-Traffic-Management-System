package com.traffic.repository;

import com.traffic.model.Road;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadRepository extends JpaRepository<Road, Long> {
    List<Road> findByRoadStatus(String roadStatus);
    List<Road> findByStartIntersectionIdOrEndIntersectionId(Long startId, Long endId);
}
