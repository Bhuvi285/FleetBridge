package com.fleetbridge.boarding.application.service;

import com.fleetbridge.boarding.application.dto.BoardingScanRequest;
import com.fleetbridge.boarding.application.dto.BoardingScanResponse;
import com.fleetbridge.boarding.domain.entity.BoardingLog;
import com.fleetbridge.boarding.infrastructure.repository.BoardingLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoardingService {

    private final BoardingLogRepository boardingLogRepository;

    public BoardingScanResponse scanQrCode(BoardingScanRequest request, String driverId) {
        try {
            // Payload format: "FLEETBRIDGE|EMP|UUID"
            String payload = request.getQrPayload();
            if (payload == null || !payload.startsWith("FLEETBRIDGE|EMP|")) {
                return BoardingScanResponse.builder()
                        .status("INVALID_QR")
                        .message("The scanned QR code is not a valid FleetBridge pass.")
                        .build();
            }

            String employeeIdStr = payload.split("\\|")[2];
            UUID employeeId = UUID.fromString(employeeIdStr);

            // Check if already boarded
            boolean alreadyBoarded = boardingLogRepository.existsByTripIdAndEmployeeIdAndStatus(
                    request.getTripId(), employeeId, "SUCCESS");

            if (alreadyBoarded) {
                return BoardingScanResponse.builder()
                        .status("ALREADY_BOARDED")
                        .message("Passenger has already boarded this trip.")
                        .build();
            }

            // In a real system, we'd call the org-service here to verify if the employee
            // is actually assigned to this specific trip/route. 
            // For now, we assume any valid FleetBridge employee QR is allowed to board.

            // Record successful boarding
            BoardingLog logEntry = BoardingLog.builder()
                    .tripId(request.getTripId())
                    .employeeId(employeeId)
                    .scannedBy(UUID.fromString(driverId))
                    .scannedAt(LocalDateTime.now())
                    .status("SUCCESS")
                    .build();

            boardingLogRepository.save(logEntry);

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
