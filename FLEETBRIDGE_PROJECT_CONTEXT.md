# FleetBridge — Enterprise Microservices Master Project Context

> **Document Status:** Active Engineering Master Context  
> **Target System:** FleetBridge Enterprise B2B Employee Transportation SaaS Platform  
> **Last Updated:** November 22, 2026  
> **Author/Maintainer:** Senior Java Backend Architect & Full-Stack Engineering Lead  
> **Repository Root:** `D:\Central Projects Hub\FleetBridge`  
> **Context File Location:** `D:\Central Projects Hub\FleetBridge\FLEETBRIDGE_PROJECT_CONTEXT.md`

---

## 1. Project Overview & Objectives

**FleetBridge** is an enterprise-grade multi-tenant B2B employee transportation management platform designed to automate and streamline corporate transit operations. It bridges three key enterprise stakeholders:
1. **Corporate Client Organizations:** Manage companies, departments, and employee rosters requiring scheduled daily commutes.
2. **Travel Agencies & Fleet Providers:** Manage fleets of vehicles, drivers, licenses, compliance, and dispatch.
3. **Operations & Drivers:** Real-time route execution, live vehicle GPS telemetry broadcasting, passenger boarding verification via dynamic QR codes, and incident monitoring.

### Core Objectives
* Provide centralized multi-tenant administration for organizations, fleet providers, vehicles, and drivers.
* Automate route generation, stop sequencing, and trip instance scheduling.
* Deliver high-frequency live vehicle tracking via WebSockets and map visualizers.
* Ensure tamper-proof passenger boarding verification using scan-validated QR passes.
* Maintain transactional consistency across distributed services using the **Transactional Outbox Pattern** and **Apache Kafka**.
* Protect all microservices and frontend portals using centralized OpenID Connect / OAuth2 via **Keycloak**.

---

## 2. Complete Technology Stack

### Backend Technologies
* **Language & Runtime:** Java 21 (LTS)
* **Framework:** Spring Boot 3.3.0
* **API Gateway:** Spring Cloud Gateway 2023.0.1 (Spring WebFlux / Netty)
* **Security & Token Management:** Spring Security 6.3, OAuth2 Resource Server, Nimbus Jose JWT, JJWT 0.12.3
* **Data Persistence & ORM:** Spring Data JPA, Hibernate ORM 6.5
* **Database Migrations:** Flyway Database Migrations (PostgreSQL dialect)
* **Relational Database:** PostgreSQL 16 (individual database per microservice)
* **In-Memory Cache / Key-Value Store:** Redis 7.2 (Alpine)
* **Message Broker & Event Bus:** Apache Kafka 7.5.0 (KRaft mode, Confluent Platform)
* **Real-Time Telemetry:** Spring WebSocket, STOMP Messaging Protocol, SockJS
* **Object Mapping & Boilerplate:** MapStruct 1.5.5.Final, Project Lombok 1.18.32
* **QR Generation:** Google ZXing (`core` 3.5.3, `javase` 3.5.3)
* **Build Tool:** Apache Maven 3.9+ / 3.10+

### Frontend Technologies
* **Framework:** Angular 21 (Standalone Component architecture, Signals)
* **Component Library:** Angular Material 21, Angular CDK 21
* **Authentication Library:** `angular-oauth2-oidc` 21.0.3 (PKCE Authorization Code Flow)
* **GIS & Mapping:** Leaflet 1.9.4 (`@types/leaflet` 1.9.22)
* **Real-Time WebSocket Client:** `@stomp/stompjs` 7.3.0, `sockjs-client` 1.6.1
* **QR Code Scanning:** `@zxing/ngx-scanner` 22.0.1, `@zxing/browser` 0.2.1, `@zxing/library` 0.23.0
* **Styling:** SCSS, Glassmorphism design system, responsive flexbox layout
* **HTTP Client:** Angular HttpClient with functional `HttpInterceptorFn`

### Containerization & Infrastructure
* **Container Engine:** Docker Engine 29.9+, Docker Compose v2
* **Identity Provider (IdP):** Keycloak 24.0 (Quay.io)
* **Operating System Environment:** Windows 11 (Host), Alpine Linux (Containers)

---

## 3. Actual Project Folder Structure

