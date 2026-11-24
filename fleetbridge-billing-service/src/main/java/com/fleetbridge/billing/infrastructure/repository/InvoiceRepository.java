package com.fleetbridge.billing.infrastructure.repository;

import com.fleetbridge.billing.domain.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    Optional<Invoice> findByTripId(UUID tripId);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByOrganizationId(UUID organizationId);
    List<Invoice> findByTravelCompanyId(UUID travelCompanyId);
    List<Invoice> findByStatus(String status);
}
