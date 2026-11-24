package com.fleetbridge.boarding.application.service;

import com.fleetbridge.boarding.application.dto.BoardingScanRequest;
import com.fleetbridge.boarding.application.dto.BoardingScanResponse;
import com.fleetbridge.boarding.domain.entity.BoardingLog;
import com.fleetbridge.boarding.infrastructure.repository.BoardingLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardingService {

    private final BoardingLogRepository boardingLogRepository;
    private final StringRedisTemplate redisTemplate;

    public BoardingScanResponse scanQrCode(BoardingScanRequest request, String driverId) {
        try {
            // Expected formats:
            // 1. Dynamic format: "FLEETBRIDGE|EMP|<uuid>|<token>|<timestamp>"
            // 2. Legacy fallback: "FLEETBRIDGE|EMP|<uuid>"
            String payload = request.getQrPayload();
            if (payload == null || !payload.startsWith("FLEETBRIDGE|EMP|")) {
                return BoardingScanResponse.builder()
                        .status("INVALID_QR")
                        .message("The scanned QR code is not a valid FleetBridge pass.")
                        .build();
            }

            String[] parts = payload.split("\\|");
            if (parts.length < 3) {
                return BoardingScanResponse.builder()
                        .status("INVALID_QR")
                        .message("Malformed QR code structure.")
                        .build();
            }

            String employeeIdStr = parts[2];
            UUID employeeId = UUID.fromString(employeeIdStr);

            // Dynamic token validation if present
            if (parts.length >= 4) {
                String token = parts[3];
                String redisKey = QrService.REDIS_KEY_PREFIX + token;
                try {
                    String storedEmployeeId = redisTemplate.opsForValue().get(redisKey);
                    if (storedEmployeeId == null) {
                        return BoardingScanResponse.builder()
                                .status("EXPIRED_PASS")
                                .message("This boarding pass has expired or was already used. Please refresh.")
                                .build();
                    }
                    if (!storedEmployeeId.equals(employeeIdStr)) {
                        return BoardingScanResponse.builder()
                                .status("INVALID_TOKEN")
                                .message("Boarding pass validation mismatch.")
                                .build();
                    }
                    // Invalidate token immediately to prevent replay attack
                    redisTemplate.delete(redisKey);
                } catch (Exception e) {
                    log.warn("Redis validation skipped due to connection error, continuing with DB check: {}", e.getMessage());
                }
            }

            // Check if already boarded on this trip
            boolean alreadyBoarded = boardingLogRepository.existsByTripIdAndEmployeeIdAndStatus(
                    request.getTripId(), employeeId, "SUCCESS");

            if (alreadyBoarded) {
                return BoardingScanResponse.builder()
                        .status("ALREADY_BOARDED")
                        .message("Passenger has already boarded this trip.")
                        .build();
            }

            // Record successful boarding
            BoardingLog logEntry = BoardingLog.builder()
                    .tripId(request.getTripId())
                    .employeeId(employeeId)
                    .scannedBy(UUID.fromString(driverId))
                    .scannedAt(LocalDateTime.now())
                    .status("SUCCESS")
                    .build();

            boardingLogRepository.save(logEntry);

            log.info("Boarding SUCCESS: employeeId={}, tripId={}, driverId={}", employeeId, request.getTripId(), driverId);

            return BoardingScanResponse.builder()
                    .status("SUCCESS")
                    .message("Boarding confirmed!")
                    .build();

        } catch (Exception e) {
            log.error("Error processing QR scan", e);
            return BoardingScanResponse.builder()
                    .status("ERROR")
                    .message("Failed to process QR code.")
                    .build();
        }
    }
}
