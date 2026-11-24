package com.fleetbridge.boarding.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "boarding_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID tripId;

    @Column(nullable = false)
    private UUID employeeId;

    @Column(nullable = false)
    private UUID scannedBy;

    @Column(nullable = false)
    private LocalDateTime scannedAt;

    @Column(nullable = false)
    private String status;
}
