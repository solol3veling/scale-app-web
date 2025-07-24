# ============================================================================
# Scale App Frontend - Makefile
# ============================================================================

# Configuration
APP_NAME := scale-app-frontend
REGISTRY := ghcr.io
IMAGE_NAME := $(REGISTRY)/$(GITHUB_REPOSITORY)/frontend
NODE_VERSION := 20
DOCKER_BUILDX_PLATFORM := linux/amd64,linux/arm64

# Environment Detection
ifeq ($(ENV),)
	ENV := development
endif

# Version Generation
ifeq ($(VERSION),)
	VERSION := $(shell date +'%Y.%m.%d')-$(shell git rev-parse --short HEAD)
endif

# Tag Generation
TAG := $(ENV)-$(VERSION)
LATEST_TAG := $(ENV)-latest

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Environment Files
ENV_FILE := .env.$(ENV)
ifeq ($(wildcard $(ENV_FILE)),)
	ENV_FILE := .env.local
endif

# Load environment variables
ifneq ($(wildcard $(ENV_FILE)),)
	include $(ENV_FILE)
	export
endif

# Default target
.DEFAULT_GOAL := help

# ============================================================================
# Help
# ============================================================================

.PHONY: help
help: ## Show this help message
	@echo "$(BLUE)Scale App Frontend - Development & Deployment$(NC)"
	@echo "================================================"
	@echo ""
	@echo "$(YELLOW)Usage:$(NC) make [target] [ENV=environment] [VERSION=version]"
	@echo ""
	@echo "$(YELLOW)Available targets:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Examples:$(NC)"
	@echo "  make dev                     # Start development environment"
	@echo "  make build ENV=production    # Build production image"
	@echo "  make deploy ENV=staging      # Deploy to staging"
	@echo "  make test                    # Run all tests"

# ============================================================================
# Development
# ============================================================================

.PHONY: install
install: ## Install dependencies
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	npm ci --no-audit --no-fund
	@echo "$(GREEN)✅ Dependencies installed$(NC)"

.PHONY: dev
dev: ## Start development server
	@echo "$(BLUE)🚀 Starting development server...$(NC)"
	npm run dev

.PHONY: dev-docker
dev-docker: ## Start development server with Docker
	@echo "$(BLUE)🐳 Starting development server with Docker...$(NC)"
	docker-compose -f docker-compose.dev.yml up --build

.PHONY: dev-docker-detached
dev-docker-detached: ## Start development server with Docker (detached)
	@echo "$(BLUE)🐳 Starting development server with Docker (detached)...$(NC)"
	docker-compose -f docker-compose.dev.yml up --build -d

.PHONY: stop-dev
stop-dev: ## Stop development Docker containers
	@echo "$(BLUE)🛑 Stopping development containers...$(NC)"
	docker-compose -f docker-compose.dev.yml down

# ============================================================================
# Quality Assurance
# ============================================================================

.PHONY: lint
lint: ## Run ESLint
	@echo "$(BLUE)🔍 Running ESLint...$(NC)"
	npm run lint

.PHONY: lint-fix
lint-fix: ## Run ESLint with auto-fix
	@echo "$(BLUE)🔧 Running ESLint with auto-fix...$(NC)"
	npm run lint -- --fix

.PHONY: test
test: ## Run tests
	@echo "$(BLUE)🧪 Running tests...$(NC)"
	@if npm run | grep -q "test"; then \
		npm run test; \
	else \
		echo "$(YELLOW)⚠️ No test script found$(NC)"; \
	fi

.PHONY: test-coverage
test-coverage: ## Run tests with coverage
	@echo "$(BLUE)🧪 Running tests with coverage...$(NC)"
	@if npm run | grep -q "test"; then \
		npm run test -- --coverage --watchAll=false; \
	else \
		echo "$(YELLOW)⚠️ No test script found$(NC)"; \
	fi

