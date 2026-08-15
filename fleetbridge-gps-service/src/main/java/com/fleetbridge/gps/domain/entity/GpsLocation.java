package com.fleetbridge.gps.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gps_locations", indexes = {
        @Index(name = "idx_gps_trip_time", columnList = "trip_id, recorded_at DESC")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GpsLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "trip_id", nullable = false)
    private UUID tripId;

    @Column(name = "vehicle_id", nullable = false)
    private UUID vehicleId;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    /** Speed in km/h */
    @Column(name = "speed_kmh")
    private Double speedKmh;

    /** Heading in degrees (0-360) */
    private Double heading;

    /** GPS accuracy in metres */
    private Double accuracy;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
