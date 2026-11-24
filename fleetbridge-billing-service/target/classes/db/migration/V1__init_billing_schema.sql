CREATE TABLE IF NOT EXISTS contract_rates (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL,
    travel_company_id UUID NOT NULL,
    base_trip_rate NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    rate_per_km NUMERIC(10, 2) NOT NULL DEFAULT 25.00,
    overtime_rate_per_hour NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    tax_percentage NUMERIC(5, 2) NOT NULL DEFAULT 18.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_org_company UNIQUE (organization_id, travel_company_id)
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    trip_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    travel_company_id UUID NOT NULL,
    distance_km NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    base_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    distance_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'ISSUED',
    issued_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_invoices_trip_id ON invoices(trip_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(travel_company_id);
