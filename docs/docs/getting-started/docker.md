---
sidebar_position: 3
---

# Docker

## Build the image

```bash
docker build -t timeserver:latest .
```

The Dockerfile uses a multi-stage build — the builder stage compiles TypeScript, the production stage runs only the compiled output with production dependencies. Both stages run `apk upgrade` and `npm install -g npm@latest` to patch known CVEs in Alpine packages and npm's bundled dependencies.

## Run the container

```bash
docker run -d -p 8888:8888 --name timeserver timeserver:latest
```

## Verify

```bash
curl http://localhost:8888/health/live
curl http://localhost:8888/api/v1/time
```

## Stop and remove

```bash
docker stop timeserver && docker rm timeserver
```
