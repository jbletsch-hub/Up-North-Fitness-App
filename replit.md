# Iron Crew - Fitness Tracking & Gamification Platform

## Overview

Iron Crew is a fullstack fitness tracking application that combines workout logging with gamification elements. The platform allows users to track personal records (PRs), complete daily challenges, upload progress photos, and earn experience points (XP) while competing with their crew. It features a leveling system with titles, streak tracking, and collaborative crew goals inspired by apps like Strava and Duolingo.

The application is built as a modern web app using React on the frontend and Express on the backend, with PostgreSQL (via Neon) for data persistence and Replit Auth for authentication.

**Current Status:** Fully functional with complete authentication, XP system, daily challenges, PR tracking, check-ins, weigh-ins, and photo uploads. All frontend components are connected to live backend APIs.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 19, 2025)

- ✅ Completed full backend API implementation with all routes
- ✅ Connected all frontend components to real API endpoints
- ✅ Implemented user creation flow via /api/auth/user endpoint
- ✅ Fixed routing to properly handle authenticated and unauthenticated states
- ✅ Added XP popup animations for gamification feedback
- ✅ Integrated toast notifications for user actions
- ✅ Tested authentication flow with Replit Auth (OIDC)

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React 18 with TypeScript for the UI layer
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- TanStack Query (React Query) for server state management and data fetching
- Tailwind CSS for styling with custom design system

**UI Component Strategy:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library following the "New York" style variant
- Custom theme system supporting light/dark modes via ThemeProvider
- Typography: Inter (body text) and Bebas Neue (display/stats)
- Color palette built around energetic gold (#f1c40f) and vibrant purple (#7c3aed)

**State Management:**
- Server state managed through React Query with infinite stale time
- Authentication state accessed via custom `useAuth` hook
- Local component state using React hooks
- Theme state persisted to localStorage

**Key Design Patterns:**
- Component composition with feature-focused components (CheckInCard, PRTracker, etc.)
- Custom hooks for reusable logic (useAuth, useXPPopup, use-toast)
- Portal-based UI for popups (XPPopup component)
- Centralized API request handling through queryClient utility

### Backend Architecture

**Framework & Server:**
- Express.js server with TypeScript
- Session-based authentication using express-session
- PostgreSQL session store (connect-pg-simple)
- Middleware pattern for request logging and error handling

**Database Layer:**
- Drizzle ORM for type-safe database operations
- Neon serverless PostgreSQL with WebSocket support
- Schema-driven design with relations between tables
- Migration system via drizzle-kit

**API Design:**
- RESTful endpoints under `/api` prefix
- Authentication middleware (`isAuthenticated`) protecting routes
- Mutation endpoints for user actions (check-ins, PR updates, challenge completion)
- Data aggregation endpoints for dashboard and home views

**XP & Gamification System:**
- Level calculation based on exponential XP curve (1.6 multiplier)
- Title progression through 10 tiers (Rookie 1 → Immortal at level 50)
- XP awards: +15 for check-ins/photos/challenges, +10 for PR updates
- Activity feed tracking all XP-earning actions
- Daily challenge pool with random assignment

### Database Schema

**Core Tables:**
- `users`: Extended Replit Auth user model with XP, level, title, streaks, weight
- `prs`: Personal records (squat, bench, deadlift) linked to users
- `activities`: Activity feed entries with type, detail, and XP awarded
- `challengePool`: Master list of available daily challenges
- `userDailyChallenges`: Daily challenge assignments with completion status
- `progressPhotos`: Uploaded progress photos with metadata
- `crewState`: Shared crew goal tracking (total lifted vs. goal)
- `sessions`: Session storage for Replit Auth

**Key Relationships:**
- One-to-one: User → PR record
- One-to-many: User → Activities, User → Progress Photos, User → Daily Challenges
- Singleton: Crew State (shared across all users)

**Indexes:**
- Session expiration index for cleanup
- Implied indexes on primary keys and foreign keys

### Authentication & Authorization

**Authentication Provider:**
- Replit Auth via OpenID Connect (OIDC)
- Passport.js strategy for OIDC integration
- Session-based authentication with secure HTTP-only cookies
- 1-week session TTL

**User Flow:**
- Unauthenticated users land on marketing/landing page
- Login redirects to Replit OIDC flow
- Successful auth creates/updates user record and establishes session
- Protected routes check `isAuthenticated` middleware
- 401 responses trigger client-side redirect to login

**Authorization:**
- Admin flag on user model for privileged access
- Admin-only routes for challenge pool management (future feature)

## External Dependencies

### Third-Party Services

**Replit Platform:**
- Replit Auth (OIDC) for authentication
- Replit-specific Vite plugins for development tools (cartographer, dev-banner, runtime-error-modal)
- Environment variables: REPL_ID, REPLIT_DOMAINS, ISSUER_URL, SESSION_SECRET

**Database:**
- Neon Serverless PostgreSQL via `@neondatabase/serverless`
- Connection via DATABASE_URL environment variable
- WebSocket support for serverless connections

### Key NPM Packages

**UI & Styling:**
- @radix-ui/* (20+ component primitives)
- tailwindcss, autoprefixer, postcss
- class-variance-authority, clsx, tailwind-merge
- lucide-react (icons)
- cmdk (command palette)

**Data & State:**
- @tanstack/react-query
- drizzle-orm, drizzle-kit
- zod (schema validation)

**Backend:**
- express, passport, openid-client
- bcrypt (password hashing, if needed for future features)
- multer (file uploads for progress photos)
- memoizee (caching OIDC config)

**Build & Development:**
- vite, @vitejs/plugin-react
- typescript, tsx (dev server)
- esbuild (production backend build)

### File Upload Strategy

**Progress Photos:**
- Multer with memory storage for initial file handling
- Files written to `static/uploads` directory
- Allowed extensions: png, jpg, jpeg, gif, webp
- File serving via Express static middleware (implied)

### Environment Variables Required

- `DATABASE_URL`: Neon PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `REPL_ID`: Replit environment identifier
- `REPLIT_DOMAINS`: Allowed domains for OIDC
- `ISSUER_URL`: OIDC issuer endpoint (defaults to replit.com/oidc)
- `NODE_ENV`: development/production flag