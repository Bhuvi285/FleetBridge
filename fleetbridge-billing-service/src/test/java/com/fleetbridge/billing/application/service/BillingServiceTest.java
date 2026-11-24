package com.fleetbridge.billing.application.service;

import com.fleetbridge.billing.application.dto.InvoiceRequest;
import com.fleetbridge.billing.application.dto.InvoiceResponse;
import com.fleetbridge.billing.domain.entity.Invoice;
import com.fleetbridge.billing.infrastructure.repository.ContractRateRepository;
import com.fleetbridge.billing.infrastructure.repository.InvoiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private ContractRateRepository contractRateRepository;

    @InjectMocks
    private BillingService billingService;

    private UUID tripId;
    private UUID orgId;
    private UUID companyId;

    @BeforeEach
    void setUp() {
        tripId = UUID.randomUUID();
        orgId = UUID.randomUUID();
        companyId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should generate invoice with correct pricing calculation and tax")
    void testGenerateInvoice_Calculation() {
        InvoiceRequest request = InvoiceRequest.builder()
                .tripId(tripId)
                .organizationId(orgId)
                .travelCompanyId(companyId)
                .distanceKm(BigDecimal.valueOf(20.0))
                .build();

        when(invoiceRepository.findByTripId(tripId)).thenReturn(Optional.empty());
        when(contractRateRepository.findByOrganizationIdAndTravelCompanyId(orgId, companyId))
                .thenReturn(Optional.empty()); // Uses default rates: base 500, perKm 25, tax 18%

        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> {
            Invoice inv = invocation.getArgument(0);
            inv.setId(UUID.randomUUID());
            return inv;
        });

        InvoiceResponse response = billingService.generateInvoice(request);

        assertThat(response).isNotNull();
        assertThat(response.getTripId()).isEqualTo(tripId);
        assertThat(response.getBaseAmount()).isEqualByComparingTo("500.00");
        assertThat(response.getDistanceAmount()).isEqualByComparingTo("500.00"); // 20km * 25
        assertThat(response.getTaxAmount()).isEqualByComparingTo("180.00");      // 18% of 1000
        assertThat(response.getTotalAmount()).isEqualByComparingTo("1180.00");  // 1000 + 180
        assertThat(response.getStatus()).isEqualTo("ISSUED");

        verify(invoiceRepository, times(1)).save(any(Invoice.class));
    }

    @Test
    @DisplayName("Should return existing invoice if trip is already invoiced (Idempotency)")
    void testGenerateInvoice_AlreadyExists() {
        Invoice existing = Invoice.builder()
                .id(UUID.randomUUID())
                .invoiceNumber("INV-2026-TEST01")
                .tripId(tripId)
                .organizationId(orgId)
                .travelCompanyId(companyId)
                .totalAmount(BigDecimal.valueOf(1000.00))
                .status("ISSUED")
                .build();

        when(invoiceRepository.findByTripId(tripId)).thenReturn(Optional.of(existing));

        InvoiceRequest request = InvoiceRequest.builder()
                .tripId(tripId)
                .organizationId(orgId)
                .travelCompanyId(companyId)
                .build();

        InvoiceResponse response = billingService.generateInvoice(request);

        assertThat(response).isNotNull();
        assertThat(response.getInvoiceNumber()).isEqualTo("INV-2026-TEST01");
        verify(invoiceRepository, never()).save(any(Invoice.class));
    }

    @Test
    @DisplayName("Should transition invoice to PAID status")
    void testMarkAsPaid() {
        UUID invoiceId = UUID.randomUUID();
        Invoice invoice = Invoice.builder()
                .id(invoiceId)
                .invoiceNumber("INV-2026-PAID01")
                .status("ISSUED")
                .issuedAt(LocalDateTime.now())
                .build();

        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InvoiceResponse response = billingService.markAsPaid(invoiceId);

        assertThat(response.getStatus()).isEqualTo("PAID");
        assertThat(response.getPaidAt()).isNotNull();
        verify(invoiceRepository, times(1)).save(invoice);
    }
}
