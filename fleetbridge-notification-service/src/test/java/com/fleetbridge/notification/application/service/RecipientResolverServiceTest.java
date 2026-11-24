package com.fleetbridge.notification.application.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RecipientResolverServiceTest {

    @Test
    @DisplayName("Should resolve admin and fallback driver emails when FleetService is unreachable")
    void testResolveRecipientsForTrip_Fallback() {
        RecipientResolverService resolver = new RecipientResolverService(new RestTemplateBuilder());

        String driverId = "00000000-1111-2222-3333-444444444444";
        List<String> recipients = resolver.resolveRecipientsForTrip(driverId);

        assertThat(recipients).isNotEmpty();
        assertThat(recipients).contains("admin@fleetbridge.io");
        assertThat(recipients.stream().anyMatch(r -> r.contains("driver-00000000@fleetbridge.io"))).isTrue();
    }
}