.PHONY: audit
audit: ## Run security audit
	@echo "$(BLUE)🔒 Running security audit...$(NC)"
	npm audit --audit-level moderate

.PHONY: check
check: lint test audit ## Run all quality checks
	@echo "$(GREEN)✅ All quality checks completed$(NC)"

# ============================================================================
# Build
# ============================================================================

.PHONY: build-local
build-local: ## Build application locally
	@echo "$(BLUE)🏗️ Building application locally...$(NC)"
	npm run build
	@echo "$(GREEN)✅ Local build completed$(NC)"
	@du -sh dist/

.PHONY: build-analyze
build-analyze: build-local ## Build and analyze bundle size
	@echo "$(BLUE)📊 Analyzing bundle size...$(NC)"
	@find dist/ -name "*.js" -exec du -sh {} \; | sort -hr | head -10

.PHONY: build
build: ## Build Docker image
	@echo "$(BLUE)🐳 Building Docker image...$(NC)"
	@echo "Environment: $(ENV)"
	@echo "Version: $(VERSION)"
	@echo "Tag: $(TAG)"
	@echo "Registry: $(IMAGE_NAME)"
	@$(MAKE) _build-docker

.PHONY: _build-docker
_build-docker:
	docker buildx build \
		--platform $(DOCKER_BUILDX_PLATFORM) \
		--tag $(IMAGE_NAME):$(TAG) \
		--tag $(IMAGE_NAME):$(LATEST_TAG) \
		--build-arg VITE_API_BASE_URL=$(VITE_API_BASE_URL) \
		--build-arg VITE_CLOUDINARY_CLOUD_NAME=$(VITE_CLOUDINARY_CLOUD_NAME) \
		--build-arg VITE_CLOUDINARY_API_URL=$(VITE_CLOUDINARY_API_URL) \
		--build-arg VITE_BACKEND_BASE_URL=$(VITE_BACKEND_BASE_URL) \
		--build-arg VITE_SUPABASE_AUTH_TOKEN_KEY=$(VITE_SUPABASE_AUTH_TOKEN_KEY) \
		--cache-from type=local,src=/tmp/.buildx-cache \
		--cache-to type=local,dest=/tmp/.buildx-cache \
		--load \
		.
	@echo "$(GREEN)✅ Docker image built successfully$(NC)"
	@docker images $(IMAGE_NAME) | head -2

.PHONY: build-push
build-push: ## Build and push Docker image
	@echo "$(BLUE)🐳 Building and pushing Docker image...$(NC)"
	docker buildx build \
		--platform $(DOCKER_BUILDX_PLATFORM) \
		--tag $(IMAGE_NAME):$(TAG) \
		--tag $(IMAGE_NAME):$(LATEST_TAG) \
		--build-arg VITE_API_BASE_URL=$(VITE_API_BASE_URL) \
		--build-arg VITE_CLOUDINARY_CLOUD_NAME=$(VITE_CLOUDINARY_CLOUD_NAME) \
		--build-arg VITE_CLOUDINARY_API_URL=$(VITE_CLOUDINARY_API_URL) \
		--build-arg VITE_BACKEND_BASE_URL=$(VITE_BACKEND_BASE_URL) \
		--build-arg VITE_SUPABASE_AUTH_TOKEN_KEY=$(VITE_SUPABASE_AUTH_TOKEN_KEY) \
		--cache-from type=local,src=/tmp/.buildx-cache \
		--cache-to type=local,dest=/tmp/.buildx-cache \
		--push \
		.
	@echo "$(GREEN)✅ Docker image pushed successfully$(NC)"

# ============================================================================
# Deployment
# ============================================================================

.PHONY: deploy-compose
deploy-compose: ## Deploy using Docker Compose
	@echo "$(BLUE)🚀 Deploying with Docker Compose...$(NC)"
	docker-compose up -d --force-recreate
	@$(MAKE) health-check