```
D:\Central Projects Hub\FleetBridge/
├── .maven/                               # Bundled Apache Maven 3.9.6 distribution
├── .vscode/                              # VS Code workspace settings & build configs
├── Docs/                                 # Enterprise specifications & design books
│   ├── FleetBridge_Architecture_Design_Book.md
│   ├── FleetBridge_Architecture_Document.md
│   ├── FleetBridge_Implementation_Roadmap.md
│   └── FleetBridge_SRS_Document.md
├── docker-compose-dev.yml                # Docker Compose orchestration (Postgres, Redis, Keycloak, Kafka)
├── init-db.sql                           # Database initialization script for PostgreSQL container
├── keycloak-import/                      # Keycloak realm configuration import directory
│   └── realm-export.json                 # Exported 'fleetbridge-master' realm with roles, clients, users
├── pom.xml                               # Root Maven Parent POM (dependencyManagement, plugins, modules)
│
├── fleetbridge-common/                   # Shared library module across all microservices
│   ├── pom.xml
│   └── src/main/java/com/fleetbridge/common/
│       ├── dto/ApiResponse.java          # Standard API response envelope
│       ├── events/TripStatusChangedEvent.java # Kafka event contract for trip lifecycle
│       └── exception/
│           ├── ErrorResponse.java        # Structured error payload
│           └── GlobalExceptionHandler.java # Centralized @ControllerAdvice
│
├── fleetbridge-api-gateway/              # Spring Cloud Gateway (Port 9090)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/fleetbridge/gateway/
│       │   ├── ApiGatewayApplication.java
│       │   └── config/SecurityConfig.java # Reactive WebFlux security & CORS configuration
│       └── resources/application.yml     # Route definitions to all backend services
│
├── fleetbridge-org-service/              # Organization & Employee Domain Service (Port 8081)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/fleetbridge/org/
│       │   ├── OrgServiceApplication.java
│       │   ├── application/              # DTOs, mappers, domain services
│       │   ├── domain/entity/            # Organization & Employee JPA entities
│       │   ├── infrastructure/repository/# Spring Data JPA repositories
│       │   └── presentation/             # OrganizationController & EmployeeController
│       └── resources/
│           ├── application.yml
│           └── db/migration/V1__init_schema.sql
│
├── fleetbridge-fleet-service/            # Fleet, Vehicle & Driver Service (Port 8082)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/fleetbridge/fleet/
│       │   ├── FleetServiceApplication.java
│       │   ├── application/              # DTOs, mappers, domain services
│       │   ├── domain/entity/            # TravelCompany, Vehicle, Driver entities
│       │   ├── infrastructure/repository/# Repositories for company, vehicle, driver
│       │   └── presentation/             # FleetController
│       └── resources/
│           ├── application.yml
│           └── db/migration/
│               ├── V1__init_schema.sql
│               └── V2__add_vehicle_fields.sql
│
├── fleetbridge-trip-service/             # Route & Trip Scheduling Engine (Port 8083)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/fleetbridge/trip/
│       │   ├── TripServiceApplication.java
│       │   ├── application/              # DTOs, TripMapper, TripService
│       │   ├── domain/entity/            # Route, RouteStop, TripInstance entities
│       │   ├── infrastructure/
│       │   │   ├── client/               # FleetServiceClient (inter-service validation)
│       │   │   ├── kafka/                # OutboxRelayScheduler (@Scheduled Kafka publisher)
│       │   │   ├── outbox/               # OutboxEvent entity & OutboxEventRepository
│       │   │   └── repository/           # RouteRepository & TripInstanceRepository
│       │   └── presentation/             # TripController
│       └── resources/
│           ├── application.yml
│           └── db/migration/
│               ├── V1__init_schema.sql
│               └── V2__Create_Outbox_Table.sql
│
├── fleetbridge-boarding-service/         # QR Pass & Attendance Service (Port 8085) [UNTRACKED]
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/fleetbridge/boarding/
│       │   ├── BoardingServiceApplication.java
│       │   ├── application/
│       │   │   ├── dto/                  # BoardingScanRequest, BoardingScanResponse
│       │   │   └── service/              # BoardingService (validation), QrService (ZXing PNG)
│       │   ├── domain/entity/            # BoardingLog entity
│       │   ├── infrastructure/
│       │   │   ├── config/SecurityConfig.java
│       │   │   └── repository/           # BoardingLogRepository
│       │   └── presentation/controller/  # BoardingController
│       └── resources/
│           ├── application.yml
│           └── db/migration/V1__init_boarding_schema.sql
│
├── fleetbridge-gps-service/              # Real-Time GPS Telemetry & WebSockets (Port 8084)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/fleetbridge/gps/
│       │   ├── GpsServiceApplication.java
│       │   ├── application/              # GpsLocationRequest/Response, GpsService
│       │   ├── domain/entity/            # GpsLocation time-series entity
│       │   ├── infrastructure/
│       │   │   ├── config/               # CorsConfig, SecurityConfig, WebSocketConfig (STOMP)
│       │   │   └── repository/           # GpsLocationRepository
│       │   └── presentation/controller/  # GpsController (ingest, latest, trail)
│       └── resources/
│           ├── application.yml
│           └── db/migration/V1__init_gps_schema.sql
│
├── fleetbridge-notification-service/     # Event-Driven Notification Engine (Port 8090)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/fleetbridge/notification/
│       │   ├── NotificationServiceApplication.java
│       │   ├── application/
│       │   │   ├── dto/                  # NotificationRequest
│       │   │   ├── kafka/                # TripEventListener (@KafkaListener on 'trip-events')
│       │   │   └── service/              # EmailService, NotificationService
│       │   └── presentation/             # NotificationController
│       └── resources/application.yml
│
└── fleetbridge-web-portal/               # Angular 21 Single Page Application & PWA
    ├── angular.json                      # Build & serve configuration with proxy config
    ├── package.json                      # Dependencies: Material, Leaflet, Stomp, ZXing, OAuth2
    ├── proxy.conf.json                   # Reverse proxy: /api -> :9090, /realms -> :8080
    └── src/
        ├── app/
        │   ├── app.config.ts             # App providers, routes, HTTP client with JWT interceptor
        │   ├── app.routes.ts             # Route definitions with role-based guards
        │   ├── auth/login/               # Keycloak login redirection component
        │   ├── core/
        │   │   ├── guards/               # authGuard, guestGuard, roleGuard, driverRedirectGuard
        │   │   ├── interceptors/         # jwt.interceptor.ts (bearer token injection)
        │   │   ├── models/               # TypeScript models (driver, org, trip, vehicle)
        │   │   └── services/             # AuthService, ApiService, GpsService, BoardingService, etc.
        │   ├── dashboard/                # Admin operational dashboard
        │   ├── driver/driver-dashboard/  # Mobile PWA dashboard (GPS tracking & QR camera scanner)
        │   ├── employees/                # Employee directory & QR boarding pass dialog
        │   ├── fleet/                    # Vehicle inventory & driver management
        │   ├── layout/                   # MainLayout (sidebar/header) & AuthLayout
        │   ├── organizations/            # Organization management
        │   ├── tracking/                 # LiveMapComponent (Leaflet + WebSocket live tracking)
        │   └── trips/                    # Route builder & Trip instance scheduler
        └── environments/environment.ts   # Runtime environment configuration
```

