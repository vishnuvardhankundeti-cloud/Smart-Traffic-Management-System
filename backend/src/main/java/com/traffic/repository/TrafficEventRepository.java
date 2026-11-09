package com.traffic.repository;

import com.traffic.model.TrafficEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrafficEventRepository extends JpaRepository<TrafficEvent, Long> {
    List<TrafficEvent> findTop50ByOrderByTimestampDesc();
}
