---
slug: /
sidebar_position: 1
---

# Introduction

**timeserver** is a production-ready Node.js/TypeScript REST API that returns the current time in 5 timezones: Toronto, London, Mumbai, Tokyo, and Sydney.

It was built as a reference project covering everything from a basic Express API to a fully hardened, observable, and automatically deployed service.

## What's inside

| Area | What was built |
|---|---|
| **API** | REST endpoints with rate limiting, input validation, and OpenAPI docs |
| **Observability** | Structured JSON logging, Prometheus metrics, distributed tracing, Grafana dashboard |
| **Security** | Helmet headers, Zod validation, Trivy image scanning, Kubernetes Secrets |
| **CI/CD** | 7-job GitHub Actions pipeline on a self-hosted runner with automatic minikube deployment |
| **Kubernetes** | Helm chart with ConfigMap, HPA, PDB, NetworkPolicy, ResourceQuota |
| **Developer Experience** | ESLint, pre-commit hooks, OpenAPI docs, Docusaurus documentation |

## Quick start

```bash
git clone https://github.com/sp724/timeserver.git
cd timeserver
nvm use
npm install
npm run dev
```

Then hit the API:

```bash
curl http://localhost:8888/api/v1/time
```

## Source code

[github.com/sp724/timeserver](https://github.com/sp724/timeserver)
