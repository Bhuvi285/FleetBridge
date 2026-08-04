# FleetBridge — Enterprise Architecture & Design Book
**Document Classification:** Technical Architecture Reference  
**Project:** FleetBridge — Enterprise B2B Employee Transportation Management Platform  
**Version:** 1.0.0  
**Date:** July 2026  
**Audience:** Software Architects, Backend/Frontend/Mobile Developers, Data Engineers, DevOps, QA, Security Engineers  

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Architecture Principles](#2-architecture-principles)
3. [Context Diagram (C4 Level 1)](#3-context-diagram-c4-level-1)
4. [Container Diagram (C4 Level 2)](#4-container-diagram-c4-level-2)
5. [Component Diagrams (C4 Level 3)](#5-component-diagrams-c4-level-3)
6. [Domain Driven Design](#6-domain-driven-design)
7. [Use Case Diagrams](#7-use-case-diagrams)
8. [Activity Diagrams](#8-activity-diagrams)
9. [Sequence Diagrams](#9-sequence-diagrams)
10. [Class Diagrams](#10-class-diagrams)
11. [ER Diagram](#11-er-diagram)
12. [Database Per Service](#12-database-per-service)
13. [State Diagrams](#13-state-diagrams)
14. [Deployment Diagram](#14-deployment-diagram)
15. [Network Architecture](#15-network-architecture)
16. [Event Driven Architecture](#16-event-driven-architecture)
17. [API Interaction Diagrams](#17-api-interaction-diagrams)
18. [Authentication Architecture](#18-authentication-architecture)
19. [Security Architecture](#19-security-architecture)
20. [Observability Architecture](#20-observability-architecture)
21. [Scalability Architecture](#21-scalability-architecture)
22. [Resilience Architecture](#22-resilience-architecture)
23. [Decision Records (ADRs)](#23-decision-records)
24. [Glossary](#24-glossary)

---

## 1. Architecture Overview
FleetBridge is an enterprise-grade, multi-tenant B2B SaaS platform designed to orchestrate corporate employee transportation. 
- **Business Architecture:** Connects Organizations (demand) with Travel Companies (supply), governed by a Super Admin (platform owner). Monetization is multi-tiered SaaS billing.
- **Application Architecture:** Microservices-based, following Hexagonal/Clean Architecture, coordinated via an API Gateway.
- **Information Architecture:** Multi-tenant data models using Row-Level Security (RLS) in PostgreSQL. Event-sourced data integration. Time-series storage for telemetry.
- **Infrastructure Architecture:** Cloud-native, containerized (Docker), and orchestrated via Kubernetes (AWS EKS) across multi-Availability Zones.
- **Security Architecture:** Zero Trust model, JWT/OAuth2 Identity via Keycloak, mTLS for internal communication.
- **Integration Architecture:** Event-Driven Architecture (EDA) via Apache Kafka for asynchronous workflows. Synchronous communication via REST/gRPC where immediate consistency is required.

---

## 2. Architecture Principles
- **SOLID & Clean Architecture:** Domain logic is isolated at the core. External concerns (DB, Web) are decoupled via ports and adapters.
- **Domain-Driven Design (DDD):** System is decomposed into Bounded Contexts aligned with business capabilities (e.g., Trip, Fleet, Billing).
- **Event-Driven Architecture (EDA):** State changes publish domain events to Kafka, ensuring loose coupling and eventually consistent downstream processing (e.g., Analytics, Billing).
- **Database Per Service:** Each microservice encapsulates its data store. No direct cross-database queries.
- **API First & Cloud Native:** 12-Factor App methodology. Ephemeral containers, externalized configuration, stateless processes.
- **High Cohesion, Loose Coupling:** Services operate independently. Failure in the Notification service does not halt Trip execution.

---

## 3. Context Diagram (C4 Level 1)

```mermaid
C4Context
    title System Context Diagram for FleetBridge
    
    Person(superAdmin, "Super Admin", "Manages platform, tenants, billing")
    Person(orgAdmin, "Organization Admin", "Manages employees, routes, reporting")
    Person(travelAdmin, "Travel Co Admin", "Manages fleet, drivers, contracts")
    Person(employee, "Employee", "Books trips, tracks buses, boards via QR")
    Person(driver, "Driver", "Executes trips, performs checks, updates status")
    
    System(fleetBridge, "FleetBridge Platform", "Enterprise B2B Transportation Management System")
    
    System_Ext(googleMaps, "Google Maps API", "Geocoding, Routing, Traffic")
    System_Ext(fcm, "Firebase (FCM)", "Push Notifications")
    System_Ext(paymentGateway, "Stripe / Razorpay", "Subscription Billing")
    System_Ext(smsProvider, "Twilio / Meta", "SMS & WhatsApp Messaging")
    System_Ext(gpsHardware, "IoT GPS Devices", "Vehicle Telemetry (MQTT)")
    
    Rel(superAdmin, fleetBridge, "Administers platform")
    Rel(orgAdmin, fleetBridge, "Manages logistics & employees")
    Rel(travelAdmin, fleetBridge, "Manages fleet operations")
    Rel(employee, fleetBridge, "Consumes transport services")
    Rel(driver, fleetBridge, "Executes assigned trips")
    
    Rel(fleetBridge, googleMaps, "Fetches routing/ETA", "HTTPS")
    Rel(fleetBridge, fcm, "Sends push alerts", "HTTPS")
    Rel(fleetBridge, paymentGateway, "Processes payments", "HTTPS")
    Rel(fleetBridge, smsProvider, "Sends SMS/WhatsApp", "HTTPS")
    Rel(gpsHardware, fleetBridge, "Streams telemetry", "MQTT")
```
**Explanation:** The Context diagram illustrates FleetBridge's boundaries, showing the 5 primary user personas and the 5 critical external integrations required to deliver the core value proposition.

---

## 4. Container Diagram (C4 Level 2)

```mermaid
C4Container
    title Container Diagram - FleetBridge Platform
    
    Person(user, "User", "Web or Mobile Client")
    
    Container(webApp, "Admin Web Portal", "React, TypeScript", "UI for Admins")
    Container(mobileApp, "Mobile App", "Android, Kotlin", "UI for Drivers/Employees")
    
    Container(apiGateway, "API Gateway", "Spring Cloud Gateway", "Routing, Rate Limiting, JWT Validation")
    Container(authService, "Identity Provider", "Keycloak", "OAuth2/OIDC, Multi-Realm")
    
    Container(orgService, "Organization Service", "Spring Boot", "Org & Employee Management")
    Container(fleetService, "Fleet Service", "Spring Boot", "Vehicle & Driver Management")
    Container(tripService, "Trip Service", "Spring Boot", "Scheduling & Trip State")
    Container(gpsService, "GPS & IoT Service", "Spring Boot", "Telemetry Ingestion & WebSockets")
    Container(boardingService, "Boarding Service", "Spring Boot", "QR Generation & Attendance")
    Container(billingService, "Billing Service", "Spring Boot", "Invoice & Payments")
    
    ContainerDb(postgres, "PostgreSQL", "RDBMS", "Relational Data (RLS Isolated)")
    ContainerDb(redis, "Redis Cluster", "In-Memory", "Caching, Session, QR Validation")
    ContainerDb(timescaledb, "TimescaleDB", "Time-Series", "GPS Telemetry History")
    ContainerQueue(kafka, "Apache Kafka", "Event Broker", "Async Messaging Backbone")
    
    Rel(user, webApp, "Visits", "HTTPS")
    Rel(user, mobileApp, "Uses", "HTTPS")
    Rel(webApp, apiGateway, "API Calls", "HTTPS")
    Rel(mobileApp, apiGateway, "API Calls", "HTTPS")
    
    Rel(apiGateway, authService, "Validates Tokens")
    Rel(apiGateway, orgService, "Routes")
    Rel(apiGateway, fleetService, "Routes")
    Rel(apiGateway, tripService, "Routes")
    Rel(apiGateway, gpsService, "Routes / WS")
    Rel(apiGateway, boardingService, "Routes")
    Rel(apiGateway, billingService, "Routes")
    
    Rel(orgService, postgres, "Reads/Writes")
    Rel(fleetService, postgres, "Reads/Writes")
    Rel(tripService, postgres, "Reads/Writes")
    Rel(gpsService, timescaledb, "Writes")
    Rel(boardingService, redis, "Validates QR")
    Rel(boardingService, postgres, "Writes Attendance")
    
    Rel(tripService, kafka, "Publishes Events")
    Rel(gpsService, kafka, "Publishes Events")
    Rel(boardingService, kafka, "Publishes Events")
    Rel(billingService, kafka, "Consumes Events")
```
**Explanation:** Displays the macro-architecture. Web and Mobile clients route through a Spring Cloud Gateway which handles authentication offloading to Keycloak. Core business logic is partitioned into microservices, each with its dedicated persistence layer. Kafka acts as the event nerve center.

---

## 5. Component Diagrams (C4 Level 3)

### Example: Trip Service Component Diagram
```mermaid
C4Component
    title Component Diagram - Trip Service
    
    Container(apiGateway, "API Gateway", "Spring Cloud Gateway", "Routes traffic")
    ContainerQueue(kafka, "Apache Kafka", "Event Broker", "Async Messaging")
    ContainerDb(postgres, "PostgreSQL", "RDBMS", "Trip Database")
    
    Container_Boundary(tripService, "Trip Service") {
        Component(tripController, "Trip Controller", "Spring REST", "Exposes HTTP endpoints")
        Component(tripAppService, "Trip Application Service", "Java", "Orchestrates Use Cases")
        Component(tripStateMachine, "Trip State Machine", "Spring Statemachine", "Manages Trip Lifecycle")
        Component(tripRepository, "Trip Repository", "Spring Data JPA", "Data Access")
        Component(eventPublisher, "Domain Event Publisher", "Outbox Pattern", "Publishes to Kafka")
        Component(fleetClient, "Fleet Service Client", "OpenFeign", "Fetches Vehicle/Driver info")
    }
    
    Rel(apiGateway, tripController, "Calls", "HTTPS/JSON")
    Rel(tripController, tripAppService, "Invokes")
    Rel(tripAppService, tripStateMachine, "Transitions State")
    Rel(tripAppService, fleetClient, "Gets external data")
    Rel(tripStateMachine, tripRepository, "Updates State")
    Rel(tripStateMachine, eventPublisher, "Generates Domain Event")
    Rel(tripRepository, postgres, "Reads/Writes")
    Rel(eventPublisher, postgres, "Writes Outbox")
    Rel(eventPublisher, kafka, "Forwards via CDC/Poller")
```
**Explanation:** The Trip Service follows Hexagonal architecture. `TripController` acts as the primary driving adapter. `TripApplicationService` orchestrates logic using the `TripStateMachine`. Data is persisted via `TripRepository`. External communication utilizes Feign (synchronous) and Kafka (asynchronous via the Outbox pattern).

---

## 6. Domain Driven Design

### 6.1 Bounded Context Mapping
```mermaid
graph TD
    subgraph Identity & Access
        IAM[Keycloak Context]
    end
    
    subgraph Tenant Management
        TENANT[Tenant Context]
    end
    
    subgraph Operations Core
        ORG[Organization Context]
        FLEET[Fleet Context]
        ROUTE[Route Context]
        TRIP[Trip Context]
        BOARD[Boarding & Attendance Context]
        GPS[Telemetry Context]
    end
    
    subgraph Value-Add & Finance
        BILL[Billing Context]
        NOTIF[Notification Context]
        ANALYTICS[Analytics Context]
    end
    
    %% Relationships (Conformist, Customer-Supplier, Anticorruption)
    IAM -.->|ACL| TENANT
    TENANT -.->|Shared Kernel| ORG
    TENANT -.->|Shared Kernel| FLEET
    ORG -->|Customer-Supplier| ROUTE
    FLEET -->|Customer-Supplier| TRIP
    ROUTE -->|Customer-Supplier| TRIP
    TRIP -->|Event-Driven| GPS
    TRIP -->|Event-Driven| BOARD
    BOARD -->|Event-Driven| BILL
    BOARD -->|Event-Driven| NOTIF
    GPS -->|Event-Driven| ANALYTICS
```
**Explanation:** Identifies the strategic design of the platform. The `Trip Context` is central to Operations, consuming data from `Route` and `Fleet` contexts via Customer-Supplier relationships. Downstream contexts like `Billing` and `Notification` react to events from `Boarding` and `Trip`.

### 6.2 Ubiquitous Language & Entities
- **Aggregate Root (Trip):** Encapsulates Trip schedule, state (SCHEDULED, IN_PROGRESS, COMPLETED), assigned Vehicle, and Driver.
- **Value Object (GeoCoordinate):** Immutable latitude, longitude, and accuracy radius.
- **Domain Event (`TripCompletedEvent`):** Signifies a trip has ended, triggering attendance finalization and billing cycles.

---

## 7. Use Case Diagrams

### 7.1 Employee Use Cases
```mermaid
usecaseDiagram
    actor Employee as "Employee"
    
    usecase UC1 as "View Assigned Route"
    usecase UC2 as "Track Bus Live Location"
    usecase UC3 as "Generate QR Boarding Pass"
    usecase UC4 as "Mark Transport Leave"
    usecase UC5 as "Trigger SOS Emergency"
    usecase UC6 as "Submit Trip Feedback"
    
    Employee --> UC1
    Employee --> UC2
    Employee --> UC3
    Employee --> UC4
    Employee --> UC5
    Employee --> UC6
    
    UC2 .> UC1 : <<extends>>
    UC5 .> UC2 : <<includes>>
```

### 7.2 Travel Company Admin Use Cases
```mermaid
usecaseDiagram
    actor TravelAdmin as "Travel Co Admin"
    
    usecase UC1 as "Register Vehicle"
    usecase UC2 as "Onboard Driver"
    usecase UC3 as "Assign Driver to Trip"
    usecase UC4 as "Monitor Fleet Live"
    usecase UC5 as "Review Invoices"
    
    TravelAdmin --> UC1
    TravelAdmin --> UC2
    TravelAdmin --> UC3
    TravelAdmin --> UC4
    TravelAdmin --> UC5
```
**Explanation:** Illustrates the high-level functional goals of primary actors. `<<includes>>` denotes mandatory sub-behavior, while `<<extends>>` denotes optional extension.

---

## 8. Activity Diagrams

### 8.1 Trip Execution & Boarding Workflow
```mermaid
stateDiagram-v2
    [*] --> Scheduled: Nightly Batch Job
    Scheduled --> PreTripInspection: Driver Logs In
    
    state PreTripInspection {
        CheckOdometer --> CheckTires
        CheckTires --> CheckLights
    }
    
    PreTripInspection --> Activated: Inspection Passed
    Activated --> InProgress: Driver Starts Trip
    
    state InProgress {
        [*] --> NavigateToNextStop
        NavigateToNextStop --> ArriveAtStop
        ArriveAtStop --> ScanQR
        ScanQR --> Valid: Boarding Confirmed
        ScanQR --> Invalid: Reject Boarding
        Valid --> NavigateToNextStop
    }
    
    InProgress --> Completed: Driver Ends Trip
    Completed --> [*]
```
**Explanation:** Details the step-by-step operational flow of a single trip, emphasizing the mandatory Pre-Trip Inspection and the iterative boarding loop at each stop.

---

## 9. Sequence Diagrams

### 9.1 QR Boarding & Attendance Verification
```mermaid
sequenceDiagram
    autonumber
    actor Guard as Security Guard / Scanner
    participant App as Scanner App
    participant API as API Gateway
    participant Boarding as Boarding Service
    participant Redis as Redis Cache
    participant Kafka as Kafka Broker
    participant Attend as Attendance Service

    Guard->>App: Scans Employee QR
    App->>API: POST /api/v1/boarding/verify (QR Payload)
    API->>Boarding: Route Request
    Boarding->>Boarding: Validate HMAC Signature
    Boarding->>Redis: Check for Duplicate Scan (Nonce)
    alt Is Duplicate
        Redis-->>Boarding: Exists
        Boarding-->>App: 409 Conflict (Already Boarded)
    else Is Valid
        Redis-->>Boarding: Not Found
        Boarding->>Redis: Save Nonce (TTL 24h)
        Boarding->>Kafka: Publish BoardingConfirmedEvent
        Boarding-->>App: 200 OK (Employee Profile Data)
        Kafka-->>Attend: Consume Event
        Attend->>Attend: Update Attendance Record to PRESENT
    end
```
**Explanation:** Shows the synchronous validation loop optimized by Redis for sub-100ms response, decoupled from the asynchronous attendance database write via Kafka.

---

## 10. Class Diagrams

### 10.1 Trip & Route Aggregate Model
```mermaid
classDiagram
    class TripInstance {
        +UUID tripId
        +UUID routeId
        +UUID vehicleId
        +UUID driverId
        +TripStatus status
        +LocalDateTime scheduledStartTime
        +LocalDateTime actualStartTime
        +startTrip()
        +completeTrip()
        +cancelTrip(reason)
    }
    
    class Route {
        +UUID routeId
        +String name
        +Integer maxCapacity
        +RouteType type
    }
    
    class RouteStop {
        +UUID stopId
        +Integer sequenceNumber
        +GeoCoordinate location
        +LocalTime expectedTime
    }
    
    class TripAttendance {
        +UUID attendanceId
        +UUID employeeId
        +BoardingStatus status
        +LocalDateTime scanTime
    }
    
    TripInstance "*" --> "1" Route : follows
    Route "1" *-- "1..*" RouteStop : contains
    TripInstance "1" *-- "*" TripAttendance : records
```
**Explanation:** Illustrates the enterprise domain model. `TripInstance` acts as an aggregate root for operational execution, maintaining relationships with the reference `Route` and its compositional `RouteStop`s.

---

## 11. ER Diagram

```mermaid
erDiagram
    TENANT ||--o{ ORGANIZATION : manages
    TENANT ||--o{ TRAVEL_COMPANY : manages
    
    ORGANIZATION ||--o{ EMPLOYEE : employs
    TRAVEL_COMPANY ||--o{ VEHICLE : owns
    TRAVEL_COMPANY ||--o{ DRIVER : employs
    
    ORGANIZATION ||--o{ ROUTE : requests
    ROUTE ||--|{ ROUTE_STOP : contains
    
    ROUTE ||--o{ TRIP_INSTANCE : spawns
    VEHICLE ||--o{ TRIP_INSTANCE : executes
    DRIVER ||--o{ TRIP_INSTANCE : drives
    
    TRIP_INSTANCE ||--o{ ATTENDANCE : generates
    EMPLOYEE ||--o{ ATTENDANCE : logs
    
    TRIP_INSTANCE ||--o{ INVOICE_LINE_ITEM : bills
    
    EMPLOYEE {
        uuid id PK
        uuid org_id FK
        string name
        string phone
        string rfid_tag
    }
    TRIP_INSTANCE {
        uuid id PK
        uuid route_id FK
        uuid vehicle_id FK
        string status
        timestamp start_time
    }
```
**Explanation:** A macro-level logical data model indicating relationships across entities. In practice, these tables are physically segregated into different microservice databases, with foreign keys (`route_id`, `vehicle_id`) acting as soft references.

---

## 12. Database Per Service
To ensure loose coupling, FleetBridge implements the **Database-per-Service** pattern.
- **Tenant DB:** Manages tenant metadata, domains, and Keycloak realm mappings.
- **Organization DB:** Employee records, departments, cost centers.
- **Fleet DB:** Vehicles, Drivers, maintenance logs, documents.
- **Trip DB:** Routes, route variants, schedules, trip instances.
- **Telemetry DB (TimescaleDB):** Raw GPS pings, geofence breaches. Highly optimized for time-series inserts.
- **Billing DB:** Contracts, invoices, payment records.
- **Shared References:** Services keep eventually consistent Read Models of necessary external data (e.g., Trip DB keeps a localized cache of Vehicle capacity) populated via Kafka events.

---

## 13. State Diagrams

### 13.1 Vehicle State Machine
```mermaid
stateDiagram-v2
    [*] --> ACTIVE: Registered
    ACTIVE --> ON_TRIP: Trip Started
    ON_TRIP --> ACTIVE: Trip Completed
    ACTIVE --> MAINTENANCE: Scheduled/Breakdown
    ON_TRIP --> MAINTENANCE: En-route Breakdown
    MAINTENANCE --> ACTIVE: Repairs Completed
    ACTIVE --> RETIRED: End of Life
    MAINTENANCE --> RETIRED: Written Off
    RETIRED --> [*]
```
**Explanation:** Ensures a vehicle cannot be assigned to a new trip while `ON_TRIP` or under `MAINTENANCE`. State transitions are enforced by the Fleet Service Application Layer.

---

## 14. Deployment Diagram

```mermaid
C4Deployment
    title Deployment Architecture - AWS EKS Production
    
    Deployment_Node(aws, "Amazon Web Services", "Cloud Provider"){
        Deployment_Node(vpc, "FleetBridge VPC", "Virtual Private Cloud"){
            
            Deployment_Node(public, "Public Subnets", "AZ A/B/C"){
                Container(alb, "AWS Application Load Balancer", "ALB", "Ingress Traffic Routing")
                Container(nat, "NAT Gateway", "NAT", "Outbound Internet Access")
            }
            
            Deployment_Node(privateApp, "Private Application Subnets", "EKS Worker Nodes"){
                Container(apiGw, "API Gateway Pods", "K8s", "Spring Cloud Gateway")
                Container(microservices, "Microservice Pods", "K8s", "Trip, Fleet, Org, Boarding")
            }
            
            Deployment_Node(privateData, "Private Data Subnets", "Managed Services"){
                ContainerDb(rds, "Amazon RDS Multi-AZ", "PostgreSQL", "Relational Databases")
                ContainerDb(elasticache, "Amazon ElastiCache", "Redis", "Distributed Cache")
                ContainerQueue(msk, "Amazon MSK", "Kafka", "Managed Event Broker")
            }
        }
    }
    
    Rel(alb, apiGw, "Routes HTTPS")
    Rel(apiGw, microservices, "Routes Internal Traffic")
    Rel(microservices, rds, "JDBC/TLS")
    Rel(microservices, msk, "TCP/TLS")
    Rel(microservices, elasticache, "TCP/TLS")
    Rel(microservices, nat, "Outbound (Maps, Firebase)")
```
**Explanation:** Follows strict 3-tier cloud architecture. Public subnets hold ALBs/NAT. Private subnets hold EKS worker nodes (applications). Data subnets are deeply isolated, containing managed AWS data services.

---

## 15. Network Architecture
- **VPC & Subnets:** Custom VPC with /16 CIDR. Subnet separation across 3 Availability Zones for High Availability.
- **Security Groups:** 
  - ALB SG: Allows 443 inbound from 0.0.0.0/0.
  - EKS Worker SG: Allows inbound from ALB SG on NodePorts.
  - Data SG: Allows inbound ONLY from EKS Worker SG on specific ports (5432, 6379, 9092).
- **Zero Trust:** Istio Service Mesh implements mTLS between all Kubernetes pods. Pod-to-pod traffic is encrypted and authenticated.

---

## 16. Event Driven Architecture

### 16.1 Transactional Outbox Pattern implementation
To guarantee at-least-once delivery of domain events without distributed two-phase commits (2PC):
1. Microservice initiates DB transaction.
2. Persists business entity (e.g., `TripInstance`).
3. Persists domain event to local `outbox_event` table.
4. Commits transaction.
5. Debezium CDC (Change Data Capture) tails the PostgreSQL WAL (Write-Ahead Log) and publishes the event to Kafka.

### 16.2 Key Kafka Topics
- `fleetbridge.domain.employee` (Partitioned by `tenant_id`)
- `fleetbridge.domain.trip` (Partitioned by `trip_id`)
- `fleetbridge.telemetry.gps` (Partitioned by `vehicle_id` - high throughput)
- `fleetbridge.ops.boarding` (Partitioned by `trip_id`)

```mermaid
graph LR
    A[Trip Service DB] -->|WAL| B(Debezium CDC)
    B --> C((Kafka: domain.trip))
    C --> D[Boarding Service]
    C --> E[Analytics Service]
    C --> F[Notification Service]
```

---

## 17. API Interaction Diagrams
- **Synchronous (REST/Feign):** Used for querying data (e.g., UI loading dashboards, Boarding Service validating token). Wrapped in Resilience4j Circuit Breakers to prevent cascading failures.
- **Asynchronous (Kafka):** Used for state mutations and notifications.
- **WebSocket (STOMP):** Used for streaming real-time GPS coordinates from the API Gateway to connected browser/mobile clients.

---

## 18. Authentication Architecture

### 18.1 OAuth2 / OIDC Flow (Keycloak)
1. Mobile App requests auth via Authorization Code Flow with PKCE.
2. Keycloak renders tenant-specific login page.
3. User authenticates (Password + OTP).
4. Keycloak issues JWT Access Token, ID Token, Refresh Token.
5. Client includes JWT in `Authorization: Bearer` header.
6. API Gateway validates JWT signature locally using cached JWK Set from Keycloak.
7. Gateway extracts `tenantId` and roles, injecting them as custom HTTP headers to backend microservices.

---

## 19. Security Architecture
- **Threat Model Mitigation (OWASP Top 10):**
  - **Injection:** Prevented by Spring Data JPA/Hibernate (Parameterized queries) and REST payload validation.
  - **Broken Auth:** Handled by Keycloak (brute force protection, token rotation).
  - **Sensitive Data Exposure:** AWS KMS for DB volume encryption. Field-level encryption for Employee PII. TLS 1.3 in transit.
- **Rate Limiting:** Redis Token Bucket algorithm at API Gateway. 100 req/min for Web, 1000 req/min for IoT MQTT.
- **Audit Logging:** Dedicated aspect-oriented (AOP) audit logger captures every mutable action (actor, entity, old_state, new_state) and publishes to `domain.audit` topic for Elasticsearch indexing.

---

## 20. Observability Architecture

### 20.1 Telemetry Pipeline
```mermaid
graph TD
    subgraph Microservices
        S1[Spring Boot App]
    end
    
    S1 -->|OpenTelemetry OTLP| C[OTEL Collector]
    
    C -->|Metrics| P[(Prometheus)]
    C -->|Traces| J[(Jaeger / Tempo)]
    
    S1 -->|JSON Logs via stdout| F[FluentBit]
    F -->|Log Stream| E[(Elasticsearch)]
    
    P --> G[Grafana Dashboards]
    J --> G
    E --> G
```
- **Logging:** Structured JSON logging (Logback). MDC injects `traceId`, `spanId`, and `tenantId` into every log line.
- **Metrics:** Micrometer exposes JVM, connection pool, and custom business metrics (e.g., `active_trips_count`, `sos_triggers_total`) to Prometheus scrape endpoints.
- **Alerting:** Grafana Alertmanager triggers PagerDuty for critical SLA breaches (e.g., API latency > 500ms, Kafka consumer lag > 10,000).

---

## 21. Scalability Architecture
- **Horizontal Pod Autoscaling (HPA):** Kubernetes scales microservice pods based on CPU/Memory utilization (target 70%).
- **Database Scalability:** PostgreSQL Read Replicas deployed. Spring `@Transactional(readOnly = true)` routes queries to replicas.
- **Telemetry Ingestion:** GPS Service scales horizontally to handle high MQTT connection counts. TimescaleDB partitions time-series data into chunks (Hypertables) for high-speed writes.

---

## 22. Resilience Architecture
- **Circuit Breakers (Resilience4j):** Wraps all inter-service REST calls.
- **Timeouts:** Global 5-second timeout on all synchronous internal calls.
- **Retries:** Configured for transient failures (e.g., network blip) with exponential backoff.
- **Dead Letter Queues (DLQ):** Unprocessable Kafka messages are routed to a DLQ for manual inspection, preventing poison-pill blocking of consumer partitions.
- **Graceful Degradation:** If Analytics Service is down, Admin Portals serve stale cached data instead of crashing.

---

## 23. Decision Records (ADRs)

### ADR 001: Selection of Microservices Architecture
- **Context:** The platform serves multiple enterprises with disparate scaling needs (GPS telemetry vs. Billing).
- **Decision:** Adopt a Microservices Architecture.
- **Trade-offs:** Increases operational complexity and CI/CD overhead, but provides independent scaling, fault isolation, and technology flexibility.

### ADR 002: PostgreSQL Row-Level Security (RLS) for Multi-Tenancy
- **Context:** Need strict data isolation between corporate tenants without the overhead of maintaining thousands of separate databases.
- **Decision:** Use PostgreSQL with RLS. The `tenantId` is injected into the DB connection context via API Gateway.
- **Trade-offs:** Adds slight overhead to query execution. Excellent security boundary; prevents application bugs from leaking cross-tenant data.

### ADR 003: TimescaleDB for GPS Telemetry
- **Context:** High volume (millions per day) of GPS coordinates needing fast inserts and time-window aggregations.
- **Decision:** Use TimescaleDB (PostgreSQL extension).
- **Trade-offs:** Reduces infrastructure complexity compared to deploying a separate Cassandra or InfluxDB cluster, while maintaining SQL querying capabilities.

### ADR 004: React (Admin) & Kotlin Jetpack Compose (Mobile)
- **Context:** Need performant, maintainable UI layers.
- **Decision:** React 18 for Web due to rich component ecosystem (shadcn/ui). Native Kotlin with Jetpack Compose for Android to leverage deep hardware access (Maps, Background location, WorkManager for offline sync).

---

## 24. Glossary
- **Clean Architecture:** A software design philosophy emphasizing separation of concerns, keeping core business logic independent of frameworks or databases.
- **Event Choreography:** A decentralized event-driven pattern where microservices react to events independently, without a central controller orchestrator.
- **OTLP:** OpenTelemetry Protocol. The standard format for transmitting telemetry data (logs, metrics, traces).
- **PKCE:** Proof Key for Code Exchange. A security extension for OAuth2 designed to protect mobile apps from authorization code interception attacks.
- **Saga Pattern:** A sequence of local transactions managing data consistency across microservices in distributed systems.

---
*End of Document*
