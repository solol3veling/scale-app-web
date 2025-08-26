# Scale-App Frontend

A modern social media management platform built with React, TypeScript, and Vite. Manage and scale your social media presence across all platforms with powerful automation tools.

## 🚀 Features

- **Multi-Platform Management** - Connect and manage Facebook, Instagram, Twitter, LinkedIn, and more
- **Smart Scheduling** - Plan content calendar with AI-optimized posting times
- **Advanced Analytics** - Comprehensive performance tracking and insights
- **Team Collaboration** - Multi-user workspace with role management
- **Content Creation** - Built-in editor with templates and platform previews
- **Automation** - Smart workflows and AI-powered content suggestions

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: React Query (TanStack Query)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Charts**: Recharts
- **Deployment**: Docker + Traefik

## 📦 Quick Start

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/solol3veling/scale-app-web.git
cd scale-app-web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Configure your API endpoints and secrets

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🔧 Environment Variables

```env
VITE_API_BASE_URL=your_api_url
VITE_BACKEND_BASE_URL=your_backend_url
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_CLOUDINARY_API_URL=your_cloudinary_url
```

## 🐳 Docker Deployment

```bash
# Build the Docker image
docker build -t scale-app .

# Run the container
docker run -d -p 5173:5173 --name scale-app scale-app
```

## 📱 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── ...             # Feature-specific components
├── pages/              # Route pages
├── hooks/              # Custom React hooks
├── services/           # API services
├── types/              # TypeScript type definitions
├── lib/                # Utility functions
└── constants/          # App constants

.github/workflows/      # GitHub Actions CI/CD
supabase/              # Database migrations
```

## 🚀 Deployment

The project uses GitHub Actions for automatic deployment:

- **Dev Branch**: Pushes to `dev` trigger deployment to staging
- **Main Branch**: Production deployments
- **Docker**: Containerized with `serve` on port 5173
- **Traefik**: Reverse proxy handling (no nginx needed)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue on GitHub.