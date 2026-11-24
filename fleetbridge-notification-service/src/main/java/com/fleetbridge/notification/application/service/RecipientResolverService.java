package com.fleetbridge.notification.application.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class RecipientResolverService {

    private final RestTemplate restTemplate;

    @Value("${fleetbridge.services.fleet-service-url:http://localhost:8082}")
    private String fleetServiceUrl = "http://localhost:8082";

    @Value("${fleetbridge.notification.admin-email:admin@fleetbridge.io}")
    private String adminEmail = "admin@fleetbridge.io";

    public RecipientResolverService(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(2))
                .setReadTimeout(Duration.ofSeconds(2))
                .build();
    }

    /**
     * Resolves driver email from Fleet Service, falling back to an internal pattern if service is unreachable.
     */
    public String resolveDriverEmail(String driverId) {
        if (driverId == null || driverId.isBlank()) {
            return null;
        }
        try {
            String url = (fleetServiceUrl != null ? fleetServiceUrl : "http://localhost:8082") + "/api/v1/fleet/drivers/" + driverId;
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("data")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                if (data != null && data.containsKey("email")) {
                    return (String) data.get("email");
                }
            }
        } catch (Exception e) {
            log.warn("Could not query FleetService for driver {} email (offline/mock): {}", driverId, e.getMessage());
        }
        // Fallback default driver inbox
        return "driver-" + driverId.substring(0, Math.min(8, driverId.length())) + "@fleetbridge.io";
    }

    /**
     * Returns the list of notification recipients for a given trip status change.
     */
    public List<String> resolveRecipientsForTrip(String driverId) {
        List<String> recipients = new ArrayList<>();
        if (adminEmail != null && !adminEmail.isBlank()) {
            recipients.add(adminEmail);
        }
        String driverEmail = resolveDriverEmail(driverId);
        if (driverEmail != null && !driverEmail.isBlank()) {
            recipients.add(driverEmail);
        }
        return recipients;
    }
}
