package com.fleetbridge.boarding.infrastructure.repository;

import com.fleetbridge.boarding.domain.entity.BoardingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BoardingLogRepository extends JpaRepository<BoardingLog, UUID> {
    
    List<BoardingLog> findByTripId(UUID tripId);
    
    boolean existsByTripIdAndEmployeeIdAndStatus(UUID tripId, UUID employeeId, String status);
}
