package com.fleetbridge.trip.application.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetbridge.common.dto.ApiResponse;
import com.fleetbridge.trip.application.dto.TripRequest;
import com.fleetbridge.trip.application.dto.TripResponse;
import com.fleetbridge.trip.application.mapper.TripMapper;
import com.fleetbridge.trip.domain.entity.Route;
import com.fleetbridge.trip.domain.entity.TripInstance;
import com.fleetbridge.trip.infrastructure.outbox.OutboxEvent;
import com.fleetbridge.trip.infrastructure.outbox.OutboxEventRepository;
import com.fleetbridge.trip.infrastructure.repository.RouteRepository;
import com.fleetbridge.trip.infrastructure.repository.TripInstanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripServiceTest {

    @Mock
    private RouteRepository routeRepository;

    @Mock
    private TripInstanceRepository tripInstanceRepository;

    @Mock
    private OutboxEventRepository outboxEventRepository;

    @Mock
    private TripMapper tripMapper;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private TripService tripService;

    private UUID routeId;
    private UUID vehicleId;
    private UUID driverId;
    private Route route;

    @BeforeEach
    void setUp() {
        routeId = UUID.randomUUID();
        vehicleId = UUID.randomUUID();
        driverId = UUID.randomUUID();

        route = Route.builder()
                .id(routeId)
                .name("Whitefield Shuttle")
                .organizationId(UUID.randomUUID())
                .status("ACTIVE")
                .build();
    }

    @Test
    @DisplayName("Should successfully schedule trip and save outbox event")
    void testScheduleTrip_Success() throws Exception {
        LocalDateTime scheduledStart = LocalDateTime.now().plusHours(2);
        TripRequest request = TripRequest.builder()
                .routeId(routeId)
                .vehicleId(vehicleId)
                .driverId(driverId)
                .scheduledStartTime(scheduledStart)
                .build();

        TripInstance savedTrip = TripInstance.builder()
                .id(UUID.randomUUID())
                .route(route)
                .vehicleId(vehicleId)
                .driverId(driverId)
                .scheduledStartTime(scheduledStart)
                .status("SCHEDULED")
                .build();

        TripResponse expectedResponse = TripResponse.builder()
                .id(savedTrip.getId())
                .routeId(routeId)
                .vehicleId(vehicleId)
                .driverId(driverId)
                .scheduledStartTime(scheduledStart)
                .status("SCHEDULED")
                .build();

        when(routeRepository.findById(routeId)).thenReturn(Optional.of(route));
        when(tripInstanceRepository.save(any(TripInstance.class))).thenReturn(savedTrip);
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"mock\":\"event\"}");
        when(tripMapper.toResponse(savedTrip)).thenReturn(expectedResponse);

        ApiResponse<TripResponse> response = tripService.scheduleTrip(request);

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData().getStatus()).isEqualTo("SCHEDULED");
        verify(outboxEventRepository, times(1)).save(any(OutboxEvent.class));
    }

    @Test
    @DisplayName("Should return error when route is not found")
    void testScheduleTrip_RouteNotFound() {
        TripRequest request = TripRequest.builder()
                .routeId(routeId)
                .vehicleId(vehicleId)
                .driverId(driverId)
                .build();

        when(routeRepository.findById(routeId)).thenReturn(Optional.empty());

        ApiResponse<TripResponse> response = tripService.scheduleTrip(request);

        assertThat(response.isSuccess()).isFalse();
        assertThat(response.getMessage()).isEqualTo("Route not found");
        verify(tripInstanceRepository, never()).save(any());
        verify(outboxEventRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update trip status and write outbox transition event")
    void testUpdateTripStatus_Success() throws Exception {
        UUID tripId = UUID.randomUUID();
        TripInstance trip = TripInstance.builder()
                .id(tripId)
                .route(route)
                .vehicleId(vehicleId)
                .driverId(driverId)
                .status("SCHEDULED")
                .build();

        when(tripInstanceRepository.findById(tripId)).thenReturn(Optional.of(trip));
        when(tripInstanceRepository.save(any(TripInstance.class))).thenAnswer(i -> i.getArgument(0));
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"mock\":\"event\"}");

        TripResponse expectedResponse = TripResponse.builder()
                .id(tripId)
                .status("ACTIVE")
                .build();
        when(tripMapper.toResponse(any(TripInstance.class))).thenReturn(expectedResponse);

        ApiResponse<TripResponse> response = tripService.updateTripStatus(tripId, "ACTIVE");

        assertThat(response.isSuccess()).isTrue();
        assertThat(response.getData().getStatus()).isEqualTo("ACTIVE");
        verify(outboxEventRepository, times(1)).save(any(OutboxEvent.class));
    }
}
