-- V1: Initial Passenger Boarding Schema
CREATE TABLE IF NOT EXISTS boarding_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id     UUID NOT NULL,
    employee_id UUID NOT NULL,
    scanned_by  UUID NOT NULL, -- Driver who scanned the QR
    scanned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status      VARCHAR(50) NOT NULL -- 'SUCCESS', 'INVALID_TRIP', 'ALREADY_BOARDED'
);

CREATE INDEX idx_boarding_trip ON boarding_logs (trip_id);
CREATE INDEX idx_boarding_employee ON boarding_logs (employee_id);
