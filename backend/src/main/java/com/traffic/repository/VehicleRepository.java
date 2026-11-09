package com.traffic.repository;

import com.traffic.model.Vehicle;
import com.traffic.model.VehicleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
    boolean existsByRegistrationNumber(String registrationNumber);
    List<Vehicle> findByVehicleType(VehicleType vehicleType);
    List<Vehicle> findByCurrentRoadId(Long roadId);
    List<Vehicle> findByStatus(String status);
    long countByVehicleTypeIn(List<VehicleType> emergencyTypes);
}
