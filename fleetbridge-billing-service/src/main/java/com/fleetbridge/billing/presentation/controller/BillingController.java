package com.fleetbridge.billing.presentation.controller;

import com.fleetbridge.billing.application.dto.InvoiceRequest;
import com.fleetbridge.billing.application.dto.InvoiceResponse;
import com.fleetbridge.billing.application.service.BillingService;
import com.fleetbridge.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @PostMapping("/invoices")
    public ResponseEntity<ApiResponse<InvoiceResponse>> generateInvoice(@Valid @RequestBody InvoiceRequest request) {
        InvoiceResponse response = billingService.generateInvoice(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Invoice generated successfully"));
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoice(@PathVariable("id") UUID id) {
        InvoiceResponse response = billingService.getInvoice(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Invoice retrieved"));
    }

    @GetMapping("/invoices/organization/{orgId}")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getInvoicesByOrganization(@PathVariable("orgId") UUID orgId) {
        List<InvoiceResponse> list = billingService.getInvoicesByOrganization(orgId);
        return ResponseEntity.ok(ApiResponse.success(list, "Invoices retrieved for organization"));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getAllInvoices() {
        List<InvoiceResponse> list = billingService.getAllInvoices();
        return ResponseEntity.ok(ApiResponse.success(list, "All invoices retrieved"));
    }

    @PutMapping("/invoices/{id}/pay")
    public ResponseEntity<ApiResponse<InvoiceResponse>> markAsPaid(@PathVariable("id") UUID id) {
        InvoiceResponse response = billingService.markAsPaid(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Invoice marked as paid"));
    }
}
