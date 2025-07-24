# 🚀 DevOps Pipeline Documentation

## 📋 Overview

This document outlines the complete DevOps pipeline for the Scale App Frontend project, including CI/CD workflows, deployment strategies, monitoring, and best practices.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ Local Dev       │───▶│ Auto Deploy     │───▶│ Manual Deploy   │
│ Feature Branch  │    │ staging branch  │    │ main branch     │
│ Docker Dev      │    │ Docker + Nginx  │    │ Docker + Nginx  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 CI/CD Pipeline

### Branch Strategy

- **`main`** - Production branch (protected)
- **`staging`** - Staging branch (auto-deploy)
- **`feature/*`** - Feature branches (PR to staging)
- **`hotfix/*`** - Hotfix branches (PR to main)

### Pipeline Stages

#### 1. 🔍 Quality Checks
- **ESLint** - Code linting and style enforcement
- **Tests** - Unit and integration tests
- **Security Audit** - NPM audit for vulnerabilities
- **Build Analysis** - Bundle size and optimization

#### 2. 🐳 Docker Build
- **Multi-stage builds** - Optimized production images
- **Layer caching** - GitHub Actions cache integration
- **Multi-platform** - AMD64 and ARM64 support
- **Image signing** - Attestation and provenance

#### 3. 🛡️ Security Scanning
- **Trivy** - Container vulnerability scanning
- **SARIF upload** - GitHub Security tab integration
- **Critical blocking** - Fail on critical vulnerabilities

#### 4. 🚀 Deployment
- **Staging** - Automatic on staging branch
- **Production** - Manual approval required
- **Rollback** - Automated rollback capability

## 📦 Container Strategy

### Production Dockerfile Features
- **Multi-stage build** - Separate build and runtime
- **Alpine Linux** - Minimal attack surface
- **Non-root user** - Security hardening
- **Health checks** - Container health monitoring
- **Nginx optimization** - Production-ready web server

### Image Tagging Strategy
```
ghcr.io/yourorg/frontend:
├── latest                    # Latest production build
├── v2024.01.15-a1b2c3d4     # Versioned production build
├── staging-latest           # Latest staging build
├── staging-20240115-a1b2c3d # Dated staging build
└── main                     # Main branch build
```

## 🌍 Environment Configuration

### Environment Variables

| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | `https://staging-api.yourapp.com` | `https://api.yourapp.com` |
| `VITE_BACKEND_BASE_URL` | `http://localhost:8000` | `https://staging-api.yourapp.com` | `https://api.yourapp.com` |
| `VITE_CLOUDINARY_API_URL` | `https://api.cloudinary.com/v1_1` | `https://api.cloudinary.com/v1_1` | `https://api.cloudinary.com/v1_1` |

### GitHub Secrets Required

```bash
# Repository Secrets
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_SUPABASE_AUTH_TOKEN_KEY=sb-your-project-auth-token

# Environment Secrets (if different per environment)
# Add these in GitHub Settings > Environments
```

## 🔧 Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Git

### Quick Start
```bash
# Clone repository
git clone <repository-url>
cd scale-app-frontend

# Copy environment file
cp .env.local.example .env.local

# Show available commands
make help

# Development with Docker
make dev-docker

# Or local development
make install
make dev
```

### Development Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally: `make dev`
3. Run quality checks: `make check`
4. Build and test: `make build-local`
5. Commit changes: `git commit -m "feat: your feature"`
6. Push and create PR to `staging`

## 🛠️ Makefile Commands

The project uses a comprehensive Makefile for all development and deployment tasks:

### Development Commands
```bash
make help                    # Show all available commands
make install                 # Install dependencies
make dev                     # Start development server
make dev-docker             # Start development with Docker
make dev-docker-detached    # Start development with Docker (background)
make stop-dev               # Stop development containers
```

### Quality Assurance
```bash
make lint                   # Run ESLint
make lint-fix              # Run ESLint with auto-fix
make test                  # Run tests
make test-coverage         # Run tests with coverage
make audit                 # Run security audit
make check                 # Run all quality checks
make check-secrets         # Check for hardcoded secrets
```

### Build Commands
```bash
make build-local           # Build application locally
make build-analyze         # Build and analyze bundle size
make build ENV=staging     # Build Docker image for staging
make build ENV=production  # Build Docker image for production
make build-push           # Build and push to registry
```

### Deployment
```bash
make deploy-staging        # Deploy to staging
make deploy-production     # Deploy to production (with confirmation)
make deploy-compose        # Deploy using Docker Compose
```

### Testing & Health
```bash
make health-check          # Run health check
make smoke-test           # Run smoke tests
make load-test            # Run basic load test
make security-scan        # Run security scan on image
```

### Maintenance
```bash
make clean                # Clean build artifacts
make clean-all            # Deep clean including node_modules
make logs                 # Show container logs
make shell                # Open shell in container
make info                 # Show environment information
```

### Docker Management
```bash
make docker-setup         # Setup Docker buildx
make docker-login         # Login to container registry
make docker-info          # Show Docker configuration
```

