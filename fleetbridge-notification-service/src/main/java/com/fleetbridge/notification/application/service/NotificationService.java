package com.fleetbridge.notification.application.service;

import com.fleetbridge.common.dto.ApiResponse;
import com.fleetbridge.notification.application.dto.NotificationRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NotificationService {

    public ApiResponse<String> sendNotification(NotificationRequest request) {
        // Stub implementation: In a real system, this would push to Kafka or call an Email API like SendGrid
        log.info("Sending {} notification to {}. Subject: {}", 
                 request.getType(), request.getRecipient(), request.getSubject());
        log.debug("Message Body: {}", request.getMessage());
        
        return ApiResponse.success("Notification queued successfully", "Success");
    }
}
