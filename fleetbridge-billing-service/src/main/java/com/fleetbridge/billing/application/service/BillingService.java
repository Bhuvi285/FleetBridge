package com.fleetbridge.billing.application.service;

import com.fleetbridge.billing.application.dto.InvoiceRequest;
import com.fleetbridge.billing.application.dto.InvoiceResponse;
import com.fleetbridge.billing.domain.entity.ContractRate;
import com.fleetbridge.billing.domain.entity.Invoice;
import com.fleetbridge.billing.infrastructure.repository.ContractRateRepository;
import com.fleetbridge.billing.infrastructure.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final ContractRateRepository contractRateRepository;

    private static final BigDecimal DEFAULT_BASE_RATE = BigDecimal.valueOf(500.00);
    private static final BigDecimal DEFAULT_RATE_PER_KM = BigDecimal.valueOf(25.00);
    private static final BigDecimal DEFAULT_TAX_PERCENT = BigDecimal.valueOf(18.00);

    @Transactional
    public InvoiceResponse generateInvoice(InvoiceRequest request) {
        // Prevent duplicate invoice for the same trip
        return invoiceRepository.findByTripId(request.getTripId())
                .map(this::mapToResponse)
                .orElseGet(() -> createInvoice(request));
    }

    private InvoiceResponse createInvoice(InvoiceRequest request) {
        BigDecimal distanceKm = request.getDistanceKm() != null ? request.getDistanceKm() : BigDecimal.valueOf(15.0);

        ContractRate rate = contractRateRepository.findByOrganizationIdAndTravelCompanyId(
                request.getOrganizationId(), request.getTravelCompanyId())
                .orElse(null);

        BigDecimal baseRate = rate != null ? rate.getBaseTripRate() : DEFAULT_BASE_RATE;
        BigDecimal ratePerKm = rate != null ? rate.getRatePerKm() : DEFAULT_RATE_PER_KM;
        BigDecimal taxPercent = rate != null ? rate.getTaxPercentage() : DEFAULT_TAX_PERCENT;

        BigDecimal baseAmount = baseRate.setScale(2, RoundingMode.HALF_UP);
        BigDecimal distanceAmount = distanceKm.multiply(ratePerKm).setScale(2, RoundingMode.HALF_UP);
        BigDecimal subtotal = baseAmount.add(distanceAmount);
        BigDecimal taxAmount = subtotal.multiply(taxPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(taxAmount);

        String invoiceNumber = "INV-" + LocalDate.now().getYear() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .tripId(request.getTripId())
                .organizationId(request.getOrganizationId())
                .travelCompanyId(request.getTravelCompanyId())
                .distanceKm(distanceKm)
                .baseAmount(baseAmount)
                .distanceAmount(distanceAmount)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .status("ISSUED")
                .issuedAt(LocalDateTime.now())
                .build();

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Generated Invoice [{}] for trip [{}], total: INR {}", invoiceNumber, request.getTripId(), totalAmount);

        return mapToResponse(saved);
    }

    public InvoiceResponse getInvoice(UUID id) {
        return invoiceRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + id));
    }

    public List<InvoiceResponse> getInvoicesByOrganization(UUID organizationId) {
        return invoiceRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public InvoiceResponse markAsPaid(UUID id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + id));
        invoice.setStatus("PAID");
        invoice.setPaidAt(LocalDateTime.now());
        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice [{}] marked as PAID", invoice.getInvoiceNumber());
        return mapToResponse(saved);
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .tripId(invoice.getTripId())
                .organizationId(invoice.getOrganizationId())
                .travelCompanyId(invoice.getTravelCompanyId())
                .distanceKm(invoice.getDistanceKm())
                .baseAmount(invoice.getBaseAmount())
                .distanceAmount(invoice.getDistanceAmount())
                .taxAmount(invoice.getTaxAmount())
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .issuedAt(invoice.getIssuedAt())
                .paidAt(invoice.getPaidAt())
                .build();
    }
}
