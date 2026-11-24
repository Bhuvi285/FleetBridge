package com.fleetbridge.notification.application.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetbridge.common.events.TripStatusChangedEvent;
import com.fleetbridge.notification.application.service.EmailService;
import com.fleetbridge.notification.application.service.RecipientResolverService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class TripEventListener {

    private final ObjectMapper objectMapper;
    private final EmailService emailService;
    private final RecipientResolverService recipientResolverService;

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

        String subject;
        String body;

        switch (newStatus) {
            case "SCHEDULED" -> {
                subject = "New Trip Scheduled";
                body = String.format("A new trip [%s] has been scheduled for route [%s] with driver [%s].",
                        tripId, event.getRouteId(), event.getDriverId());
            }
            case "ACTIVE" -> {
                subject = "Trip Is Now Active";
                body = String.format("Trip [%s] is underway! Vehicle [%s] is currently in transit on route [%s].",
                        tripId, event.getVehicleId(), event.getRouteId());
            }
            case "COMPLETED" -> {
                subject = "Trip Completed Successfully";
                body = String.format("Trip [%s] has been completed successfully. All passengers arrived at their destination.",
                        tripId);
            }
            case "CANCELLED" -> {
                subject = "⚠️ Trip Cancelled";
                body = String.format("ALERT: Trip [%s] has been cancelled. Please check the FleetBridge dashboard for details.",
                        tripId);
            }
            default -> {
                log.warn("⚠️ Unhandled trip status '{}' for trip [{}]. No notification sent.", newStatus, tripId);
                return;
            }
        }

        sendNotifications(event.getDriverId(), subject, body);
    }

    /**
     * Resolves target recipients and sends notification.
     */
    private void sendNotifications(String driverId, String subject, String body) {
        List<String> recipients = recipientResolverService.resolveRecipientsForTrip(driverId);
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("📧 [NOTIFICATION SERVICE] Dispatching to {} recipient(s):", recipients.size());
        log.info("   Subject : {}", subject);
        log.info("   Recipients: {}", recipients);
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

        for (String recipient : recipients) {
            emailService.sendEmail(recipient, subject, body);
        }
    }
}
