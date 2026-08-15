-- V1: Initial GPS Telemetry Schema
CREATE TABLE IF NOT EXISTS gps_locations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id     UUID NOT NULL,
    vehicle_id  UUID NOT NULL,
    latitude    DOUBLE PRECISION NOT NULL,
    longitude   DOUBLE PRECISION NOT NULL,
    speed_kmh   DOUBLE PRECISION,
    heading     DOUBLE PRECISION,
    accuracy    DOUBLE PRECISION,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient trip-based time-series queries
CREATE INDEX idx_gps_locations_trip_id     ON gps_locations (trip_id);
CREATE INDEX idx_gps_locations_vehicle_id  ON gps_locations (vehicle_id);
CREATE INDEX idx_gps_locations_recorded_at ON gps_locations (recorded_at DESC);
-- Composite index: common query pattern is "latest pings for a trip"
CREATE INDEX idx_gps_trip_time ON gps_locations (trip_id, recorded_at DESC);
