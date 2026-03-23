---
sidebar_position: 1
---

# Minikube

Deploy timeserver to a local Kubernetes cluster using minikube and Helm.

## Prerequisites

- minikube, kubectl, and Helm v3+ installed (see [Prerequisites](../getting-started/prerequisites.md))
- Docker image built locally

## Start minikube

```bash
minikube start
```

## Build and load the image

Build the image and load it directly into minikube's Docker daemon (no registry needed):

```bash
docker build -t timeserver:latest .
minikube image load timeserver:latest
```

## Install with Helm

```bash
helm install timeserver helm/timeserver \
  --set image.repository=timeserver \
  --set image.tag=latest \
  --set image.pullPolicy=Never
```

The `pullPolicy: Never` flag tells Kubernetes to use the locally loaded image rather than pulling from a registry.

## Verify the deployment

```bash
kubectl get pods
kubectl get svc
```

Wait for the pod to reach `Running` state.

## Access the API

Port-forward to reach the service from your machine:

```bash
kubectl port-forward svc/timeserver 8888:8888
```

Then in another terminal:

```bash
curl http://localhost:8888/health/live
curl http://localhost:8888/api/v1/time
```

## Upgrade

After rebuilding the image:

```bash
minikube image load timeserver:latest
helm upgrade timeserver helm/timeserver \
  --set image.repository=timeserver \
  --set image.tag=latest \
  --set image.pullPolicy=Never
```

## Uninstall

```bash
helm uninstall timeserver
```