---

## 4. Microservices Responsibilities & Status

| Microservice | Port | Database | Primary Responsibilities | Implementation Status |
| :--- | :---: | :---: | :--- | :---: |
| **fleetbridge-common** | N/A | N/A | Shared ApiResponse, Kafka event contracts, global exception handling. | **IMPLEMENTED** |
| **fleetbridge-api-gateway** | 9090 | None | Unified API entry point, JWT validation, path routing, global CORS. | **IMPLEMENTED** |
| **fleetbridge-org-service** | 8081 | `fleetbridge_org_db` | Enterprise client organizations, departments, employee rosters. | **IMPLEMENTED** |
| **fleetbridge-fleet-service** | 8082 | `fleetbridge_fleet_db` | Travel agencies, vehicle fleet specifications, driver licensing. | **IMPLEMENTED** |
| **fleetbridge-trip-service** | 8083 | `fleetbridge_trip_db` | Routes, stops, trip scheduling, status lifecycle, Transactional Outbox. | **IMPLEMENTED** |
| **fleetbridge-boarding-service** | 8085 | `fleetbridge_boarding_db` | QR boarding pass generation (ZXing) & driver scan attendance validation. | **IMPLEMENTED** *(Uncommitted)* |
| **fleetbridge-gps-service** | 8084 | `fleetbridge_gps_db` | Telemetry ingestion, historical trail retrieval, STOMP WebSocket broadcasting. | **PARTIALLY IMPLEMENTED** *(TimescaleDB pending)* |
| **fleetbridge-notification-service** | 8090 | None | Kafka listener on `trip-events`, email/SMS dispatcher. | **PARTIALLY IMPLEMENTED** *(Mock email only)* |
| **fleetbridge-billing-service** | 8086 | `fleetbridge_billing_db` | Transit contracts, distance calculation, billing & automated invoicing. | **NOT IMPLEMENTED** |
| **fleetbridge-web-portal** | 4200 | Browser LocalStorage | Angular 21 admin portal, live Leaflet tracking, driver scanner PWA. | **IMPLEMENTED** *(Partially uncommitted)* |

---

## 5. Existing Frontend Architecture (Angular 21)

### Architecture Highlights
* **Standalone Architecture:** Angular 21 standalone components without legacy `NgModule`.
* **State Management:** Reactive Angular **Signals** (`signal()`, `computed()`) inside services and components.
* **Authentication:** `angular-oauth2-oidc` configured with Keycloak PKCE flow:
  * Redirects to Keycloak for authentication.
  * Access tokens, refresh tokens, and identity claims stored securely.
  * `jwt.interceptor.ts` automatically attaches `Authorization: Bearer <token>` to all `/api/*` HTTP calls.
* **Role-Based Access Control (RBAC):**
  * `authGuard`: Enforces active session.
  * `guestGuard`: Prevents authenticated users from seeing `/auth/login`.
  * `roleGuard`: Enforces role-based route permissions (`SUPER_ADMIN`, `TRAVEL_ADMIN`, `ORG_ADMIN`, `DRIVER`).
  * `driverRedirectGuard`: Automatically redirects users with `DRIVER` role directly to `/driver` PWA view.
