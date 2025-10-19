# Iron Crew - Fitness Tracking & Gamification Platform

## Overview

Iron Crew is a fullstack fitness tracking application that combines workout logging with gamification elements. The platform allows users to track personal records (PRs), complete daily challenges, upload progress photos, and earn experience points (XP) while competing with their crew. It features a leveling system with titles, streak tracking, and collaborative crew goals inspired by apps like Strava and Duolingo.

The application is built as a modern web app using React on the frontend and Express on the backend, with PostgreSQL (via Neon) for data persistence and Replit Auth for authentication.

**Current Status:** Fully functional with username/password authentication, XP system with level progression tracking, daily challenges, PR tracking, check-ins, weigh-ins, photo uploads, leaderboards, and user profiles. All frontend components are connected to live backend APIs with consistent XP popup feedback. New users complete a profile setup flow with name entry and gym-themed profile picture selection.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 19, 2025)

### Latest Updates - Profile Setup Flow for New Users
- ✅ Added profile setup requirement for new users after registration
- ✅ Created ProfileSetup page (/profile-setup) with name inputs and profile picture selector
- ✅ Added 10 gym-themed stock images for profile picture selection
- ✅ Updated users schema to use firstName, lastName, and profileImageUrl fields
- ✅ Implemented POST /api/profile/setup endpoint to save profile data
- ✅ Enhanced ProtectedRoute to redirect incomplete profiles to /profile-setup
- ✅ Added skipProfileCheck prop to allow /profile-setup route access
- ✅ Profile picture selection uses grid layout with ring highlighting for selected option
- ✅ Form validation ensures first name and profile picture are required

### Previous Updates - Daily Limits & XP System
- ✅ Implemented strict daily limits: PRs and weigh-ins can only be updated once per day
- ✅ Backend validation prevents multiple updates with clear error messages
- ✅ Frontend error handling displays helpful toast notifications when daily limit reached
- ✅ Fixed XP popup not displaying by refactoring mutation context handling
- ✅ Added 45 XP bonus for completing all daily challenges (4/4)
- ✅ Added 100 XP reward for completing weekly goals
- ✅ Added 1000 XP reward for completing lifetime goals
- ✅ Enhanced XP popup with Nintendo-style animations:
  - Sparkle particle burst effect (8 animated particles)
  - Bounce entrance with elastic easing and rotation
  - Pulsing golden glow effect around popup
  - Gradient background from primary to chart colors
  - Shine overlay shimmer effect
  - Spinning sparkle icons flanking XP text
  - Text glow with golden shadow
  - Expanding ring pulse on appearance
  - Float away exit animation after 2.5 seconds
- ✅ Refactored all mutations to pass events through context instead of state
- ✅ Added bonus XP toast notification when all challenges completed
- ✅ Goal completion now awards XP and shows popup with animations

## Previous Changes

### Authentication Migration
- ✅ Replaced Replit Auth with username/password authentication using passport-local
- ✅ Added password field to users table in database schema
- ✅ Created server/auth.ts with local authentication strategy and session management
- ✅ Built AuthPage component with login/register forms in two-column layout
- ✅ Implemented new useAuth hook with AuthContext for state management
- ✅ Created ProtectedRoute component for authenticated route protection
- ✅ Updated all API routes to use new auth endpoints (/api/register, /api/login, /api/logout, /api/user)
- ✅ Removed Replit Auth dependencies and cleaned up old auth files
- ✅ Fixed logout to use POST request instead of anchor tag for proper session termination

### Feature Enhancements
- ✅ Fixed progress photo upload to use static/uploads directory (not object storage)
- ✅ Added leaderboard display to Dashboard page showing top users by XP
- ✅ Created ProfilePage component (/profile/:username) with user stats, PRs, photos, and activity feed
- ✅ Added XP-to-next-level progress bar on Dashboard showing level advancement
- ✅ Fixed XP popup to show consistently for all XP-earning actions (check-ins, challenges, PRs, weigh-ins, photos)
- ✅ Enhanced awardXP function to return xpAwarded, leveledUp, and oldLevel fields
- ✅ Created xpUtils library with functions to calculate XP requirements and level progress
- ✅ All mutations now consistently use xpAwarded field from API responses
- ✅ Implemented dynamic XP popup positioning to appear near clicked buttons
- ✅ Updated all component event handlers to pass click events for popup positioning
- ✅ Fixed crew goal updates to invalidate /api/home query when PRs are updated

