package com.fleetbridge.boarding.application.service;

import com.fleetbridge.boarding.application.dto.BoardingScanRequest;
import com.fleetbridge.boarding.application.dto.BoardingScanResponse;
import com.fleetbridge.boarding.domain.entity.BoardingLog;
import com.fleetbridge.boarding.infrastructure.repository.BoardingLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BoardingServiceTest {

    @Mock
    private BoardingLogRepository boardingLogRepository;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private BoardingService boardingService;

    private UUID tripId;
    private UUID employeeId;
    private UUID driverId;

    @BeforeEach
    void setUp() {
        tripId = UUID.randomUUID();
        employeeId = UUID.randomUUID();
        driverId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should confirm boarding when token is valid and passenger has not boarded")
    void testScanQrCode_Success() {
        String token = "abc123token";
        String payload = String.format("FLEETBRIDGE|EMP|%s|%s|1700000000", employeeId, token);
        String redisKey = QrService.REDIS_KEY_PREFIX + token;

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(redisKey)).thenReturn(employeeId.toString());
        when(boardingLogRepository.existsByTripIdAndEmployeeIdAndStatus(tripId, employeeId, "SUCCESS"))
                .thenReturn(false);

        BoardingScanRequest request = BoardingScanRequest.builder()
                .tripId(tripId)
                .qrPayload(payload)
                .build();

        BoardingScanResponse response = boardingService.scanQrCode(request, driverId.toString());

        assertThat(response.getStatus()).isEqualTo("SUCCESS");
        assertThat(response.getMessage()).isEqualTo("Boarding confirmed!");

        verify(redisTemplate, times(1)).delete(redisKey); // Token invalidated
        verify(boardingLogRepository, times(1)).save(any(BoardingLog.class));
    }

    @Test
    @DisplayName("Should reject boarding when passenger has already boarded the trip")
    void testScanQrCode_AlreadyBoarded() {
        String token = "abc123token";
        String payload = String.format("FLEETBRIDGE|EMP|%s|%s|1700000000", employeeId, token);
        String redisKey = QrService.REDIS_KEY_PREFIX + token;

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(redisKey)).thenReturn(employeeId.toString());
        when(boardingLogRepository.existsByTripIdAndEmployeeIdAndStatus(tripId, employeeId, "SUCCESS"))
                .thenReturn(true);

        BoardingScanRequest request = BoardingScanRequest.builder()
                .tripId(tripId)
                .qrPayload(payload)
                .build();

        BoardingScanResponse response = boardingService.scanQrCode(request, driverId.toString());

        assertThat(response.getStatus()).isEqualTo("ALREADY_BOARDED");
        verify(boardingLogRepository, never()).save(any(BoardingLog.class));
    }

    @Test
    @DisplayName("Should reject expired or already-used boarding pass")
    void testScanQrCode_ExpiredPass() {
        String token = "expiredToken";
        String payload = String.format("FLEETBRIDGE|EMP|%s|%s|1700000000", employeeId, token);
        String redisKey = QrService.REDIS_KEY_PREFIX + token;

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(redisKey)).thenReturn(null); // Expired or missing

        BoardingScanRequest request = BoardingScanRequest.builder()
                .tripId(tripId)
                .qrPayload(payload)
                .build();

        BoardingScanResponse response = boardingService.scanQrCode(request, driverId.toString());

        assertThat(response.getStatus()).isEqualTo("EXPIRED_PASS");
        verify(boardingLogRepository, never()).save(any(BoardingLog.class));
    }

    @Test
    @DisplayName("Should reject invalid QR payload structure")
    void testScanQrCode_InvalidPayload() {
        BoardingScanRequest request = BoardingScanRequest.builder()
                .tripId(tripId)
                .qrPayload("INVALID_TEXT_CODE")
                .build();

        BoardingScanResponse response = boardingService.scanQrCode(request, driverId.toString());

        assertThat(response.getStatus()).isEqualTo("INVALID_QR");
        verify(boardingLogRepository, never()).save(any(BoardingLog.class));
    }
}