* **Development Reverse Proxy (`proxy.conf.json`):**
  * `/api` mapped to API Gateway `http://127.0.0.1:9090`
  * `/realms` mapped to Keycloak `http://localhost:8080`
  * Avoids browser CORS and cookie/origin issues during local development.

### Registered Portal Routes

| Route | Guard | Roles Permitted | Component Description |
| :--- | :--- | :--- | :--- |
| `/auth/login` | `guestGuard` | Public | Keycloak login initiation screen |
| `/dashboard` | `authGuard`, `driverRedirectGuard` | Super Admin, Travel Admin, Org Admin | Analytics overview, quick stats |
| `/vehicles` | `authGuard`, `roleGuard` | `SUPER_ADMIN`, `TRAVEL_ADMIN` | Vehicle registry, capacity, status |
| `/drivers` | `authGuard`, `roleGuard` | `SUPER_ADMIN`, `TRAVEL_ADMIN` | Driver license tracking, contact info |
| `/trips` | `authGuard`, `roleGuard` | `SUPER_ADMIN`, `TRAVEL_ADMIN`, `ORG_ADMIN` | Route creation, trip scheduling & status updates |
| `/tracking` | `authGuard`, `roleGuard` | `SUPER_ADMIN`, `TRAVEL_ADMIN`, `ORG_ADMIN` | Real-time Leaflet map with live vehicle marker |
| `/organizations` | `authGuard`, `roleGuard` | `SUPER_ADMIN`, `ORG_ADMIN` | Client companies & industries |
| `/employees` | `authGuard`, `roleGuard` | `SUPER_ADMIN`, `ORG_ADMIN` | Employee directory with QR Pass modal |
| `/driver` | `authGuard`, `roleGuard` | `DRIVER`, `SUPER_ADMIN` | Driver mobile dashboard with auto-pinger & QR scanner |

---

## 6. Database Architecture & Entity Relationships

Each microservice controls its own isolated schema (Database-per-Service pattern).

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     fleetbridge_org_db          │       │     fleetbridge_fleet_db        │
├─────────────────────────────────┤       ├─────────────────────────────────┤
│ organizations                   │       │ travel_companies                │
│  - id (UUID, PK)                │       │  - id (UUID, PK)                │
│  - tenant_id                    │       │  - tenant_id                    │
│  - name, industry               │       │  - name, registration_number    │
│                                 │       │                                 │
│ employees                       │       │ vehicles                        │
│  - id (UUID, PK)                │       │  - id (UUID, PK)                │
│  - organization_id (FK)         │       │  - travel_company_id (FK)       │
│  - first_name, last_name        │       │  - registration_plate (UNIQUE)  │
│  - email (UNIQUE), department   │       │  - seating_capacity, type, year │
└─────────────────────────────────┘       │                                 │
                 │                        │ drivers                         │
                 │ (Logical Reference)    │  - id (UUID, PK)                │
                 ▼                        │  - travel_company_id (FK)       │
┌─────────────────────────────────┐       │  - license_number (UNIQUE)      │
│     fleetbridge_trip_db         │       └─────────────────────────────────┘
├─────────────────────────────────┤                        │
│ routes                          │                        │ (Logical Reference)
│  - id (UUID, PK)                │                        ▼
│  - organization_id (Logical FK) │       ┌─────────────────────────────────┐
│  - name, status                 │       │     fleetbridge_gps_db          │
│                                 │       ├─────────────────────────────────┤
│ route_stops                     │       │ gps_locations                   │
│  - id (UUID, PK)                │       │  - id (UUID, PK)                │
│  - route_id (FK)                │       │  - trip_id (Logical FK, INDEX)  │
│  - name, lat, lng, stop_order   │       │  - vehicle_id (Logical FK)      │
│                                 │       │  - latitude, longitude          │
│ trip_instances                  │       │  - speed_kmh, heading, accuracy │
│  - id (UUID, PK)                │       │  - recorded_at (TIMESTAMPTZ)    │
│  - route_id (FK)                │       └─────────────────────────────────┘
│  - vehicle_id (Logical FK)      │                        ▲
│  - driver_id (Logical FK)       │                        │ (Logical Reference)
│  - scheduled_start_time         │       ┌─────────────────────────────────┐
│  - actual_start_time / end_time │       │    fleetbridge_boarding_db      │
│  - status (SCHEDULED/ACTIVE...) │       ├─────────────────────────────────┤
│                                 │       │ boarding_logs                   │
│ outbox_events                   │       │  - id (UUID, PK)                │
│  - id (UUID, PK)                │       │  - trip_id (Logical FK, INDEX)  │
│  - aggregate_type, aggregate_id │       │  - employee_id (Logical FK)     │
│  - event_type, payload          │       │  - scanned_by (Driver UUID)     │
│  - created_at, processed (BOOL) │       │  - scanned_at (TIMESTAMPTZ)     │
└─────────────────────────────────┘       │  - status (SUCCESS/ALREADY...)  │
                                          └─────────────────────────────────┘