### CI/CD Helpers
```bash
make ci-setup             # Setup CI environment
make ci-build             # CI build pipeline
make ci-deploy            # CI deploy pipeline
```

## 🎯 Deployment Strategies

### Staging Deployment
- **Trigger**: Push to `staging` branch
- **Automatic**: No manual approval needed
- **Purpose**: Integration testing and QA
- **URL**: `https://staging.yourapp.com`

### Production Deployment
- **Trigger**: Push to `main` branch or Release creation
- **Manual Approval**: Required through GitHub Environments
- **Blue-Green**: Recommended for zero-downtime
- **URL**: `https://yourapp.com`

### Rollback Strategy
```bash
# Kubernetes rollback
kubectl rollout undo deployment/frontend

# Docker Compose rollback
docker-compose down
docker-compose up -d --build previous-image

# Manual rollback through GitHub Actions
# Trigger rollback workflow with previous version
```

## 📊 Monitoring & Observability

### Health Checks
- **Application**: `/health` endpoint
- **Container**: Docker health check
- **Load Balancer**: Nginx health monitoring

### Metrics Collection
```nginx
# Nginx metrics
location /metrics {
    stub_status on;
    access_log off;
    allow 10.0.0.0/8;
    deny all;
}
```

### Logging Strategy
- **Application Logs**: Structured JSON logging
- **Access Logs**: Nginx access logs
- **Error Logs**: Centralized error reporting
- **Security Logs**: Security event logging

### Alerting
- **Uptime Monitoring**: Application availability
- **Performance**: Response time and error rates
- **Security**: Vulnerability and breach detection
- **Resource Usage**: CPU, memory, and disk usage

## 🔒 Security Best Practices

### Container Security
- **Non-root user**: Run as unprivileged user
- **Minimal base image**: Alpine Linux
- **Vulnerability scanning**: Trivy integration
- **Image signing**: Cosign attestation

### Nginx Security
- **Security headers**: CSP, HSTS, XSS protection
- **Rate limiting**: API and login endpoints
- **Access control**: IP whitelisting where needed
- **SSL/TLS**: Strong cipher suites

### CI/CD Security
- **Secrets management**: GitHub secrets
- **Permission model**: Least privilege access
- **Audit logging**: All pipeline activities
- **Branch protection**: Required status checks

## 📈 Performance Optimization

### Build Optimization
- **Tree shaking**: Remove unused code
- **Code splitting**: Dynamic imports
- **Asset optimization**: Image and font optimization
- **Bundle analysis**: Regular size monitoring

### Runtime Optimization
- **Nginx caching**: Static asset caching
- **Compression**: Gzip and Brotli
- **CDN integration**: Asset delivery optimization
- **HTTP/2**: Modern protocol support

## 🚨 Troubleshooting Guide

### Common Issues

#### Build Failures
```bash
# Check build logs with detailed output
make build ENV=staging

# Verify environment variables
make info

# Clean cache and rebuild
make clean-all
make build ENV=staging
```

#### Deployment Issues
```bash
# Check container logs
make logs

# Verify health checks
make health-check

# Run smoke tests
make smoke-test

# Check environment info
make info
```

#### Pipeline Failures
- Check GitHub Actions logs
- Verify secrets are set correctly
- Ensure branch protection rules
- Review security scan results

### Emergency Procedures

#### Production Outage
1. **Immediate**: Rollback to previous version
2. **Investigate**: Check logs and metrics
3. **Communicate**: Update status page
4. **Fix**: Address root cause
5. **Post-mortem**: Document and improve

#### Security Incident
1. **Isolate**: Stop affected services
2. **Assess**: Determine impact scope
3. **Patch**: Apply security fixes
4. **Monitor**: Watch for additional issues
5. **Report**: Notify stakeholders

## 📚 Additional Resources

### Documentation
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)

### Tools & Services
- **Container Registry**: GitHub Container Registry (GHCR)
- **CI/CD**: GitHub Actions
- **Security Scanning**: Trivy
- **Monitoring**: Prometheus + Grafana (recommended)

### Support Contacts
- **DevOps Team**: devops@yourcompany.com
- **Security Team**: security@yourcompany.com
- **On-call**: +1-XXX-XXX-XXXX

---

## 🔄 Pipeline Status

| Environment | Status | Last Deploy | Version |
|-------------|--------|-------------|---------|
| Production  | [![Production](https://github.com/yourorg/repo/actions/workflows/production.yml/badge.svg)](https://github.com/yourorg/repo/actions/workflows/production.yml) | 2024-01-15 | v2024.01.15 |
| Staging     | [![Staging](https://github.com/yourorg/repo/actions/workflows/staging.yml/badge.svg)](https://github.com/yourorg/repo/actions/workflows/staging.yml) | 2024-01-15 | staging-latest |

---

**Last Updated**: 2024-01-15  
**Maintained By**: DevOps Team  
**Version**: 1.0
