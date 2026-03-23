---
sidebar_position: 1
---

# Kubernetes Hardening

The Helm chart includes several optional hardening resources. All are **disabled by default** — enable them explicitly in your values file.

## HorizontalPodAutoscaler

Scales the deployment based on CPU and memory utilization.

```yaml
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 5
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

When `autoscaling.enabled` is `true`, the `replicaCount` field in the Deployment is suppressed — HPA owns replica count.

Requires the [metrics-server](https://github.com/kubernetes-sigs/metrics-server) to be running in the cluster. On minikube:

```bash
minikube addons enable metrics-server
```

## PodDisruptionBudget

Ensures a minimum number of pods remain available during voluntary disruptions (node drains, rolling updates):

```yaml
podDisruptionBudget:
  enabled: true
  minAvailable: 1
```

Requires at least 2 running replicas to be meaningful. Best used alongside HPA.

## NetworkPolicy

Restricts traffic to only what the service needs:

- **Ingress**: port 8888 from any source
- **Egress**: DNS (port 53) only

```yaml
networkPolicy:
  enabled: true
```

Requires a CNI plugin that enforces NetworkPolicy (e.g. Calico, Cilium). On minikube:

```bash
minikube start --network-plugin=cni --cni=calico
```

## ResourceQuota

Caps total resource consumption in the namespace:

```yaml
resourceQuota:
  enabled: true
  hard:
    pods: "10"
    requests.cpu: "2"
    requests.memory: 2Gi
    limits.cpu: "4"
    limits.memory: 4Gi
```

Protects the cluster from runaway resource usage. The quota applies to the namespace the chart is installed in.

## ConfigMap

Application config (`PORT`, `NODE_ENV`) is stored in a ConfigMap and mounted as environment variables. This separates config from the container image.

```yaml
config:
  PORT: "8888"
  NODE_ENV: "production"
```

## Security context

The container runs as a non-root user. The Deployment sets:

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
```

## Secrets

See the [Secrets](../secrets.md) page for the Kubernetes Secrets pattern used in this project.
