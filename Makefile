IMAGE     ?= timeserver
TAG       ?= $(shell git rev-parse --short HEAD)
PORT      ?= 8888
NAMESPACE ?= default

.PHONY: help install dev build start test lint docker-build docker-run docker-stop \
        compose-up compose-down compose-logs \
        minikube-load helm-install helm-upgrade helm-uninstall deploy smoke-test

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Local development ────────────────────────────────────────────────────────

install: ## Install Node.js dependencies
	npm install

dev: ## Run in development mode (ts-node, no compile step)
	npm run dev

build: ## Compile TypeScript to dist/
	npm run build

start: build ## Compile then run the server
	npm start

test: ## Run tests with coverage
	npm test

lint: ## Run ESLint
	npm run lint

# ── Docker ───────────────────────────────────────────────────────────────────

docker-build: ## Build Docker image (IMAGE=timeserver TAG=<git-sha>)
	docker build -t $(IMAGE):$(TAG) .
	docker tag $(IMAGE):$(TAG) $(IMAGE):latest

docker-run: ## Run container on PORT (default 8888)
	docker run -d -p $(PORT):8888 --name timeserver $(IMAGE):latest

docker-stop: ## Stop and remove the container
	docker stop timeserver && docker rm timeserver

# ── Docker Compose (timeserver + Prometheus + Grafana) ───────────────────────

compose-up: ## Start full local stack (timeserver, Prometheus, Grafana)
	docker compose up --build -d

compose-down: ## Stop and remove compose stack
	docker compose down

compose-logs: ## Tail logs for all compose services
	docker compose logs -f

# ── Kubernetes / Helm ────────────────────────────────────────────────────────

minikube-load: docker-build ## Build image and load it into minikube
	minikube image load $(IMAGE):$(TAG)
	minikube image load $(IMAGE):latest

helm-install: ## Install Helm release (uses values.secret.yaml if present)
	helm install timeserver helm/timeserver \
		--namespace $(NAMESPACE) \
		--set image.repository=$(IMAGE) \
		--set image.tag=$(TAG) \
		--set image.pullPolicy=Never \
		$(if $(wildcard helm/timeserver/values.secret.yaml),-f helm/timeserver/values.secret.yaml)

helm-upgrade: ## Upgrade existing Helm release
	helm upgrade timeserver helm/timeserver \
		--namespace $(NAMESPACE) \
		--set image.repository=$(IMAGE) \
		--set image.tag=$(TAG) \
		--set image.pullPolicy=Never \
		--wait \
		$(if $(wildcard helm/timeserver/values.secret.yaml),-f helm/timeserver/values.secret.yaml)

helm-uninstall: ## Uninstall Helm release
	helm uninstall timeserver --namespace $(NAMESPACE)

deploy: minikube-load helm-upgrade ## Build, load into minikube, and upgrade Helm release

smoke-test: ## Run smoke tests against localhost:PORT
	npm run smoke-test