.PHONY: deploy-staging
deploy-staging: ## Deploy to staging environment
	@$(MAKE) build ENV=staging
	@$(MAKE) deploy-compose ENV=staging
	@echo "$(GREEN)✅ Staging deployment completed$(NC)"

.PHONY: deploy-production
deploy-production: ## Deploy to production environment (requires confirmation)
	@echo "$(RED)⚠️ WARNING: Production deployment$(NC)"
	@echo "This will deploy to PRODUCTION environment"
	@read -p "Are you sure? (y/N): " confirm && [ "$$confirm" = "y" ]
	@$(MAKE) build ENV=production
	@$(MAKE) deploy-compose ENV=production
	@echo "$(GREEN)✅ Production deployment completed$(NC)"

# ============================================================================
# Testing & Health Checks
# ============================================================================

.PHONY: health-check
health-check: ## Run health check
	@echo "$(BLUE)🏥 Running health check...$(NC)"
	@sleep 5
	@curl -f http://localhost:3000/health > /dev/null 2>&1 && \
		echo "$(GREEN)✅ Health check passed$(NC)" || \
		echo "$(RED)❌ Health check failed$(NC)"

.PHONY: smoke-test
smoke-test: ## Run smoke tests
	@echo "$(BLUE)🧪 Running smoke tests...$(NC)"
	@curl -f http://localhost:3000/ > /dev/null 2>&1 && \
		echo "$(GREEN)✅ Smoke test passed$(NC)" || \
		echo "$(RED)❌ Smoke test failed$(NC)"

.PHONY: load-test
load-test: ## Run basic load test (requires hey)
	@echo "$(BLUE)📊 Running load test...$(NC)"
	@if command -v hey > /dev/null; then \
		hey -n 100 -c 10 http://localhost:3000/; \
	else \
		echo "$(YELLOW)⚠️ 'hey' not installed. Install with: go install github.com/rakyll/hey@latest$(NC)"; \
	fi

# ============================================================================
# Maintenance
# ============================================================================

.PHONY: clean
clean: ## Clean up build artifacts and containers
	@echo "$(BLUE)🧹 Cleaning up...$(NC)"
	rm -rf dist/
	rm -rf node_modules/.cache/
	docker system prune -f
	@echo "$(GREEN)✅ Cleanup completed$(NC)"

.PHONY: clean-all
clean-all: clean ## Clean everything including node_modules
	@echo "$(BLUE)🧹 Deep cleaning...$(NC)"
	rm -rf node_modules/
	docker system prune -a -f
	@echo "$(GREEN)✅ Deep cleanup completed$(NC)"

.PHONY: logs
logs: ## Show container logs
	@echo "$(BLUE)📋 Showing container logs...$(NC)"
	docker-compose logs -f --tail=100

.PHONY: shell
shell: ## Open shell in running container
	@echo "$(BLUE)🐚 Opening shell in container...$(NC)"
	docker-compose exec frontend-dev sh || docker run -it --rm $(IMAGE_NAME):$(LATEST_TAG) sh

# ============================================================================
# Security
# ============================================================================

.PHONY: security-scan
security-scan: ## Run security scan on Docker image
	@echo "$(BLUE)🛡️ Running security scan...$(NC)"
	@if command -v trivy > /dev/null; then \
		trivy image $(IMAGE_NAME):$(LATEST_TAG); \
	else \
		echo "$(YELLOW)⚠️ Trivy not installed. Install from: https://aquasecurity.github.io/trivy/$(NC)"; \
	fi

.PHONY: check-secrets
check-secrets: ## Check for hardcoded secrets
	@echo "$(BLUE)🔍 Checking for hardcoded secrets...$(NC)"
	@if grep -r -E "(password|secret|key|token)\s*=\s*['\"][^'\"]{10,}" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null; then \
		echo "$(RED)❌ Potential hardcoded secrets found!$(NC)"; \
		exit 1; \
	else \
		echo "$(GREEN)✅ No hardcoded secrets detected$(NC)"; \
	fi

