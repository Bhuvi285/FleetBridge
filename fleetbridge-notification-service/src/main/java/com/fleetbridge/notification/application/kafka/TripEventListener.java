package com.fleetbridge.notification.application.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetbridge.common.events.TripStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.fleetbridge.notification.application.service.EmailService;

@Component
@RequiredArgsConstructor
@Slf4j
public class TripEventListener {

    private final ObjectMapper objectMapper;
    private final EmailService emailService;

    @KafkaListener(topics = "trip-events", groupId = "fleetbridge-notification-group")
    public void handleTripEvent(ConsumerRecord<String, String> record) {
        log.info("📩 Received Kafka event on topic '{}' for trip ID: {}", record.topic(), record.key());
        try {
            TripStatusChangedEvent event = objectMapper.readValue(record.value(), TripStatusChangedEvent.class);
            processEvent(event);
        } catch (Exception e) {
            log.error("❌ Failed to deserialize TripStatusChangedEvent from Kafka message: {}", record.value(), e);
        }
    }

    private void processEvent(TripStatusChangedEvent event) {
        String tripId   = event.getTripId();
        String oldStatus = event.getOldStatus() != null ? event.getOldStatus() : "NONE";
        String newStatus = event.getNewStatus();

        log.info("🔄 Trip [{}] status changed: {} → {}", tripId, oldStatus, newStatus);

        switch (newStatus) {
            case "SCHEDULED" -> sendNotification(
                "New Trip Scheduled",
                "A new trip [" + tripId + "] has been scheduled for route [" + event.getRouteId() + "]."
            );
            case "ACTIVE" -> sendNotification(
                "Trip Is Now Active",
                "Trip [" + tripId + "] is underway! Vehicle [" + event.getVehicleId() + "] is now on the road."
            );
            case "COMPLETED" -> sendNotification(
                "Trip Completed Successfully",
                "Trip [" + tripId + "] has been completed. Employees have arrived at their destination."
            );
            case "CANCELLED" -> sendNotification(
                "⚠️ Trip Cancelled",
                "ALERT: Trip [" + tripId + "] has been cancelled. Please make alternative arrangements."
            );
            default -> log.warn("⚠️ Unhandled trip status '{}' for trip [{}]. No notification sent.", newStatus, tripId);
        }
    }

    /**
     * Sends an email notification using SendGrid.
     */
    private void sendNotification(String subject, String body) {
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("📧 [NOTIFICATION SERVICE] Processing notification:");
        log.info("   Subject : {}", subject);
        log.info("   Body    : {}", body);
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        // In a real system, we'd look up the Organization Admin's email or the Driver's email based on the trip.
        // For demonstration, we send it to a mock admin email.
        String recipientEmail = "admin@fleetbridge.io"; 
        emailService.sendEmail(recipientEmail, subject, body);
    }
}
