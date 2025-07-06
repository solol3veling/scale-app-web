# SocialHub Dashboard 🚀

A modern, comprehensive social media management dashboard that allows users to manage multiple social media accounts, create posts, and track analytics from a single interface.

## ✨ Features

- **Multi-Platform Management**: Connect and manage Facebook, Instagram, Twitter/X, LinkedIn, Pinterest, TikTok, and more
- **Unified Post Creation**: Create and schedule posts across multiple platforms simultaneously
- **Account Management**: Add, edit, remove, and organize social media accounts with custom tags
- **Analytics Dashboard**: Track post performance and engagement metrics
- **Modern UI/UX**: Beautiful, responsive design with smooth animations and intuitive navigation
- **Real-time Updates**: Live notifications and status updates

## 🛠️ Technologies & Architecture

### Frontend Framework
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development experience
- **Vite** - Fast build tool and development server

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Shadcn/ui** - High-quality, accessible component library
- **Lucide React** - Beautiful, customizable icons
- **CSS Custom Properties** - Semantic design tokens for consistent theming

### Routing & Navigation
- **React Router DOM** - Client-side routing with nested routes
- **Protected Routes** - Authentication-aware navigation

### State Management
- **React Query (@tanstack/react-query)** - Server state management and caching
- **Custom Hooks** - Encapsulated business logic for data fetching
- **React Context** - Global state for UI preferences

### API & Data Layer
- **Custom API Service** - Centralized HTTP client with error handling
- **TypeScript Interfaces** - Strongly typed data models
- **Mock Data Layer** - Development-ready data simulation

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization
- **Class Variance Authority (CVA)** - Type-safe component variants

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── AppSidebar.tsx  # Navigation sidebar
│   └── DashboardLayout.tsx # Main layout wrapper
├── hooks/              # Custom React hooks
│   ├── useAccounts.ts  # Account management logic
│   └── use-toast.ts    # Toast notifications
├── pages/              # Route components
│   ├── Overview.tsx    # Dashboard home
│   ├── MakePost.tsx    # Post creation
│   ├── Analytics.tsx   # Performance metrics
│   ├── AccountManagement.tsx # Account CRUD
│   └── Settings.tsx    # User preferences
├── services/           # API and external services
│   └── api.ts         # HTTP client and endpoints
├── lib/               # Utility functions
│   └── utils.ts       # Helper functions
└── index.css          # Global styles and design tokens
```

## 🎨 Design System

The project uses a comprehensive design system built with:

- **Semantic Color Tokens**: HSL-based color system for light/dark mode support
- **Custom CSS Properties**: Centralized design tokens in `index.css`
- **Tailwind Configuration**: Extended theme with custom colors and animations
- **Component Variants**: Type-safe styling with class-variance-authority

### Key Design Features
- **Gradient Backgrounds**: Beautiful gradient overlays and buttons
- **Smooth Animations**: CSS transitions and keyframe animations
- **Responsive Design**: Mobile-first approach with breakpoint-specific layouts
- **Accessibility**: WCAG-compliant color contrasts and keyboard navigation

## 🔌 API Integration

The application is structured for easy backend integration:

### Current State (Development)
- Mock data with realistic social media account examples
- Simulated API calls with loading states and error handling
- TypeScript interfaces defining data contracts

### Production Ready
- Centralized API service in `src/services/api.ts`
- Custom hooks abstracting data fetching logic
- Error boundaries and loading states
- Automatic retry and caching with React Query

### Backend Endpoints (To Implement)
```
GET    /api/accounts           # Fetch user's connected accounts
POST   /api/accounts           # Connect new social account
PUT    /api/accounts/:id       # Update account settings
DELETE /api/accounts/:id       # Remove account
POST   /api/posts              # Create new post
GET    /api/posts              # Fetch user's posts
GET    /api/analytics          # Fetch performance data
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd socialhub-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
Create a `.env.local` file for environment variables:
```env
VITE_API_URL=your-backend-api-url
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint checks

## 🔄 State Management Strategy

### Local State
- Component-specific state using `useState`
- Form state management with controlled components

### Server State
- API data cached with React Query
- Automatic background refetching
- Optimistic updates for better UX

### Global State
- UI preferences (theme, sidebar state)
- User authentication context
- Toast notifications

## 🎯 Future Development

### Planned Features
- [ ] Real-time post scheduling
- [ ] Advanced analytics with charts
- [ ] Team collaboration features
- [ ] Content calendar view
- [ ] AI-powered content suggestions
- [ ] Multi-language support

### Technical Improvements
- [ ] Progressive Web App (PWA) capabilities
- [ ] Advanced caching strategies
- [ ] Performance monitoring
- [ ] Automated testing suite
- [ ] CI/CD pipeline setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ using modern web technologies and best practices.