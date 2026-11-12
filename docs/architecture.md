# Azahar HomeBase — Architecture Documentation

## 1. Overview

Azahar HomeBase is a self-hosted home infrastructure and application project running on Ubuntu Server.

The platform combines a React frontend, Node.js backend, SQLite database and an independent infrastructure monitoring stack.

The architecture is divided into two main areas:

- HomeBase application services.
- Infrastructure monitoring services.

## 2. Application Architecture

### Frontend

**Technologies:** React, Vite, JavaScript

Responsibilities:
- Provides the HomeBase user interface.
- Displays family and administration views.
- Communicates with backend API endpoints.
- Handles administrator login and logout.

### Backend

**Technologies:** Node.js, Express

Responsibilities:
- Provides REST API endpoints.
- Handles application requests.
- Performs administrator authentication.
- Retrieves system information.
- Integrates with Docker through Dockerode.

### Database

**Technology:** SQLite

Responsibilities:
- Stores application data.
- Provides local database persistence.

### Authentication

The backend implements:
- Password verification using Node.js scrypt.
- HMAC-SHA256 signed session tokens.
- HttpOnly session cookies.
- SameSite cookie protection.
- Session expiration.
- Login attempt rate limiting.

Authentication configuration is stored in environment variables and excluded from version control.

## 3. Infrastructure Monitoring Architecture

The monitoring stack is deployed independently using Docker Compose.

### Node Exporter

Collects and exposes Linux host metrics, including:
- CPU utilisation.
- Memory usage.
- Filesystem information.
- Disk activity.
- Network statistics.

### Prometheus

Prometheus collects metrics from Node Exporter.

Configuration:
- Scrape interval: 60 seconds.
- Prometheus self-monitoring enabled.
- Persistent time-series storage.
- Default retention: 15 days.

### Grafana

Grafana OSS provides infrastructure visualisation.

The Node Exporter Full dashboard displays:
- CPU usage.
- System load.
- RAM and swap.
- Disk capacity and I/O.
- Network activity.
- System uptime.

### Monitoring Data Flow

Ubuntu Host → Node Exporter → Prometheus → Grafana

## 4. Container Deployment

Docker Compose manages the monitoring services.

Configuration location:

`monitoring/docker-compose.yml`

Prometheus configuration:

`monitoring/prometheus/prometheus.yml`

Persistent Docker volumes:
- `monitoring_grafana_data`
- `monitoring_prometheus_data`

The monitoring services operate independently from the HomeBase application.

## 5. Network Architecture

The monitoring stack uses a dedicated Docker Compose network.

Internal service communication:
- Grafana communicates with Prometheus using `http://prometheus:9090`.
- Prometheus collects Node Exporter metrics using `node-exporter:9100`.

Grafana is published on host port 3002.

Prometheus and Node Exporter ports are not published to the host network in the current Compose configuration.

## 6. AWS Contingency Architecture

AWS EC2 is being explored as a contingency environment.

The proposed architecture considers:
- Physical HomeBase infrastructure as the primary environment.
- AWS EC2 as a potential recovery environment.
- Application deployment and configuration recovery.
- Data recovery and service restoration.
- Access switching and eventual failback.

Automated failover, synchronised data recovery and production disaster recovery are not currently demonstrated by this repository.

## 7. Design Principles

- Separation of application and monitoring responsibilities.
- Container-based deployment.
- Persistent application and monitoring data.
- Environment-based secret configuration.
- Incremental infrastructure changes.
- Monitoring and verification before making operational changes.
- Documentation of implemented and proposed components separately.

## 8. Current Architecture Status

| Component | Status |
|---|---|
| Ubuntu HomeBase server | Implemented |
| React frontend | Implemented |
| Node.js backend | Implemented |
| SQLite database | Implemented |
| Backend authentication | Implemented |
| Docker Compose monitoring | Implemented |
| Node Exporter | Implemented |
| Prometheus | Implemented |
| Grafana OSS | Implemented |
| AWS contingency design | Proposed |
| Automated AWS failover | Not implemented |
