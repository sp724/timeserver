---
sidebar_position: 2
---

# Helm Values

All configurable values for the `helm/timeserver` chart.

## Image

```yaml
image:
  repository: timeserver
  tag: latest
  pullPolicy: IfNotPresent
```

## Replicas

```yaml
replicaCount: 1
```

When `autoscaling.enabled` is `true`, the `replicaCount` field is ignored — HPA controls pod count.

## Application config

Injected into the pod via a ConfigMap:

```yaml
config:
  PORT: "8888"
  NODE_ENV: "production"
```

## Autoscaling (HPA)

```yaml
autoscaling:
  enabled: false
  minReplicas: 2
  maxReplicas: 5
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

## Pod Disruption Budget

```yaml
podDisruptionBudget:
  enabled: false
  minAvailable: 1
```

## Network Policy

```yaml
networkPolicy:
  enabled: false
```

When enabled, only ingress on port 8888 and egress to DNS (port 53) are permitted.

## Resource Quota

```yaml
resourceQuota:
  enabled: false
  hard:
    pods: "10"
    requests.cpu: "2"
    requests.memory: 2Gi
    limits.cpu: "4"
    limits.memory: 4Gi
```

## Secrets

Secrets are never stored in `values.yaml`. Instead, copy the example file and fill in your values:

```bash
cp helm/timeserver/values.secret.yaml.example helm/timeserver/values.secret.yaml
```

Then pass it at install/upgrade time:

```bash
helm install timeserver helm/timeserver \
  -f helm/timeserver/values.secret.yaml
```

The `values.secret.yaml` file is gitignored and will never be committed.

```yaml
# values.secret.yaml structure
secret:
  create: true
  data:
    MY_SECRET_KEY: "my-secret-value"
```

## Resources

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi
```

## Probes

```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 8888
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8888
```
