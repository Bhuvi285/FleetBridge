package com.fleetbridge.billing.application.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fleetbridge.billing.application.dto.InvoiceRequest;
import com.fleetbridge.billing.application.service.BillingService;
import com.fleetbridge.common.events.TripStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class BillingTripEventListener {

    private final ObjectMapper objectMapper;
    private final BillingService billingService;

    @KafkaListener(topics = "trip-events", groupId = "fleetbridge-billing-group")
    public void handleTripEvent(ConsumerRecord<String, String> record) {
        try {
            TripStatusChangedEvent event = objectMapper.readValue(record.value(), TripStatusChangedEvent.class);
            if ("COMPLETED".equalsIgnoreCase(event.getNewStatus())) {
                log.info("💰 Received COMPLETED trip event for [{}]. Generating automated invoice...", event.getTripId());

                UUID tripId = UUID.fromString(event.getTripId());
                // Fallback default enterprise IDs if not attached to event
                UUID orgId = UUID.nameUUIDFromBytes(("ORG-" + event.getRouteId()).getBytes());
                UUID companyId = UUID.nameUUIDFromBytes(("COMPANY-" + event.getVehicleId()).getBytes());

                InvoiceRequest request = InvoiceRequest.builder()
                        .tripId(tripId)
                        .organizationId(orgId)
                        .travelCompanyId(companyId)
                        .distanceKm(BigDecimal.valueOf(18.5))
                        .build();

                billingService.generateInvoice(request);
            }
        } catch (Exception e) {
            log.warn("Error processing Kafka event in BillingTripEventListener: {}", e.getMessage());
        }
    }
}
