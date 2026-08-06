-- Initialize databases for Keycloak and the Microservices
CREATE DATABASE keycloak_db;
CREATE DATABASE fleetbridge_org_db;
CREATE DATABASE fleetbridge_fleet_db;
CREATE DATABASE fleetbridge_trip_db;

-- Ensure password is set with scram-sha-256 for TCP/IP connections
SET password_encryption = 'scram-sha-256';
ALTER USER fleetbridge_user WITH PASSWORD 'fleetbridge_password';
