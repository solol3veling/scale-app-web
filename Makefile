APP_NAME := scale-app-frontend
REGISTRY := ghcr.io
IMAGE_NAME := $(REGISTRY)/$(GITHUB_REPOSITORY)/frontend

GREEN := \033[0;32m
BLUE := \033[0;34m
NC := \033[0m 

.DEFAULT_GOAL := help

.PHONY: help
help: ## Show available commands
	@echo "$(BLUE)Scale App Frontend$(NC)"
	@echo "=================="
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: install
install: ## Install dependencies
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	npm ci

.PHONY: dev
dev: ## Start development server
	@echo "$(BLUE)🚀 Starting development server...$(NC)"
	npm run dev

.PHONY: dev-docker
dev-docker: ## Start development with Docker
	@echo "$(BLUE)🐳 Starting with Docker...$(NC)"
	docker-compose --profile dev up --build

.PHONY: stop
stop: ## Stop Docker containers
	@echo "$(BLUE)🛑 Stopping containers...$(NC)"
	docker-compose down

# ============================================================================
# Quality
# ============================================================================

.PHONY: lint
lint: ## Run linter
	@echo "$(BLUE)🔍 Running linter...$(NC)"
	npm run lint

.PHONY: build-local
build-local: ## Build locally
	@echo "$(BLUE)🏗️ Building locally...$(NC)"
	npm run build

.PHONY: check
check: lint build-local ## Run quality checks
	@echo "$(GREEN)✅ Quality checks completed$(NC)"

# ============================================================================
# Docker
# ============================================================================

.PHONY: build
build: ## Build Docker image
	@echo "$(BLUE)🐳 Building Docker image...$(NC)"
	docker build -t $(APP_NAME):latest .

.PHONY: run
run: ## Build and run with Docker Compose
	@echo "$(BLUE)🚀 Running with Docker Compose...$(NC)"
	docker-compose --profile prod up --build

.PHONY: run-detached
run-detached: ## Build and run in background
	@echo "$(BLUE)🚀 Running in background...$(NC)"
	docker-compose --profile prod up --build -d

# ============================================================================
# Maintenance
# ============================================================================

.PHONY: clean
clean: ## Clean up
	@echo "$(BLUE)🧹 Cleaning up...$(NC)"
	rm -rf dist/
	docker system prune -f

.PHONY: logs
logs: ## Show container logs
	@echo "$(BLUE)📋 Container logs:$(NC)"
	docker-compose logs -f

.PHONY: shell
shell: ## Open shell in container
	@echo "$(BLUE)🐚 Opening shell...$(NC)"
	docker-compose exec frontend sh
