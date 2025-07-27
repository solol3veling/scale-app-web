# Scale App Frontend

A modern React application built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
make install

# Start development server
make dev

# Or with Docker
make dev-docker
```

## 🛠️ Development

### Local Development
```bash
make dev          # Start dev server
make lint         # Run linter
make build-local  # Build locally
make check        # Run all checks
```

### Docker Development
```bash
make dev-docker      # Start with Docker
make stop            # Stop containers
make logs            # View logs
make shell           # Open container shell
```

## 🐳 Docker & Deployment

### Production Build
```bash
make build           # Build Docker image
make run            # Run with Docker Compose
make run-detached   # Run in background
```

### Environment Variables
Create `.env.local` with:
```
VITE_API_BASE_URL=http://localhost:8000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_URL=https://api.cloudinary.com/v1_1
VITE_BACKEND_BASE_URL=http://localhost:8000
VITE_SUPABASE_AUTH_TOKEN_KEY=your_token_key
```

## 📁 Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── hooks/         # Custom hooks
│   ├── types/         # TypeScript types
│   └── constants/     # App constants
├── nginx/             # Nginx configuration
├── .github/           # GitHub workflows
└── docker-compose.yml # Docker setup
```

## 🔧 Available Commands

Run `make help` to see all available commands:

- **Development**: `dev`, `dev-docker`, `install`
- **Quality**: `lint`, `build-local`, `check`
- **Docker**: `build`, `run`, `run-detached`
- **Maintenance**: `clean`, `logs`, `shell`, `stop`

## 🚀 Deployment

The app automatically deploys to staging when you push to the `staging` branch.

```bash
git checkout staging
git merge your-feature-branch
git push origin staging
```

## 🏗️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **State**: React Query, React Hook Form
- **Backend**: Supabase
- **Deployment**: Docker, Nginx, GitHub Actions