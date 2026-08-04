package com.fleetbridge.notification.presentation;

import com.fleetbridge.common.dto.ApiResponse;
import com.fleetbridge.notification.application.dto.NotificationRequest;
import com.fleetbridge.notification.application.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<String>> sendNotification(@Valid @RequestBody NotificationRequest request) {
        ApiResponse<String> response = notificationService.sendNotification(request);
        return ResponseEntity.ok(response);
    }
}