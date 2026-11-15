# Infrastructure Monitoring — Azahar HomeBase

## 1. Overview

Azahar HomeBase uses a self-hosted monitoring stack deployed through Docker Compose.

The stack consists of:

- Prometheus 3.16.0 — metrics collection and time-series storage.
- Node Exporter 1.12.1 — Linux host metrics.
- Grafana OSS 13.0.2 — dashboards and visualisation.

Container images are pinned to these versions in
`monitoring/docker-compose.yml` to improve deployment reproducibility.
The monitoring stack operates independently of the HomeBase application.

## 2. Architecture

```text
Ubuntu HomeBase Server
        |
        v
   Node Exporter
        |
        | Metrics endpoint :9100
        v
    Prometheus
        |
        | PromQL queries
        v
     Grafana
        |
        v
 Infrastructure Dashboard
```

## 3. Deployment

The monitoring configuration is maintained in:

`monitoring/docker-compose.yml`

Prometheus configuration:

`monitoring/prometheus/prometheus.yml`

Start the monitoring stack:

```bash
docker compose -f monitoring/docker-compose.yml up -d
```

Check container status:

```bash
docker compose -f monitoring/docker-compose.yml ps
```

View Prometheus logs:

```bash
docker compose -f monitoring/docker-compose.yml logs --tail=20 prometheus
```

## 4. Prometheus Configuration

Prometheus is configured with a 60-second scrape interval.

Configured targets:

| Target | Purpose |
|---|---|
| prometheus:9090 | Prometheus self-monitoring |
| node-exporter:9100 | Ubuntu host metrics |

Prometheus stores collected metrics in a persistent Docker volume.

The default data retention period is 15 days.

## 5. Node Exporter Metrics

Node Exporter provides Linux host-level metrics.

Monitored areas include:

- CPU utilisation.
- System load.
- Memory and swap.
- Filesystem capacity.
- Disk read/write operations.
- Network traffic.
- System uptime.

## 6. Grafana Configuration

Grafana OSS is deployed on host port 3002.

The Prometheus data source uses the internal Docker service address:

`http://prometheus:9090`

The imported Node Exporter Full dashboard provides infrastructure performance visualisation.

## 7. Verification

Check Prometheus targets:

```bash
docker exec azahar-prometheus \
  wget -qO- http://localhost:9090/api/v1/targets
```

Expected result:

Both Prometheus and Node Exporter should report:

`"health":"up"`

Check running monitoring containers:

```bash
docker compose -f monitoring/docker-compose.yml ps
```

## 8. Persistent Storage

Two named Docker volumes are used:

- `monitoring_grafana_data`
- `monitoring_prometheus_data`

These preserve Grafana configuration and Prometheus metrics across container restarts.

## 9. Operational Considerations

- Prometheus collects metrics every 60 seconds.
- Node Exporter runs as a container with read-only host filesystem mounts.
- Prometheus and Node Exporter ports are not published to the host network.
- Grafana is currently published on host port 3002.
- Grafana network access hardening remains a planned improvement.

## 10. Future Improvements

- Restrict Grafana access to the trusted home network.
- Configure monitoring alerts.
- Add service availability monitoring.
- Monitor Docker container resource usage.
- Document backup and restoration of monitoring data.
