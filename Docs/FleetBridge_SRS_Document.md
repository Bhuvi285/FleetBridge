# FleetBridge — Software Requirements Specification (SRS)
**Standard:** IEEE Std 29148-2018 / IEEE Std 830-1998 Compliant  
**Project:** FleetBridge — Enterprise B2B Employee Transportation Management SaaS Platform  
**Document Version:** 1.0.0  
**Date:** July 2026  
**Status:** Baseline Approved for Development  

---

## Document Control & Revision History

| Version | Date | Author(s) | Description of Changes | Approved By |
|---|---|---|---|---|
| 0.1.0 | 2026-07-15 | Lead Enterprise Business Analyst | Initial Draft & Chapter Skeleton | Solution Architect |
| 0.9.0 | 2026-07-22 | Senior Solution Architect | Complete Functional & NFR Specification | Product Owner |
| 1.0.0 | 2026-07-28 | Technical Review Board | Formal Baseline Approval (IEEE 29148) | Steering Committee |

---

# Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Stakeholders](#3-stakeholders)
4. [User Personas](#4-user-personas)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Business Rules](#7-business-rules)
8. [User Stories (100+ Enterprise Stories)](#8-user-stories)
9. [Use Cases](#9-use-cases)
10. [External Integrations](#10-external-integrations)
11. [Security Requirements](#11-security-requirements)
12. [Data Requirements](#12-data-requirements)
13. [Reporting Requirements](#13-reporting-requirements)
14. [Notifications](#14-notifications)
15. [Error Handling](#15-error-handling)
16. [Constraints](#16-constraints)
17. [Risks](#17-risks)
18. [Future Enhancements](#18-future-enhancements)
19. [Acceptance Criteria](#19-acceptance-criteria)
20. [Glossary](#20-glossary)

---

# 1. Introduction

## 1.1 Purpose
This Software Requirements Specification (SRS) document defines the complete functional, non-functional, security, data, and architectural requirements for **FleetBridge** — an enterprise-grade B2B Employee Transportation Management SaaS Platform. 

This document serves as the formal baseline contract between business stakeholders, solution architects, product managers, software engineers (Backend, Web Frontend, Android Mobile), DevOps engineers, QA automation specialists, and enterprise compliance auditors.

## 1.2 Scope
FleetBridge is a multi-tenant cloud-native software-as-a-service platform that digitizes and automates the corporate employee transportation lifecycle. The platform bridges three primary entities:
1. **Travel Companies (Fleet Service Vendors):** Operators who own and manage buses, drivers, routes, fuel, and vehicle maintenance.
2. **Organizations (Corporate Clients):** Enterprise customers who contract fleet vendors to transport employees daily between home/pickup points and corporate campuses.
3. **Super Admin (FleetBridge Platform Operator):** The SaaS platform owner overseeing multi-tenant provisioning, subscription monetization, global system observability, feature flagging, and platform governance.

### In Scope
- Multi-tenant architecture with logical data separation via Row-Level Security (RLS) and Keycloak realming.
- End-to-end trip lifecycle management: contract creation, route generation, dynamic seat allocation, pre-trip vehicle checklists, live trip execution, and automated completion.
- Real-time IoT/GPS location streaming over WebSockets/MQTT with sub-second latency.
- Dynamic rotating QR-code boarding verification and automated attendance reconciliation.
- Multi-channel notification delivery (Firebase Push, SMS, WhatsApp, Email).
- Automated contract-linked billing engine generating GST/tax-compliant period-end invoices.
- Emergency SOS workflow with multi-tiered automated escalation chains.
- AI/ML modules for seat demand forecasting, vehicle predictive maintenance, driver fatigue score computation, and trip delay prediction.
- Native Android application (Kotlin + Jetpack Compose) for Drivers and Employees (offline-first capability).
- Enterprise Web Portals (React + TypeScript) for Super Admins, Travel Company Admins, and Organization Admins.

### Out of Scope
- Public passenger ticketing or transit booking.
- Direct hardware manufacturing of GPS trackers or OBD-II scanners (platform integrates via standardized MQTT protocols).
- On-premise bare-metal physical installation (platform is strictly cloud-native hosted on AWS EKS).

## 1.3 Definitions, Acronyms, and Abbreviations

| Term / Abbreviation | Definition |
|---|---|
| **SaaS** | Software as a Service — cloud-based multi-tenant software delivery model |
| **B2B** | Business-to-Business — enterprise software transactions between corporate entities |
| **RLS** | Row-Level Security — database-level policy enforcing row filtering based on tenant context |
| **OIDC / OAuth2** | OpenID Connect / Open Authorization 2.0 — framework for identity verification and authorization |
| **JWT** | JSON Web Token — compact, URL-safe means of representing claims between two parties |
| **ETA** | Estimated Time of Arrival |
| **SLA** | Service Level Agreement — contractually agreed performance metrics |
| **MFA / TOTP** | Multi-Factor Authentication / Time-based One-Time Password |
| **SOS** | Save Our Souls — emergency signal triggered by driver or employee |
| **ESG** | Environmental, Social, and Governance compliance framework |
| **KYC** | Know Your Customer — identity verification for drivers and vendors |
| **DLQ** | Dead Letter Queue — messaging queue for unprocessable messages |
| **IoT** | Internet of Things — connected GPS hardware broadcast units |

## 1.4 Intended Audience
- **Solution & System Architects:** To validate structural integrity, microservice boundaries, data flows, and system integration points.
- **Backend Software Engineers (Java/Spring Boot):** To design service logic, REST API controllers, Kafka event handlers, and database entities.
- **Frontend & Mobile Engineers (React / Kotlin):** To implement user interfaces, local offline storage (Room DB), map rendering, and state management.
- **QA & Test Automation Engineers:** To build automated end-to-end regression suites, load testing scripts (k6), and compliance verification matrices.
- **DevOps & Platform Engineers:** To author Helm charts, Kubernetes manifests, CI/CD pipelines, and Prometheus alert configurations.
- **Auditors & Compliance Officers:** To verify security, privacy (GDPR/DPDP), and audit logging mechanisms.

## 1.5 Document Conventions
- **Mandatory Requirements:** Expressed using the keyword **SHALL** or **MUST**.
- **Recommended Requirements:** Expressed using the keyword **SHOULD**.
- **Optional/Future Requirements:** Expressed using the keyword **MAY**.
- **Requirement IDs:** Structured as `FR-<MODULE>-<NUMBER>` for Functional Requirements and `NFR-<CATEGORY>-<NUMBER>` for Non-Functional Requirements.

## 1.6 Business Context & Objectives
Corporate transportation in mid-to-large enterprises represents a significant operational cost center. Current manual processes result in 18–25% wasted seat capacity, frequent month-end invoice disputes, untracked employee safety risks, and zero operational data. 
FleetBridge solves this by providing:
- **Operational Cost Reduction:** Target 15–22% optimization in fleet spend via dynamic route consolidation and seat utilization analytics.
- **100% Billing Transparency:** Automated invoice generation from verified QR boarding events eliminating billing disputes.
- **Sub-30-Second Emergency Escalation:** Real-time location tracking and multi-tier SOS broadcast.
- **Regulatory Compliance:** Auditable driver records, vehicle document expiry monitoring, and ESG carbon footprint tracking.

---

# 2. Overall Description

## 2.1 Product Perspective
FleetBridge is an independent, cloud-native enterprise application operating as a multi-tenant platform. It integrates into enterprise IT ecosystems via standard REST APIs, Webhooks, OIDC/SSO federations, and IoT message brokers.

```
+-----------------------------------------------------------------------------------+
|                                  FLEETBRIDGE SAAS PLATFORM                        |
|                                                                                   |
|  +------------------+     +------------------------+     +---------------------+  |
|  |  Super Admin     |     | Travel Company Portal  |     | Organization Portal |  |
|  |  Console (Web)   |     |      (Web React)       |     |     (Web React)     |  |
|  +--------+---------+     +-----------+------------+     +----------+----------+  |
|           |                           |                             |             |
|           +---------------------------+-----------------------------+             |
|                                       |                                           |
|                            +----------v-----------+                               |
|                            |  Spring Cloud Gateway|                               |
|                            +----------+-----------+                               |
|                                       |                                           |
|       +-------------------------------+-------------------------------+           |
|       |                               |                               |           |
|  +----v----+                     +----v----+                     +----v----+      |
|  | Auth    |                     | Fleet   |                     | Trip    |      |
|  | Service |                     | Service |                     | Service |      |
|  +----+----+                     +----+----+                     +----+----+      |
|       |                               |                               |           |
|       +-------------------------------+-------------------------------+           |
|                                       |                                           |
|                            +----------v-----------+                               |
|                            | Apache Kafka Event   |                               |
|                            |     Backbone         |                               |
|                            +----------+-----------+                               |
|                                       |                                           |
|           +---------------------------+---------------------------+               |
|           |                           |                           |               |
|     +-----v-----+               +-----v-----+               +-----v-----+         |
|     | PostgreSQL|               |   Redis   |               |TimescaleDB|         |
|     |  (RLS)    |               |  Cluster  |               | (GPS/IoT) |         |
|     +-----------+               +-----------+               +-----------+         |
+-----------------------------------------------------------------------------------+
                                        ^
                                        | (MQTT / WebSockets / HTTPS)
             +--------------------------+--------------------------+
             |                                                     |
    +--------+-------+                                    +--------+-------+
    | Driver App     |                                    | Employee App   |
    | (Android Native|                                    | (Android Native|
    |  Kotlin/Compose|                                    | Kotlin/Compose |
    +----------------+                                    +----------------+
```

## 2.2 Product Functions (High-Level Summary)
1. **Multi-Tenant Administration:** Provisioning, tenant sandbox isolation, custom subdomain routing, and white-label branding.
2. **Fleet & Driver Lifecycle:** Asset registration, document expiry management, GPS tracker pairing, and driver KYC verification.
3. **Route & Trip Automation:** Automated recurring trip schedule creation, pickup point ordering, capacity checking, and pre-trip checklists.
4. **IoT Tracking & Geo-Fencing:** Sub-second vehicle tracking, route deviation alerts, speed monitoring, and arrival time estimation.
5. **Boarding & Attendance:** Dynamic rotating QR pass verification, manual fallback overrides, and real-time attendance syncing.
6. **Emergency SOS Management:** One-tap SOS trigger, continuous 1-second location streaming, and automated escalation workflow.
7. **Automated Billing Engine:** Contract-linked billing computation based on trips, seats, distance, and surcharges; GST-compliant invoice generation.
8. **AI-Driven Analytics:** Demand forecasting, predictive vehicle maintenance, fatigue scoring, and ESG carbon emission metrics.

## 2.3 User Classes & Characteristics

| User Class | Technical Expertise | System Usage Frequency | Primary Device / Interface |
|---|---|---|---|
| **Super Admin** | Expert | Daily (Monitoring & Support) | Web Browser (Desktop) |
| **Travel Company Admin** | Moderate | Continuous (Operational Shift) | Web Browser (Desktop / Dual-Monitor) |
| **Organization Admin** | Moderate | Daily / Shift-based | Web Browser (Desktop) |
| **Driver** | Basic | Continuous (During Shift) | Android Mobile Device (Ruggedized/Personal) |
| **Employee** | Basic | Twice Daily (Commute Hours) | Personal Android Smartphone |
| **Security Guard** | Basic | Shift-based (Gate Hours) | Android Mobile Scanner / Tablet |

## 2.4 Operating Environment
- **Server Platform:** Linux (Amazon Linux 2 / Ubuntu 22.04 LTS) running within AWS EKS (Elastic Kubernetes Service).
- **Backend Stack:** Java 21 LTS, Spring Boot 3.3+, Spring Cloud 2023.0+.
- **Database Layer:** PostgreSQL 16 (Multi-AZ RDS) with Row-Level Security; Redis 7.2 Cluster; TimescaleDB 2.14+.
- **Client Web Browsers:** Google Chrome 120+, Mozilla Firefox 120+, Apple Safari 17+, Microsoft Edge 120+.
- **Client Mobile Devices:** Android 9.0 (API Level 28) and higher; Google Play Services 23.0+.

## 2.5 Business Rules Summary
- BR-001: No employee may board a vehicle without an active, verified route assignment.
- BR-002: Dynamic QR codes expire 60 seconds after generation or immediately upon successful scan.
- BR-003: Drivers must pass mandatory pre-trip safety checklists before trip activation is permitted.
- BR-004: Invoices are non-modifiable once finalized; corrections require formal credit notes.
- BR-005: SOS triggers bypass all notification throttling and rate limits across all channels.

---

# 3. Stakeholders

## 3.1 Platform Owner (FleetBridge Leadership)
- **Role:** Owns the SaaS business model, revenue targets, system compliance, and platform expansion.
- **Key Responsibilities:** Subscriptions, strategic vendor partnerships, cloud cost optimization, legal compliance.

## 3.2 Super Admin
- **Role:** Operational administrator of the FleetBridge cloud infrastructure.
- **Key Responsibilities:** Onboarding tenants, configuring feature flags, monitoring global system health, managing API rate limits, handling Tier-3 support escalations.

## 3.3 Travel Company Admin (Vendor Partner)
- **Role:** Fleet manager responsible for supply-side transportation delivery.
- **Key Responsibilities:** Bus onboarding, driver shift assignment, fuel logging, maintenance scheduling, invoice reconciliation.

## 3.4 Organization Admin (Enterprise Client)
- **Role:** Corporate HR / Logistics Manager responsible for employee transportation welfare.
- **Key Responsibilities:** Employee roster upload, route approval, pickup point definition, transport budget management, SLA monitoring.

## 3.5 Employee (Pass-Holder)
- **Role:** End consumer traveling on corporate buses.
- **Key Responsibilities:** Boarding via QR code, tracking vehicle ETA, applying for transport leave, triggering SOS in emergencies, providing trip feedback.

## 3.6 Driver
- **Role:** On-field operator executing assigned bus trips.
- **Key Responsibilities:** Vehicle inspection, safe driving, navigating assigned route, manual attendance verification, reporting road incidents.

## 3.7 Security Guard / Conductor
- **Role:** Field operator stationed at campus gates or on high-capacity buses.
- **Key Responsibilities:** Scanning employee QR codes, verifying visitor buses, logging manual entry exceptions.

## 3.8 Finance Team
- **Role:** Financial officers in both Organization and Travel Company.
- **Key Responsibilities:** Invoice verification, tax audit, line-item dispute handling, payment processing.

## 3.9 DevOps & Infrastructure Team
- **Role:** Maintains 99.99% uptime, CI/CD pipelines, security compliance, and disaster recovery.
- **Key Responsibilities:** Kubernetes cluster management, database replication, security patch management, cost control.

---

# 4. User Personas

```
+--------------------------------------------------------------------------------+
| PERSONA 1: HR & Mobility Manager (Organization Admin)                         |
| Name: Rajesh Sharma | Age: 38 | Company: Apex Tech Solutions (3,500 employees) |
+--------------------------------------------------------------------------------+
| GOALS:                                                                         |
| - Ensure zero employee commute delays affecting production shifts.             |
| - Reduce monthly fleet expenditure by 15% through optimized seat utilization.   |
| - 100% compliance with female employee night-shift transport safety guidelines.|
| PAIN POINTS:                                                                   |
| - Spends 10 hours at month-end manually reconciling vendor invoices.           |
| - No real-time visibility when employees complain that buses arrived late.     |
| - Manual paper-based attendance led to proxy boarding and billing fraud.       |
+--------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------+
| PERSONA 2: Fleet Operations Head (Travel Company Admin)                        |
| Name: Vikram Singh | Age: 45 | Company: CityLine Travels (120 Buses)           |
+--------------------------------------------------------------------------------+
| GOALS:                                                                         |
| - Maximize bus utilization and minimize unbilled empty mileage (deadheads).    |
| - Prevent driver fuel theft and reduce unscheduled vehicle breakdowns.          |
| - Collect invoices promptly within contract payment terms (NET-30).            |
| PAIN POINTS:                                                                   |
| - Drivers frequently forget to log fuel stops or report mechanical issues.      |
| - Clients contest invoice line-items claiming buses were missing or delayed.   |
+--------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------+
| PERSONA 3: Senior Software Engineer (Employee)                                 |
| Name: Ananya Roy | Age: 27 | Company: Apex Tech Solutions                      |
+--------------------------------------------------------------------------------+
| GOALS:                                                                         |
| - Know exact bus ETA so she doesn't stand at the pickup point in bad weather.  |
| - Seamless 1-second boarding using her smartphone.                             |
| - Instant SOS safety protection during late evening shift drops.               |
| PAIN POINTS:                                                                   |
| - Driver changes route without notice, leaving her waiting at the wrong stop. |
| - Previous company app crashed constantly and failed to update map location.  |
+--------------------------------------------------------------------------------+
```

---

# 5. Functional Requirements

## Module 1: Authentication, Authorization & Identity Management

### FR-AUTH-001: Multi-Tenant Keycloak Authentication
- **Description:** The system SHALL authenticate all users against tenant-specific Keycloak realms via OAuth2/OIDC protocols using JWT tokens.
- **Actors:** All Users.
- **Preconditions:** User account exists and tenant realm is active.
- **Main Flow:**
  1. User initiates login request specifying credentials (or SSO redirect).
  2. System validates credentials against tenant realm.
  3. System issues access token (JWT), refresh token, and ID token containing `tenantId`, `userId`, and assigned `roles`.
  4. Client includes JWT in Authorization header (`Bearer <token>`) for all subsequent API requests.
- **Alternative Flow:** SSO authentication via corporate SAML 2.0 / Azure AD provider.
- **Post Conditions:** Authenticated session established; JWT cached client-side.
- **Business Rules:** BR-AUTH-01 (JWT validity: Access Token 15 min, Refresh Token 7 days).
- **Priority:** High / Critical.
- **Acceptance Criteria:** Authentication succeeds in <200ms; JWT contains valid signature and mandatory tenant claims.

### FR-AUTH-002: Role-Based & Tenant-Isolated Access Control (RBAC)
- **Description:** The system SHALL enforce strict multi-tenant data isolation and role-based permissions using API Gateway filters and PostgreSQL Row-Level Security (RLS).
- **Actors:** All Users.
- **Preconditions:** Valid JWT presented with request.
- **Main Flow:**
  1. API Gateway extracts `tenantId` and permissions from JWT.
  2. Database session sets `app.current_tenant_id`.
  3. Query execution automatically filters results strictly matching tenant ID.
- **Priority:** Critical.
- **Acceptance Criteria:** Zero cross-tenant data leakage verified via automated security testing.

---

## Module 2: Tenant & Subscription Management

### FR-TNT-001: Automated Tenant Provisioning
- **Description:** Super Admin SHALL be able to provision new Travel Company and Organization tenants in an automated workflow.
- **Actors:** Super Admin.
- **Preconditions:** Super Admin authenticated.
- **Main Flow:**
  1. Admin enters tenant details (Name, Domain, Type, Plan, Admin Contact).
  2. System triggers Keycloak realm creation.
  3. System provisions tenant database schema configuration.
  4. System dispatches welcome email with password reset link to tenant admin.
- **Priority:** High.
- **Acceptance Criteria:** Tenant provisioning completes within <10 seconds.

---

## Module 3: Fleet & Asset Management

### FR-FLT-001: Vehicle Registration & Metadata Capture
- **Description:** Travel Company Admin SHALL register fleet vehicles capturing detailed specifications (VIN, Make, Model, Seating Capacity, Fuel Type, AC/Non-AC).
- **Actors:** Travel Company Admin.
- **Preconditions:** Active Travel Company tenant.
- **Main Flow:**
  1. Admin submits vehicle profile form.
  2. System validates registration number uniqueness.
  3. System stores vehicle record in `active` state.
- **Priority:** High.
- **Acceptance Criteria:** Vehicle saved; profile instantly visible on fleet console.

### FR-FLT-002: Document Expiry Tracking & Alerts
- **Description:** System SHALL track mandatory vehicle compliance documents (Insurance, Fitness, Registration, Permit) and issue automated alerts 90, 30, and 7 days prior to expiry.
- **Actors:** Travel Company Admin, System Background Job.
- **Priority:** Medium.
- **Acceptance Criteria:** Automated notifications dispatched; expired vehicles flagged unusable for scheduling.

---

## Module 4: Driver & Conductor Management

### FR-DRV-001: Driver Onboarding & KYC Verification
- **Description:** System SHALL record driver profiles, commercial license details, medical certificates, and emergency contacts.
- **Actors:** Travel Company Admin.
- **Priority:** High.
- **Acceptance Criteria:** License expiry date validated; driver assigned unique ID.

### FR-DRV-002: Driver Performance Index Computation
- **Description:** System SHALL calculate a daily Driver Performance Index (0–100) based on on-time performance, speed violations, hard braking events, passenger ratings, and checklist compliance.
- **Actors:** System Analytics Engine.
- **Priority:** Medium.
- **Acceptance Criteria:** Score computed nightly and updated on driver profile.

---

## Module 5: Route & Pickup Point Management

### FR-RTE-001: Route Definition & Geofenced Pickup Points
- **Description:** System SHALL allow admins to define routes consisting of ordered pickup points with latitude, longitude, geofence radius (meters), and scheduled time offsets.
- **Actors:** Organization Admin, Travel Company Admin.
- **Main Flow:**
  1. Admin draws or places points on interactive map UI.
  2. System calculates optimal stop sequence and polyline path using Google Maps API.
  3. System saves route definition with version tag.
- **Priority:** High.
- **Acceptance Criteria:** Route path rendered accurately; geofence radiuses stored in PostGIS.

---

## Module 6: Trip Scheduling & Execution

### FR-TRP-001: Automated Recurring Trip Generation
- **Description:** System SHALL automatically generate daily trip instances from active master route schedules via scheduled Spring Batch execution.
- **Actors:** System Scheduler.
- **Preconditions:** Active route schedule exists.
- **Main Flow:**
  1. Batch job executes at 00:00 UTC.
  2. System checks calendar for holidays and employee transport leaves.
  3. System generates `TripInstance` records in `SCHEDULED` status for the target operational date.
- **Priority:** High.
- **Acceptance Criteria:** 100% of required daily trips created accurately without manual intervention.

### FR-TRP-002: Pre-Trip Inspection Checklist
- **Description:** Driver app SHALL enforce a mandatory pre-trip safety checklist (Odometer, Tyre Pressure, Fuel, Brakes, Lights, Emergency Exit) prior to allowing trip activation.
- **Actors:** Driver.
- **Priority:** High.
- **Acceptance Criteria:** Trip activation blocked until all mandatory items are checked and signed off.

---

## Module 7: Real-Time GPS Tracking & Telemetry

### FR-GPS-001: High-Frequency Telemetry Ingestion
- **Description:** System SHALL ingest vehicle GPS coordinate pings every 3 seconds via MQTT/HTTPS endpoint, publishing to Apache Kafka topic `gps.location.raw`.
- **Actors:** IoT Tracker / Driver App.
- **Priority:** Critical.
- **Acceptance Criteria:** Handles 50,000 pings/sec with <50ms processing latency.

### FR-GPS-002: Real-Time Map Streaming over WebSockets
- **Description:** System SHALL stream live vehicle coordinates to subscribed Employee mobile apps and Admin web consoles via WebSocket (STOMP protocol).
- **Actors:** Employee, Admin.
- **Priority:** Critical.
- **Acceptance Criteria:** UI updates vehicle marker smoothly on map with <1 second end-to-end latency.

---

## Module 8: Boarding, QR & Attendance

### FR-BRD-001: Dynamic Rotating QR Code Generation
- **Description:** Employee mobile app SHALL generate a dynamic QR code refreshed every 60 seconds, encoded with an HMAC-SHA256 signature containing `employeeId`, `tenantId`, `timestamp`, and `nonce`.
- **Actors:** Employee App.
- **Priority:** High.
- **Acceptance Criteria:** QR code changes visually every 60s; offline generation supported using local secret key.

### FR-BRD-002: QR Boarding Verification & Attendance Logging
- **Description:** Scanner app (Conductor/Security Guard/Driver) SHALL scan employee QR code and validate authorization in <100ms via Redis cache lookup.
- **Actors:** Conductor, Driver, Security Guard.
- **Main Flow:**
  1. Scanner reads QR code image.
  2. App sends payload to `/api/v1/boarding/verify`.
  3. System verifies HMAC signature and confirms employee route assignment.
  4. System publishes `boarding.confirmed` event to Kafka.
  5. System records attendance as `BOARDED`.
- **Alternative Flow:** QR expired or invalid -> System sounds error chime and logs failed attempt.
- **Priority:** Critical.
- **Acceptance Criteria:** Validation response time <100ms; duplicate scans within same trip rejected.

---

## Module 9: Emergency SOS & Safety Management

### FR-SOS-001: One-Tap SOS Emergency Trigger
- **Description:** Employee or Driver app SHALL provide a dedicated SOS button that, when pressed for 2 seconds, immediately triggers a high-priority emergency broadcast.
- **Actors:** Employee, Driver.
- **Main Flow:**
  1. User holds SOS button for 2 seconds.
  2. App captures high-precision GPS coordinates.
  3. App dispatches emergency payload to `/api/v1/emergency/sos`.
  4. System broadcasts instant alerts via Push, SMS, and WhatsApp to emergency contacts, Org Admin, and Safety Ops Center.
  5. System increases GPS tracking frequency for the vehicle to 1-second intervals.
- **Priority:** Critical.
- **Acceptance Criteria:** All emergency channels notified within <10 seconds of trigger.

---

## Module 10: Billing & Invoicing Engine

### FR-BIL-001: Automated Contract-Linked Period-End Invoicing
- **Description:** System SHALL aggregate verified trip completion and attendance data at month-end, applying contract pricing models (Per-Seat, Per-Trip, Per-Km, Surcharges) to auto-generate invoices.
- **Actors:** System Billing Engine, Travel Company Admin.
- **Priority:** High.
- **Acceptance Criteria:** Invoices generated with itemized breakdown, GST calculation, and zero manual spreadsheet calculations.

---

# 6. Non-Functional Requirements

## 6.1 Performance Requirements
- **NFR-PERF-001:** API response time for read operations SHALL be <100ms at 95th percentile.
- **NFR-PERF-002:** API response time for complex analytics queries SHALL be <1,500ms at 99th percentile.
- **NFR-PERF-003:** The real-time tracking pipeline SHALL handle up to 10,000 concurrent active bus trips with <1 second end-to-end telemetry propagation delay.

## 6.2 Availability & High Availability
- **NFR-AVL-001:** The platform SHALL maintain 99.99% multi-region uptime, excluding scheduled maintenance windows (max 1 hour/month announced 48 hours prior).
- **NFR-AVL-002:** Stateless microservices SHALL automatically auto-scale across multi-AZ Kubernetes deployment nodes when CPU utilization exceeds 70%.

## 6.3 Scalability
- **NFR-SCL-001:** Database layer SHALL support horizontal read scaling via PostgreSQL read replicas.
- **NFR-SCL-002:** Kafka topic cluster SHALL support partitioning to handle up to 1,000,000 daily active employee boarding events.

## 6.4 Security & Compliance
- **NFR-SEC-001:** All data in transit SHALL be encrypted using TLS 1.3.
- **NFR-SEC-002:** All sensitive data at rest (passwords, PII, API tokens) SHALL be encrypted using AES-256-GCM.
- **NFR-SEC-003:** System SHALL comply with GDPR and India DPDP regulations regarding data processing, right-to-be-forgotten, and auditability.

---

# 7. Business Rules

| Rule ID | Domain | Business Rule Statement | Enforcement Point |
|---|---|---|---|
| **BR-RULE-001** | Attendance | An employee cannot board a bus unless assigned to that specific route and shift date. | Boarding API / Redis |
| **BR-RULE-002** | Safety | No driver may start a trip without completing 100% of the pre-trip safety checklist. | Driver Mobile App |
| **BR-RULE-003** | Operations | A vehicle flagged under 'Active Maintenance' cannot be assigned to any trip schedule. | Scheduling Microservice |
| **BR-RULE-004** | Billing | Invoices once issued cannot be deleted; adjustments require formal credit notes. | Billing Microservice |
| **BR-RULE-005** | Security | Male employees cannot be assigned to female-only night shift routes (Shift hours 20:00–06:00). | Route Allocation Engine |
| **BR-RULE-006** | Subscription | Tenant API access is throttled immediately upon crossing plan quota limits. | API Gateway Filter |

---

# 8. User Stories (100+ Enterprise Stories)

### Module: Authentication & Tenant Administration (US-001 to US-015)
- **US-001:** As a Super Admin, I want to onboard a new Organization tenant so that they can start managing employee transportation.
- **US-002:** As a Super Admin, I want to assign custom feature flags to a tenant so that they can access paid add-on modules.
- **US-003:** As an Org Admin, I want to integrate our corporate SSO via SAML 2.0 so that employees can log in using their company credentials.
- **US-004:** As any User, I want to reset my password via OTP so that I can regain access if forgotten.
- **US-005:** As a Super Admin, I want to view platform-wide tenant health metrics so that I can identify at-risk customers.
- **US-006:** As a Travel Company Admin, I want to create user roles with granular permissions for my dispatchers and mechanics.
- **US-007:** As an Org Admin, I want session timeouts enforced after 15 minutes of inactivity to protect sensitive employee data.
- **US-008:** As a System, I want to lock user accounts after 5 consecutive failed login attempts to prevent brute-force attacks.
- **US-009:** As a Super Admin, I want to configure white-label subdomains (e.g., `transport.apextech.com`) per enterprise client.
- **US-010:** As a Security Auditor, I want to review all login attempts with IP address logs for security compliance.
- **US-011:** As an Employee, I want biometrics (Fingerprint/FaceID) enabled on my mobile app for quick, secure login.
- **US-012:** As an Admin, I want mandatory MFA enforced for all system administrator roles.
- **US-013:** As a Super Admin, I want to suspend a tenant for overdue payments, blocking user access while preserving data.
- **US-014:** As an Org Admin, I want to configure department-level administrative permissions.
- **US-015:** As a User, I want to revoke active sessions across all devices from my security profile settings.

### Module: Fleet & Asset Management (US-016 to US-030)
- **US-016:** As a Fleet Manager, I want to register new buses with seating layouts so that dynamic seat allocation works accurately.
- **US-017:** As a Fleet Manager, I want to pair hardware GPS trackers with vehicles using IMEI numbers.
- **US-018:** As a Fleet Manager, I want automated email alerts 30 days before vehicle insurance expires.
- **US-019:** As a Fleet Manager, I want to log fuel refill entries with odometer readings to track vehicle fuel efficiency.
- **US-020:** As a Fleet Manager, I want to record scheduled maintenance work orders with service costs.
- **US-021:** As a Fleet Manager, I want to mark a bus as 'Out of Service' so that schedulers cannot assign it to active trips.
- **US-022:** As a System, I want to detect fuel theft anomalies when fuel level drops sharply without distance covered.
- **US-023:** As a Fleet Manager, I want to upload digital copies of vehicle registration, fitness, and pollution certificates.
- **US-024:** As a Fleet Manager, I want to view a timeline history of all repairs and part replacements per vehicle.
- **US-025:** As a Fleet Manager, I want to track total cost of ownership (TCO) per vehicle across fuel, maintenance, and insurance.
- **US-026:** As a Dispatcher, I want a real-time status view of all available vs. busy vs. broken-down vehicles.
- **US-027:** As a Fleet Manager, I want to assign default spare buses for specific high-density routes.
- **US-028:** As an Auditor, I want to view vehicle compliance history during annual safety audits.
- **US-029:** As a Fleet Manager, I want to track tyre usage and replacement intervals based on kilometer logs.
- **US-030:** As a System, I want to trigger predictive maintenance alerts when vehicle mileage reaches service thresholds.

### Module: Driver & Conductor Operations (US-031 to US-045)
- **US-031:** As a Travel Company Admin, I want to onboard drivers with commercial driver's license documentation.
- **US-032:** As a Driver, I want to view my assigned trip schedule for the day on my mobile app.
- **US-033:** As a Driver, I want to complete a digital pre-trip inspection checklist before activating a trip.
- **US-034:** As a Driver, I want step-by-step turn navigation to each pickup point rendered on a map.
- **US-035:** As a Driver, I want to view the list of expected employees at the next pickup stop.
- **US-036:** As a Driver, I want to manually mark an employee present if their phone battery dies and QR code cannot be scanned.
- **US-037:** As a Driver, I want to trigger an instant road incident report with photo attachments in case of breakdown.
- **US-038:** As a Travel Company Admin, I want to view driver performance index scores based on safety and punctuality metrics.
- **US-039:** As a Driver, I want to submit leave requests through the mobile app.
- **US-040:** As a Dispatcher, I want to assign substitute drivers for trips when primary drivers take leave.
- **US-041:** As a Driver, I want voice assistance announcing upcoming pickup stops hands-free.
- **US-042:** As a System, I want to alert the dispatch center if driver telemetry indicates severe fatigue or erratic driving.
- **US-043:** As a Driver, I want to record shift end times and total kilometers driven.
- **US-044:** As a Conductor, I want a high-speed continuous QR scanning mode on my tablet during heavy boarding stops.
- **US-045:** As a Travel Company Admin, I want to track driver license renewal dates automatically.

### Module: Employee Experience & Mobile App (US-046 to US-065)
- **US-046:** As an Employee, I want to view my assigned bus number, driver photo, and contact details on my app home screen.
- **US-047:** As an Employee, I want to track my bus live on a map with real-time ETA updates.
- **US-048:** As an Employee, I want a push notification when my bus is 10 minutes away from my stop.
- **US-049:** As an Employee, I want to present a dynamic QR pass on my screen for instant boarding verification.
- **US-050:** As an Employee, I want to apply for transport leave on days I am working from home so the bus doesn't wait for me.
- **US-051:** As an Employee, I want to request a temporary pickup point change for a specific day.
- **US-052:** As an Employee, I want to rate my daily trip experience (1–5 stars) and leave comments.
- **US-053:** As an Employee, I want to view my complete monthly commute attendance history.
- **US-054:** As an Employee, I want to press a single SOS button to alert my emergency contacts and security team immediately.
- **US-055:** As an Employee, I want an automated alert if my bus route is diverted or delayed due to traffic.
- **US-056:** As an Employee, I want my QR pass accessible even when my phone has no internet connectivity.
- **US-057:** As an Employee, I want to submit a formal complaint regarding driver behavior or air conditioning failure.
- **US-058:** As an Employee, I want to receive safe arrival confirmation prompts upon reaching my home drop point.
- **US-059:** As an Employee, I want an AI chatbot in the app to answer common queries like "Where is my bus?".
- **US-060:** As an Employee, I want to configure notification preferences (Push vs SMS vs WhatsApp).
- **US-061:** As an Employee, I want to view assigned co-passengers on my route for safety assurance.
- **US-062:** As an Employee, I want dark mode support on the mobile app for night shift commute comfort.
- **US-063:** As an Employee, I want to view carbon emission savings generated by using corporate bus transport.
- **US-064:** As an Employee, I want to report a missed bus stop with location proof.
- **US-065:** As an Employee, I want to update emergency contact details directly from my profile.

### Module: Route Management & IoT GPS Tracking (US-066 to US-080)
- **US-066:** As an Org Admin, I want to create new routes by selecting pickup points on an interactive map.
- **US-067:** As a Dispatcher, I want to optimize route pickup sequences to minimize fuel consumption and transit time.
- **US-068:** As a System, I want to detect when a bus deviates more than 500 meters from its scheduled path and trigger an alert.
- **US-069:** As an Admin, I want to define custom geofence radiuses (50m–500m) around pickup points.
- **US-070:** As a System, I want to stream bus location pings to WebSocket clients every 3 seconds seamlessly.
- **US-071:** As a Dispatcher, I want historical trip replay capabilities to investigate speed complaints or route diversions.
- **US-072:** As an Admin, I want to assign specific shift timing windows (Morning, Evening, Night) to routes.
- **US-073:** As a System, I want to ingest IoT telemetry via MQTT protocols reliably without losing data.
- **US-074:** As a Dispatcher, I want to view traffic congestion heatmaps along active route corridors.
- **US-075:** As an Admin, I want to associate routes with specific corporate contract terms.
- **US-076:** As a System, I want to recalculate stop ETAs dynamically using Google Distance Matrix API during heavy traffic.
- **US-077:** As a Dispatcher, I want to push dynamic route changes to drivers mid-trip during road blockages.
- **US-078:** As an Admin, I want route capacity limits enforced during employee assignment.
- **US-079:** As a System, I want telemetry data older than 90 days automatically compressed and moved to cold storage.
- **US-080:** As an Auditor, I want a complete log of all route modifications made by administrators.

### Module: Billing, Invoicing & Analytics (US-081 to US-100+)
- **US-081:** As a Finance User, I want monthly invoices auto-generated based on verified contract rates and completed trip data.
- **US-082:** As a Travel Company Admin, I want line-item invoice breakdowns specifying per-trip, per-seat, and per-km charges.
- **US-083:** As an Org Admin, I want to approve or contest invoice line-items with attached dispute evidence.
- **US-084:** As a Finance User, I want tax calculations (GST/VAT) automatically computed based on regional tax laws.
- **US-085:** As an Org Admin, I want transport cost analytics broken down by department and cost center.
- **US-086:** As a Travel Company Admin, I want payment aging reports tracking overdue invoice amounts.
- **US-087:** As a Super Admin, I want platform MRR, ARR, and tenant churn metrics rendered on my executive dashboard.
- **US-088:** As an Org Admin, I want seat utilization reports showing underperforming routes running below 40% capacity.
- **US-089:** As a Travel Company Admin, I want fleet fuel efficiency reports comparing km-per-liter across different vehicle models.
- **US-090:** As an Org Admin, I want an Organization Transport Score dashboard rating overall commute safety and efficiency.
- **US-091:** As a Super Admin, I want to export custom analytics reports in PDF, Excel, and CSV formats.
- **US-092:** As a Travel Company Admin, I want contract utilization tracking (committed vs. actual trips executed).
- **US-093:** As an Org Admin, I want carbon footprint ESG reporting for corporate sustainability disclosures.
- **US-094:** As a Finance User, I want credit notes generated automatically when invoice disputes are resolved in favor of the client.
- **US-095:** As a System, I want AI demand forecasting models to suggest route consolidation options for next week's shifts.
- **US-096:** As a System, I want immutable audit logging of all financial transactions and invoice status changes.
- **US-097:** As a Travel Company Admin, I want to track driver payroll deductions based on verified attendance and penalty points.
- **US-098:** As an Org Admin, I want employee punctuality analytics measuring on-time arrival percentage at campus gates.
- **US-099:** As a Super Admin, I want subscription usage metering alerting when tenants near their employee tier limits.
- **US-100:** As a Finance User, I want to download bulk zip archives of signed monthly PDF invoices for tax filing.

---

# 9. Use Cases

## Use Case UC-001: Dynamic Boarding Verification via QR Code

```
+-----------------------------------------------------------------------------------+
| USE CASE UC-001: Dynamic Boarding Verification via QR Code                        |
+-----------------------------------------------------------------------------------+
| Primary Actor: Employee                                                           |
| Secondary Actors: Conductor / Security Guard, Boarding Microservice, Redis Cache  |
| Scope: FleetBridge Platform                                                       |
| Level: User-Goal Level                                                            |
+-----------------------------------------------------------------------------------+
| PRECONDITIONS:                                                                    |
| 1. Employee is assigned to an active route for today's shift.                     |
| 2. Vehicle is actively executing the trip in IN_PROGRESS status.                  |
| 3. Scanner device is authenticated and online.                                   |
+-----------------------------------------------------------------------------------+
| MAIN SUCCESS SCENARIO:                                                            |
| 1. Employee opens FleetBridge mobile app and navigates to Digital Bus Pass.       |
| 2. App generates dynamic QR code with HMAC-SHA256 signature (refreshed every 60s).|
| 3. Conductor/Guard scans QR code using scanner app camera.                        |
| 4. Scanner app posts payload to POST /api/v1/boarding/verify.                    |
| 5. Service validates HMAC signature against tenant secret key.                    |
| 6. Service verifies employee route assignment and trip schedule in Redis.          |
| 7. Service publishes 'boarding.confirmed' event to Kafka topic.                   |
| 8. Scanner app displays GREEN SUCCESS indicator with employee name and photo.     |
| 9. Employee app displays boarding confirmation toast notification.                |
| 10. Attendance record updated to 'BOARDED' in database.                           |
+-----------------------------------------------------------------------------------+
| EXTENSIONS (ALTERNATIVE FLOWS):                                                   |
| 5a. HMAC Signature Verification Fails (Expired / Tampered QR):                    |
|     1. Service returns HTTP 400 Bad Request (Error Code: INVALID_QR_PASS).        |
|     2. Scanner app plays ERROR CHIME and displays RED WARNING indicator.          |
|     3. Conductor prompts employee to refresh QR screen.                           |
| 6a. Employee assigned to different route:                                         |
|     1. Service returns HTTP 403 Forbidden (Error Code: UNASSIGNED_ROUTE).         |
|     2. Scanner app displays AMBER ALERT with assigned route number details.       |
|     3. Conductor performs manual override if permitted by policy.                 |
+-----------------------------------------------------------------------------------+
| POST CONDITIONS:                                                                  |
| - Verified boarding record saved with timestamp, lat/long coordinates, scanner ID. |
| - Vehicle active seat count incremented by 1 in Redis cache.                      |
+-----------------------------------------------------------------------------------+
```

---

# 10. External Integrations

```
+-----------------------------------------------------------------------------------+
| EXTERNAL INTEGRATIONS MAP                                                         |
+-----------------------------------------------------------------------------------+
| Integrator Service | Protocol | Purpose / Description                             |
+--------------------+----------+---------------------------------------------------+
| Google Maps API    | HTTPS    | Distance Matrix, Directions, Geocoding, Map Tiles |
| Keycloak IAM       | OIDC/SAML| Central Identity Provider, SSO, Realm Management  |
| Firebase (FCM)     | HTTPS/gRPC| Android Push Notifications delivery              |
| Twilio / AWS SNS   | REST API | Transactional SMS & Emergency Alerts delivery     |
| Meta WhatsApp API  | REST API | Trip updates & PDF invoice delivery via WhatsApp  |
| Stripe / Razorpay  | REST API | SaaS subscription credit card & UPI billing       |
| AWS S3 Object Store| AWS SDK  | Document storage (PDFs, Images, KYC, Invoices)    |
| PostgreSQL / Timescale| JDBC  | Relational RLS storage & Time-series GPS telemetry|
| Apache Kafka       | Binary TCP| Enterprise Event Streaming Backbone               |
| Redis Cluster      | Binary TCP| Distributed caching, session store, rate limits   |
+-----------------------------------------------------------------------------------+
```

---

# 11. Security Requirements

## 11.1 Identity & Access Control Architecture
- **Authentication:** OAuth2 with PKCE (Proof Key for Code Exchange) for mobile clients; Authorization Code Flow for Web Portals.
- **Tokens:** Stateless JSON Web Tokens (JWT) signed using RSA-256 private keys. Tokens contain explicit claims (`tenant_id`, `user_id`, `roles`, `permissions`, `exp`).
- **Multi-Tenant Isolation:** Database enforced using PostgreSQL Row-Level Security (RLS). Every query automatically appends tenant context via session context `SET LOCAL app.current_tenant_id = '...'`.

## 11.2 Application & API Security
- **OWASP Top 10 Protections:** API Gateway enforces request validation, input sanitization, SQL Injection prevention via parameterized ORM (Hibernate), XSS filtering, and CSRF token protection.
- **Rate Limiting:** Enforced at API Gateway using Redis Token Bucket algorithm (100 req/min per user default; 1,000 req/min for IoT telemetry streams).
- **Transport Security:** Strict TLS 1.3 enforced on all external endpoints; HTTP Strict Transport Security (HSTS) header enabled with 1-year max-age.

---

# 12. Data Requirements

## 12.1 Data Classification & Encryption

| Data Class | Examples | Storage Requirement | Encryption Requirement |
|---|---|---|---|
| **Public Data** | Route stop names, general announcements | PostgreSQL / S3 | Plaintext / Standard TLS |
| **Operational Data**| Trip schedules, vehicle mileage, fuel logs | PostgreSQL / TimescaleDB | AES-256 at Rest, TLS 1.3 in Transit |
| **PII Data** | Employee names, phone numbers, home addresses | PostgreSQL (Column Encrypted) | AES-256-GCM Field Level Encryption |
| **Sensitive Auth** | Password hashes, HMAC keys, API Secrets | Keycloak / AWS Secrets Manager | Argon2id / AWS KMS Encrypted |

## 12.2 Retention & Archival Policies
- **GPS Telemetry Data:** Retained in primary TimescaleDB for 90 days; auto-partitioned and archived to S3 Glacier for 3 years, then purged.
- **Financial Invoices & Audit Logs:** Retained in online database for 7 years to meet statutory enterprise tax compliance requirements.
- **Soft Delete Policy:** Entities (Employees, Vehicles, Routes) SHALL utilize soft-deletion flags (`is_deleted = boolean`, `deleted_at = timestamp`) to maintain historical relational integrity.

---

# 13. Reporting Requirements

```
+-----------------------------------------------------------------------------------+
| SYSTEM REPORTING SPECIFICATIONS                                                   |
+-----------------------------------------------------------------------------------+
| Report Name | Frequency | Target Audience | Primary Content Metrics               |
+-------------+-----------+-----------------+---------------------------------------+
| Executive   | Monthly   | Super Admin /   | MRR, ARR, Active Tenants, Churn Rate, |
| Dashboard   |           | Platform Owner  | System Health Score, API Volume       |
+-------------+-----------+-----------------+---------------------------------------+
| Transport   | Daily /   | Org Admin /     | Seat Utilization %, On-Time Arrival %,|
| Efficiency  | Monthly   | HR Director     | Cost per Employee, Missed Trip Count  |
+-------------+-----------+-----------------+---------------------------------------+
| Fleet Health| Weekly    | Travel Company  | Km per Liter, Maintenance Expense,    |
| & Fuel Log  |           | Admin           | Driver Performance Index, Breakdown % |
+-------------+-----------+-----------------+---------------------------------------+
| Safety &    | Real-Time /| Org Safety     | SOS Triggers, Geofence Deviations,    |
| Incident Log| Weekly    | Committee       | Speed Violations, Female Drop Audits  |
+-------------+-----------+-----------------+---------------------------------------+
| ESG Carbon  | Quarterly | Enterprise ESG  | CO2 Emissions Saved (Kgs), Diesel vs  |
| Footprint   |           | Officer         | EV Mileage, Shared Commute Index      |
+-----------------------------------------------------------------------------------+
```

---

# 14. Notifications

## 14.1 Multi-Channel Delivery Matrix

| Trigger Event | Priority | Push (FCM) | SMS | WhatsApp | Email | Channel Fallback Sequence |
|---|---|---|---|---|---|---|
| **SOS Triggered** | Critical | YES | YES | YES | YES | Push -> SMS -> WhatsApp (Simultaneous) |
| **Bus 15 Min Away**| High | YES | NO | YES | NO | Push -> WhatsApp |
| **Route Changed** | High | YES | YES | NO | NO | Push -> SMS |
| **Invoice Issued** | Medium | NO | NO | YES | YES | Email -> WhatsApp |
| **Driver Assign** | Medium | YES | NO | NO | NO | Push |

---

# 15. Error Handling

## 15.1 Standardized API Error Response Format
All microservices SHALL return errors complying with the RFC 7807 Problem Details specification:

```json
{
  "type": "https://api.fleetbridge.com/errors/UNAUTHORIZED_BOARDING",
  "title": "Invalid Boarding Attempt",
  "status": 403,
  "detail": "Employee EMP-8849 is not assigned to Route R-102 for target trip date 2026-07-28.",
  "instance": "/api/v1/boarding/verify",
  "code": "ERR_BRD_UNASSIGNED_ROUTE",
  "timestamp": "2026-07-28T23:35:00Z",
  "tenantId": "TNT-ORG-APEXTECH"
}
```

## 15.2 Resiliency & Circuit Breaking
- Inter-service HTTP communications managed via **Resilience4j** circuit breakers.
- Circuit transitions to `OPEN` state when failure rate exceeds 50% over a 10-second window; fallbacks serve degraded cached data from Redis.

---

# 16. Constraints

## 16.1 Technical Constraints
- Mobile applications must maintain compatibility with Android 9.0+ (API Level 28+).
- System must run entirely on cloud infrastructure using containerized Kubernetes deployments.

## 16.2 Business & Regulatory Constraints
- System must comply with India Digital Personal Data Protection (DPDP) Act 2023 and European Union GDPR regulations.
- Female employee night transport drops (20:00 to 06:00) require mandatory security guard validation rules as mandated by corporate labor compliance laws.

---

# 17. Risks & Mitigation Matrix

```
+-----------------------------------------------------------------------------------+
| RISK MATRIX & MITIGATION STRATEGIES                                               |
+-----------------------------------------------------------------------------------+
| Risk Description | Severity | Likelihood | Mitigation Strategy                        |
+------------------+----------+------------+--------------------------------------------+
| GPS Telemetry    | HIGH     | MEDIUM     | Implement IoT device buffer stores; fallback|
| Loss in Dead Zones|         |            | to Driver App cell-tower triangulation.   |
+------------------+----------+------------+--------------------------------------------+
| High Concurrency | CRITICAL | MEDIUM     | Pre-scale Redis Clusters during peak shift |
| QR Scan Spikes   |          |            | hours (07:00-09:00 & 17:00-19:00).         |
+------------------+----------+------------+--------------------------------------------+
| Database Tenant  | CRITICAL | LOW        | Enforce automated integration tests for    |
| Data Cross-Leak  |          |            | PostgreSQL RLS policy validation on every CI|
+------------------+----------+------------+--------------------------------------------+
| SMS Gateway      | HIGH     | MEDIUM     | Configure multi-provider failover routing  |
| Delivery Outage  |          |            | (Twilio -> AWS SNS -> Local Gateway).      |
+-----------------------------------------------------------------------------------+
```

---

# 18. Future Enhancements (Phase 2+)

- **AI Route Optimization Engine:** Constraint satisfaction solver auto-consolidating pickup stops based on live traffic patterns.
- **Facial Recognition Boarding:** Camera-based biometrics on high-capacity buses as an alternative to QR scanning.
- **Electric Vehicle (EV) Management:** Battery state-of-charge (SoC) monitoring and automated charging station stop integration.

---

# 19. Module Acceptance Criteria

| Module | Verification Method | Acceptance Criteria |
|---|---|---|
| **Multi-Tenancy** | Automated Security Audit | Zero data visible across tenant boundaries across 1,000 synthetic queries. |
| **GPS Tracking** | Load Test (k6) | Telemetry propagation latency stays <1s under 10,000 active streams. |
| **QR Boarding** | Integration Test | 100% of expired or signature-tampered QR passes rejected instantly. |
| **SOS Emergency** | End-to-End Test | All notification channels triggered within <10s of SOS button press. |
| **Billing Engine**| Financial Audit Test | Invoice calculations match mathematically verified test fixtures to 4 decimal places. |

---

# 20. Glossary

- **Bounded Context:** Explicit boundary within which a Domain Model applies in Domain-Driven Design.
- **Geofence:** A virtual geographic boundary defined by GPS coordinates and radius.
- **HMAC:** Hash-based Message Authentication Code used for cryptographic signature validation.
- **Keycloak Realm:** Isolated space in Keycloak managing a distinct set of users, roles, and credentials.
- **Row-Level Security (RLS):** Feature in PostgreSQL restricting table row visibility based on execution user context.
- **STOMP:** Simple Text Oriented Messaging Protocol operating over WebSockets for real-time messaging.
- **TimescaleDB:** Open-source time-series database extension optimized for high-ingestion IoT telemetry data.

---
*End of IEEE 29148 Software Requirements Specification — FleetBridge Platform v1.0.0*