```

---

## 7. API Gateway Routing Configuration

Gateway runs on port **9090** (`fleetbridge-api-gateway`).

| Route ID | Path Predicate | Target URI | Protocol |
| :--- | :--- | :--- | :---: |
| `org-service` | `/api/v1/org/**` | `http://localhost:8081` | HTTP |
| `fleet-service` | `/api/v1/fleet/**` | `http://localhost:8082` | HTTP |
| `trip-service` | `/api/v1/trip/**` | `http://localhost:8083` | HTTP |
| `gps-service-rest` | `/api/v1/gps/**` | `http://localhost:8084` | HTTP |
| `gps-service-websocket` | `/ws/telemetry/**` | `ws://localhost:8084` | WebSocket |
| `boarding-service` | `/api/v1/boarding/**` | `http://localhost:8085` | HTTP |

### Gateway Security & CORS Settings
* OAuth2 Resource Server validates Keycloak JWT issuer: `http://localhost:8080/realms/fleetbridge-master`.
* JWK Set URI: `http://localhost:8080/realms/fleetbridge-master/protocol/openid-connect/certs`.
* Public Endpoints: `/actuator/health/**`.
* CORS Configuration: `allowedOriginPatterns: "*"` (supports credentials, standard HTTP methods, and custom headers).

---

## 8. Keycloak Authentication & Authorization Flow

### Keycloak Realm Configuration
* **Realm Name:** `fleetbridge-master`
* **OAuth2 Client ID:** `fleetbridge-web` (Public client, PKCE enabled)
* **Valid Redirect URIs:** `http://localhost:4200/*`
* **Realm Roles Defined:**
  1. `SUPER_ADMIN`: Full unrestricted platform access across all organizations and fleets.
  2. `TRAVEL_ADMIN`: Manages travel companies, vehicles, drivers, and dispatches.
  3. `ORG_ADMIN`: Manages organization roster, departments, and employee transit requests.
  4. `DRIVER`: Access restricted to driver dashboard, route execution, and QR boarding scanner.

### Pre-configured Test Accounts in `realm-export.json`

| Username | Role Assigned | Purpose |
| :--- | :--- | :--- |
| `superadmin@fleetbridge.io` | `SUPER_ADMIN` | Platform configuration & all modules |
| `traveladmin@fleetbridge.io` | `TRAVEL_ADMIN` | Fleet, driver, vehicle management |
| `orgadmin@fleetbridge.io` | `ORG_ADMIN` | Organization and employee operations |
| `driver@fleetbridge.io` | `DRIVER` | Driver PWA mobile portal |

*(All users have credentials pre-configured in Keycloak import file).*

---

## 9. JWT Implementation Details

* **Issuing Authority:** Keycloak Realm `fleetbridge-master`
* **Signature Algorithm:** RS256 with asymmetric key rotation via JWKS endpoint.
* **Token Content:**
  * `sub`: User ID (UUID)
  * `preferred_username`: Login email
  * `realm_access.roles`: Array of assigned roles (`SUPER_ADMIN`, etc.)
  * `email`: User email address
* **Backend Validation:** Each Spring Boot resource server uses `spring-boot-starter-oauth2-resource-server` to automatically fetch and cache Keycloak public keys from `jwk-set-uri` and validate incoming Bearer tokens.
* **Principal Resolution:** Controllers obtain caller details via `@AuthenticationPrincipal Jwt jwt` (e.g., driver ID in `BoardingController`).

---

## 10. Docker Infrastructure & Container Configuration

Defined in `docker-compose-dev.yml`:

| Container Name | Service Image | Host Port | Internal Port | Environment / Volumes |
| :--- | :--- | :---: | :---: | :--- |
| `fleetbridge-postgres` | `postgres:16-alpine` | `5432` | `5432` | Volume `pgdata`, init script `./init-db.sql` |
| `fleetbridge-redis` | `redis:7.2-alpine` | `6379` | `6379` | Volume `redisdata` |
| `fleetbridge-keycloak` | `quay.io/keycloak/keycloak:24.0` | `8080` | `8080` | Connected to `keycloak_db`, volume `./keycloak-import` |
| `fleetbridge-kafka` | `confluentinc/cp-kafka:7.5.0` | `9092` | `9092` | KRaft mode (no Zookeeper), volume `kafkadata` |

---

## 11. Service-to-Service Communication

1. **Synchronous Validation (HTTP / OpenFeign):**
   * `TripService` validates vehicle and driver status against `FleetService` (`http://localhost:8082`) prior to trip scheduling.
2. **Asynchronous Event Publishing (Transactional Outbox Pattern):**
   * When a trip is scheduled or status updated, `TripService` writes a `TripStatusChangedEvent` to the local `outbox_events` table within the same ACID transaction.
   * `OutboxRelayScheduler` polls every 5 seconds, publishes pending events to Kafka topic `trip-events`, and updates `processed = true`.
3. **Asynchronous Event Consumption (Apache Kafka):**
   * `NotificationService` subscribes to topic `trip-events` (`fleetbridge-notification-group`) and processes notifications for status transitions (`SCHEDULED`, `ACTIVE`, `COMPLETED`, `CANCELLED`).
4. **Real-Time Client Telemetry (STOMP WebSockets):**
   * Drivers push coordinates to `POST /api/v1/gps/ingest`.
   * `GpsService` broadcasts to topic `/topic/trip/{tripId}`.
   * `LiveMapComponent` in Angular subscribes to this topic and translates vehicle coordinates in real time on the Leaflet map.

---

## 12. Existing API Endpoints Catalog

### Organization Service (`:8081`)
* `POST /api/v1/org/organizations` — Create organization
* `GET  /api/v1/org/organizations/{id}` — Get organization by ID
* `GET  /api/v1/org/organizations` — List all organizations
* `POST /api/v1/org/employees` — Create employee
* `GET  /api/v1/org/employees/{id}` — Get employee by ID
* `GET  /api/v1/org/employees/organization/{orgId}` — List employees for organization
* `GET  /api/v1/org/employees` — List all employees
* `DELETE /api/v1/org/employees/{id}` — Delete employee

### Fleet Service (`:8082`)
* `POST /api/v1/fleet/companies` — Register travel agency
* `GET  /api/v1/fleet/companies/{id}` — Get travel agency
* `GET  /api/v1/fleet/companies` — List all travel agencies
* `POST /api/v1/fleet/vehicles` — Register vehicle
* `GET  /api/v1/fleet/vehicles/{id}` — Get vehicle details
* `PUT  /api/v1/fleet/vehicles/{id}` — Update vehicle
* `DELETE /api/v1/fleet/vehicles/{id}` — Delete vehicle
* `GET  /api/v1/fleet/companies/{id}/vehicles` — List vehicles by company
* `POST /api/v1/fleet/drivers` — Onboard driver
* `PUT  /api/v1/fleet/drivers/{id}` — Update driver
* `DELETE /api/v1/fleet/drivers/{id}` — Delete driver
* `GET  /api/v1/fleet/companies/{id}/drivers` — List drivers by company

### Trip Service (`:8083`)
* `POST /api/v1/trip/routes` — Create route with ordered stops
* `GET  /api/v1/trip/routes` — List all routes
* `PUT  /api/v1/trip/routes/{id}` — Update route
* `DELETE /api/v1/trip/routes/{id}` — Delete route
* `POST /api/v1/trip/instances` — Schedule trip instance
* `GET  /api/v1/trip/instances` — List all trip instances
* `GET  /api/v1/trip/routes/{id}/instances` — Get trip instances for route
* `PUT  /api/v1/trip/instances/{id}/status` — Transition trip status (`SCHEDULED`, `ACTIVE`, `COMPLETED`, `CANCELLED`)

### GPS Service (`:8084`)
* `POST /api/v1/gps/ingest` — Ingest vehicle GPS ping & broadcast to WebSocket
* `GET  /api/v1/gps/trips/{tripId}/latest` — Get current vehicle location
* `GET  /api/v1/gps/trips/{tripId}/trail` — Get historical location trail
* `WS   /ws/telemetry` — STOMP endpoint (`/topic/trip/{tripId}`)

### Boarding Service (`:8085`)
* `GET  /api/v1/boarding/qr/{employeeId}` — Generate Base64 QR code pass
* `POST /api/v1/boarding/scan` — Driver scans pass; validates and records attendance

---

## 13. Implemented Features

* [x] **Core Multi-Tenant Master Data:** Complete CRUD for Organizations, Employees, Travel Companies, Vehicles, and Drivers.
* [x] **Route & Scheduling Engine:** Route creation with ordered geographical stops, trip instance scheduling, and driver/vehicle assignment.
* [x] **Distributed Messaging:** Transactional Outbox pattern implemented in Trip Service; Outbox relay scheduler publishing events to Kafka.
* [x] **Real-Time GPS Tracking Pipeline:** GPS ingestion REST API, PostgreSQL time-series storage, STOMP WebSocket broadcasting, and Angular Leaflet live map visualization.
* [x] **Passenger Boarding & QR Verification:** ZXing-powered QR code generation for employee boarding passes and validation API for drivers with double-boarding prevention.
* [x] **Web Administration Portal:** Angular 21 application with standalone components, Angular Material, Keycloak PKCE authentication, and role-based guards.
* [x] **Driver Mobile Dashboard PWA:** Driver interface with automated GPS pinging and live QR scanner using device camera.

---

## 14. Incomplete & Partially Implemented Features

* [ ] **TimescaleDB Extension for GPS Service:** `fleetbridge-gps-service` currently uses standard PostgreSQL rather than a hypertable.
* [ ] **Production-Ready Notification Engine:** `fleetbridge-notification-service` uses mock email logging and lacks SMS (Twilio) and real employee recipient resolution.
* [ ] **Redis-Based Ephemeral QR Validation:** Boarding Service validates QR against database logs; planned Redis TTL token verification is not yet implemented.
* [ ] **Billing Service:** Not implemented (contracts, trip distance rate calculation, automated invoices).
* [ ] **Native Android Applications:** Native Kotlin/Jetpack Compose apps for Drivers and Employees are not yet built (driver currently uses Angular PWA).
* [ ] **Automated Integration Test Suite:** Testcontainers test suites are not yet configured for microservices.

---

## 15. Current Development Phase

**Phase 3 (Web Administration Portal & UI Integration) transitioning into Phase 4 / Phase 5.**
* Backend core domain microservices (Phase 1 & 2) are complete.
* Frontend Web Portal (Phase 3) is substantially developed with working screens for Fleet, Organizations, Trips, Tracking, and Driver PWA.
* Event-Driven architecture (Phase 4) has foundational Outbox + Kafka + Notification service in place.
* QR Boarding (Phase 5) is implemented in `fleetbridge-boarding-service` and frontend QR dialog/scanner, currently uncommitted.

---

## 16. Last Known Development Progress

Before transferring from the previous laptop, the following work was actively underway:
1. **Passenger Boarding Service (`fleetbridge-boarding-service`):** Built as a new microservice with QR pass generation (ZXing) and driver scan verification. Added to root `pom.xml` and Gateway routes.
2. **Frontend QR Pass & Scanning:** Added `EmployeeQrDialogComponent` to view employee boarding passes and `QrScannerComponent` (`@zxing/ngx-scanner`) to Driver Dashboard.
3. **Live GPS Map Visualization:** Added `LiveMapComponent` with Leaflet markers and STOMP WebSocket telemetry integration.
4. **Development Reverse Proxy:** Added `proxy.conf.json` to route `/api` and `/realms` through Angular CLI dev server.

---

## 17. Laptop Migration Verification: Blockers & Fixes

During the initial inspection on this new laptop, several environment differences were identified and have now been systematically resolved:

### 1. Java 21 vs Java 17 Mismatch [RESOLVED]
* **Resolution:** Root `pom.xml` properties updated to target Java 17 (`<java.version>17</java.version>`, `<maven.compiler.source>17</maven.compiler.source>`, `<maven.compiler.target>17</maven.compiler.target>`).
* **Verification:** All 9 Maven modules compiled with 100% `BUILD SUCCESS`.

### 2. Node.js Not Installed [RESOLVED]
* **Resolution:** Node.js LTS (v26.13.1) and npm (11.20.0) installed into `C:\Program Files\nodejs`.
* **Verification:** `node -v` and `npm -v` confirmed functioning.

### 3. Docker Desktop Daemon Inactive [RESOLVED]
* **Resolution:** Docker Desktop started and active.
* **Verification:** `docker ps` verified running.

### 4. Port 5432 Conflict with Windows Service [RESOLVED]
* **Resolution:** Local Windows service `postgresql-x64-18` stopped (`Stop-Service postgresql-x64-18`).
* **Verification:** Port 5432 bound successfully by Docker container `fleetbridge-postgres`.

### 5. Missing Database in `init-db.sql` [RESOLVED]
* **Resolution:** Added `CREATE DATABASE fleetbridge_boarding_db;` to `init-db.sql`.
* **Verification:** PostgreSQL container initialized all 7 databases (`fleetbridge_boarding_db`, `fleetbridge_fleet_db`, `fleetbridge_gps_db`, `fleetbridge_master`, `fleetbridge_org_db`, `fleetbridge_trip_db`, `keycloak_db`).

### 6. Infrastructure Container Health [VERIFIED ACTIVE]
* `fleetbridge-postgres` (:5432) — Up & Healthy
* `fleetbridge-redis` (:6379) — Up & Healthy
* `fleetbridge-keycloak` (:8080) — Up & Realm `fleetbridge-master` Imported
* `fleetbridge-kafka` (:9092) — Up in KRaft mode & Healthy

### 7. Service Startup Verification [VERIFIED]
* `fleetbridge-org-service` booted on port 8081, ran Flyway migrations, connected to `fleetbridge_org_db` and Keycloak in 5.9s.

### 8. Angular OAuth Discovery Document Validation with Proxy [RESOLVED]
* **Issue:** When accessing the portal on `http://localhost:4200` through reverse proxy `proxy.conf.json`, Keycloak advertises `http://localhost:8080/realms/fleetbridge-master`. `angular-oauth2-oidc` threw `invalid issuer in discovery document expected: http://localhost:4200/... current: http://localhost:8080/...`.
* **Resolution:** Added `skipIssuerCheck: true` and `strictDiscoveryDocumentValidation: false` to `AuthConfig` in `auth.service.ts`.

---

## 18. Required Environment Variables & Configuration

| Service / Tool | Variable | Default Local Value |
| :--- | :--- | :--- |
| System | `JAVA_HOME` | Path to JDK 21 installation directory |
| System | `PATH` | Must include `%JAVA_HOME%\bin`, Node.js, and Maven |
| Microservices | `SPRING_DATASOURCE_USERNAME` | `fleetbridge_user` |
| Microservices | `SPRING_DATASOURCE_PASSWORD` | `fleetbridge_password` |
| Microservices | Keycloak Issuer URI | `http://localhost:8080/realms/fleetbridge-master` |
| Trip / Notification | Kafka Bootstrap Servers | `localhost:9092` |
| Web Portal | Keycloak Issuer | `http://localhost:8080/realms/fleetbridge-master` (or via proxy) |

---

## 19. Instructions to Run FleetBridge on This Laptop

### Step 1: Resolve Environment Prerequisites
1. **Install JDK 21:** Download and install Eclipse Adoptium Temurin 21. Set `JAVA_HOME` to JDK 21.
2. **Install Node.js LTS:** Download and install Node.js 20.x or 22.x (includes npm).
3. **Stop Local PostgreSQL Service:**
   ```powershell
   Stop-Service postgresql-x64-18 -Force
   ```
4. **Start Docker Desktop:** Launch Docker Desktop from the Start menu and verify it is running (`docker ps`).

### Step 2: Initialize Infrastructure Containers
From project root (`D:\Central Projects Hub\FleetBridge`):
```powershell
docker compose -f docker-compose-dev.yml up -d
```
Verify all four containers are healthy:
* `fleetbridge-postgres` (:5432)
* `fleetbridge-redis` (:6379)
* `fleetbridge-keycloak` (:8080)
* `fleetbridge-kafka` (:9092)

### Step 3: Build Backend Microservices
```powershell
mvn clean compile -DskipTests
```

### Step 4: Start Backend Services (in order)
1. `fleetbridge-api-gateway` (Port 9090)
2. `fleetbridge-org-service` (Port 8081)
3. `fleetbridge-fleet-service` (Port 8082)
4. `fleetbridge-trip-service` (Port 8083)
5. `fleetbridge-gps-service` (Port 8084)
6. `fleetbridge-boarding-service` (Port 8085)
7. `fleetbridge-notification-service` (Port 8090)

### Step 5: Start Web Administration Portal
From `D:\Central Projects Hub\FleetBridge\fleetbridge-web-portal`:
```powershell
npm start
```
The application will be accessible at `http://localhost:4200` with proxy routing to the API Gateway and Keycloak.

---

## 20. Recommended Next Development Tasks

1. **Resolve Laptop Environment Blockers:**
   * Install JDK 21 and Node.js.
   * Stop local port 5432 service and boot Docker Compose.
   * Add `fleetbridge_boarding_db` to `init-db.sql`.
2. **Commit In-Flight Boarding & Tracking Milestone:**
   * Verify compilation of `fleetbridge-boarding-service`.
   * Stage and commit the in-flight boarding service and web portal tracking features.
3. **Consolidate Web Portal Features (Phase 3 Completion):**
   * Complete trip status change UI triggers in the web portal so admins can start/complete trips directly from the Trips view.
   * Verify Leaflet live marker updates with the running GPS service.
4. **Advance Notification Service (Phase 4):**
   * Integrate realistic email delivery (SendGrid API key or local MailHog container).
   * Resolve employee recipient email from Org Service rather than hardcoded mock recipient.
5. **Implement Redis Token Expiration for QR Passes (Phase 5):**
   * Store dynamic QR tokens in Redis with 15-minute TTL to make passes ephemeral and one-time-use.

---

## 21. Future Implementation Roadmap

* **Phase 6 — Advanced Telemetry & TimescaleDB:** Transition `gps_locations` to TimescaleDB hypertables; ingest telemetry via MQTT broker.
* **Phase 7 — Billing & Invoicing Service:** Build `fleetbridge-billing-service` with automated contract rating and monthly enterprise invoice generation.
* **Phase 8 — Native Mobile Apps:** Build Kotlin / Jetpack Compose Android applications for Drivers and Employees with native camera scanning and background location services.
* **Phase 9 — Production Hardening & Kubernetes:** Containerize microservices into Dockerfiles, create Helm charts, and configure AWS EKS deployment manifests.