# ============================================================================
# Docker Management
# ============================================================================

.PHONY: docker-setup
docker-setup: ## Setup Docker buildx
	@echo "$(BLUE)🐳 Setting up Docker buildx...$(NC)"
	docker buildx create --name multiarch --driver docker-container --use || true
	docker buildx inspect --bootstrap
	@echo "$(GREEN)✅ Docker buildx setup completed$(NC)"

.PHONY: docker-login
docker-login: ## Login to container registry
	@echo "$(BLUE)🔐 Logging into container registry...$(NC)"
	@if [ -n "$(GITHUB_TOKEN)" ]; then \
		echo "$(GITHUB_TOKEN)" | docker login $(REGISTRY) -u $(GITHUB_ACTOR) --password-stdin; \
	else \
		echo "$(YELLOW)⚠️ GITHUB_TOKEN not set$(NC)"; \
	fi

.PHONY: docker-info
docker-info: ## Show Docker info
	@echo "$(BLUE)📊 Docker Information$(NC)"
	@echo "Registry: $(REGISTRY)"
	@echo "Image Name: $(IMAGE_NAME)"
	@echo "Current Tag: $(TAG)"
	@echo "Latest Tag: $(LATEST_TAG)"
	@echo "Platform: $(DOCKER_BUILDX_PLATFORM)"

# ============================================================================
# Release Management
# ============================================================================

.PHONY: release-patch
release-patch: ## Create patch release
	@$(MAKE) _release TYPE=patch

.PHONY: release-minor
release-minor: ## Create minor release
	@$(MAKE) _release TYPE=minor

.PHONY: release-major
release-major: ## Create major release
	@$(MAKE) _release TYPE=major

.PHONY: _release
_release:
	@echo "$(BLUE)📦 Creating $(TYPE) release...$(NC)"
	@if command -v semantic-release > /dev/null; then \
		semantic-release --$(TYPE); \
	else \
		echo "$(YELLOW)⚠️ semantic-release not installed$(NC)"; \
		echo "Manual release process:"; \
		echo "1. Update version in package.json"; \
		echo "2. Create git tag"; \
		echo "3. Push to main branch"; \
	fi

# ============================================================================
# Environment Info
# ============================================================================

.PHONY: info
info: ## Show environment information
	@echo "$(BLUE)📊 Environment Information$(NC)"
	@echo "=================================="
	@echo "Environment: $(ENV)"
	@echo "Version: $(VERSION)"
	@echo "Node Version: $(NODE_VERSION)"
	@echo "App Name: $(APP_NAME)"
	@echo "Environment File: $(ENV_FILE)"
	@echo ""
	@echo "$(BLUE)📊 Build Information$(NC)"
	@echo "=================================="
	@echo "Image Name: $(IMAGE_NAME)"
	@echo "Tag: $(TAG)"
	@echo "Latest Tag: $(LATEST_TAG)"
	@echo "Platform: $(DOCKER_BUILDX_PLATFORM)"
	@echo ""
	@echo "$(BLUE)📊 Git Information$(NC)"
	@echo "=================================="
	@echo "Branch: $$(git branch --show-current 2>/dev/null || echo 'unknown')"
	@echo "Commit: $$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
	@echo "Status: $$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ') files changed"

# ============================================================================
# CI/CD Helpers
# ============================================================================

.PHONY: ci-setup
ci-setup: docker-setup docker-login ## Setup CI environment

.PHONY: ci-build
ci-build: check build ## CI build pipeline

.PHONY: ci-deploy
ci-deploy: build-push ## CI deploy pipeline

# Make sure to use tabs, not spaces for indentation in Makefiles
.PHONY: _check-env
_check-env:
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "$(RED)❌ Environment file $(ENV_FILE) not found$(NC)"; \
		exit 1; \
	fi