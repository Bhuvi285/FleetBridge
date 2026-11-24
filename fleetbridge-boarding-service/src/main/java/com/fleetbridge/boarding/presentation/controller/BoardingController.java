package com.fleetbridge.boarding.presentation.controller;

import com.fleetbridge.common.dto.ApiResponse;
import com.fleetbridge.boarding.application.dto.BoardingScanRequest;
import com.fleetbridge.boarding.application.dto.BoardingScanResponse;
import com.fleetbridge.boarding.application.service.BoardingService;
import com.fleetbridge.boarding.application.service.QrService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/boarding")
@RequiredArgsConstructor
public class BoardingController {

    private final QrService qrService;
    private final BoardingService boardingService;

    /**
     * GET /api/v1/boarding/qr/{employeeId}
     * Returns a base64 encoded PNG of the employee's boarding pass QR code.
     */
    @GetMapping("/qr/{employeeId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> getEmployeeQrCode(@PathVariable("employeeId") UUID employeeId) {
        String base64Image = qrService.generateQrCodeForEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("qrCodeDataUrl", base64Image),
                "QR code generated successfully"
        ));
    }

    /**
     * POST /api/v1/boarding/scan
     * Called by the Driver PWA when a QR code is scanned.
     */
    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<BoardingScanResponse>> scanQrCode(
            @Valid @RequestBody BoardingScanRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        
        String driverId = jwt.getSubject();
        BoardingScanResponse response = boardingService.scanQrCode(request, driverId);
        
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }
}