### User-Defined Goals System
- ✅ Added userGoals table to database schema for personalized goal tracking
- ✅ Created full CRUD API endpoints for goals (/api/goals)
- ✅ Implemented GoalsCard component with dialog-based goal creation
- ✅ Users can create weekly and lifetime goals with custom titles, targets, and units
- ✅ Goals display progress bars showing current vs. target values
- ✅ Users can mark goals as complete and delete goals
- ✅ Completed goals are shown separately with visual distinction
- ✅ Supports multiple unit types: lbs, kg, reps, miles, km, days, times
- ✅ Public profiles display user's daily challenges, weekly goals, and lifetime goals for others to follow along

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
- Component composition with feature-focused components (CheckInCard, PRTracker, LeaderboardCard, GoalsCard, etc.)
- Custom hooks for reusable logic (useAuth, useXPPopup, use-toast)
- Portal-based UI for popups (XPPopup component showing XP rewards)
- Dialog-based forms for creating/editing content (goals creation)
- Centralized API request handling through queryClient utility
- XP utilities (xpUtils.ts) for level calculation and progress tracking

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
- XP awards: +15 for check-ins/photos/challenges/weigh-ins, +10 for PR updates (once per day)
- XP popup displays on every XP-earning action via portal-based component
- Activity feed tracking all XP-earning actions with timestamps
- Daily challenge pool with random assignment (4 challenges per day)
- Leaderboard showing top users ranked by total XP
- Level progress tracking showing XP to next level with visual progress bar

### Database Schema

**Core Tables:**
- `users`: User accounts with username, hashed password, email, XP, level, title, streaks, weight, admin flag
- `prs`: Personal records (squat, bench, deadlift) linked to users
- `activities`: Activity feed entries with type, detail, and XP awarded
- `challengePool`: Master list of available daily challenges
- `userDailyChallenges`: Daily challenge assignments with completion status
- `progressPhotos`: Uploaded progress photos with metadata
- `crewState`: Shared crew goal tracking (total lifted vs. goal)
- `userGoals`: User-defined weekly and lifetime goals with progress tracking
- `sessions`: Session storage for passport authentication

**Key Relationships:**
- One-to-one: User → PR record
- One-to-many: User → Activities, User → Progress Photos, User → Daily Challenges, User → Goals
- Singleton: Crew State (shared across all users)

**Indexes:**
- Session expiration index for cleanup
- Implied indexes on primary keys and foreign keys

### Authentication & Authorization

**Authentication Provider:**
- Username/password authentication via passport-local strategy
- Passwords hashed using bcrypt with salt rounds
- Session-based authentication with secure HTTP-only cookies
- PostgreSQL session store via connect-pg-simple
- 1-week session TTL (7 days)

**User Flow:**
- Unauthenticated users are redirected to /auth page
- Users can register with username, password, and optional email
- Login authenticates against bcrypt-hashed passwords
- Successful auth establishes session and redirects to home page
- Protected routes use ProtectedRoute component that checks authentication
- 401 responses trigger redirect to /auth page

**Authorization:**
- Admin flag on user model for privileged access
- Admin-only routes for user management, challenge pool, and crew goal settings
- isAuthenticated middleware protects all authenticated routes

## External Dependencies

### Third-Party Services

**Replit Platform:**
- Replit-specific Vite plugins for development tools (cartographer, dev-banner, runtime-error-modal)
- Environment variables: REPL_ID, SESSION_SECRET

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
- express, passport, passport-local
- bcrypt (password hashing)
- multer (file uploads for progress photos)
- connect-pg-simple (PostgreSQL session store)

**Build & Development:**
- vite, @vitejs/plugin-react
- typescript, tsx (dev server)
- esbuild (production backend build)

### File Upload Strategy

**Progress Photos:**
- Multer with memory storage for initial file handling
- Files written to `static/uploads` directory
- Stored as `/uploads/{userId}-{timestamp}.{ext}` for unique naming
- Allowed extensions: png, jpg, jpeg, gif, webp
- File serving via Express static middleware
- Photo upload awards +15 XP with popup notification

### Environment Variables Required

- `DATABASE_URL`: Neon PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption
- `REPL_ID`: Replit environment identifier (optional)
- `NODE_ENV`: development/production flag