# Iron Crew - Fitness Tracking & Gamification Platform

## Overview
Iron Crew is a fullstack fitness tracking application that integrates workout logging with gamification. It enables users to track personal records (PRs), complete daily challenges, upload progress photos, and earn experience points (XP). The platform features a leveling system, streak tracking, collaborative crew goals, and leaderboards, drawing inspiration from fitness and gamification apps.

The application is built as a modern web app using React for the frontend, Express for the backend, and PostgreSQL (via Neon) for data persistence. It includes a complete XP system with level progression, daily challenges, PR tracking, check-ins, weigh-ins, photo uploads, and user profiles. New users are guided through a profile setup flow.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (October 20, 2025)

### Admin Display Name Control & Edit Functionality
- ✅ Admins can now edit leaderboard display names for all users
- ✅ Added POST /api/admin/users/:id/display-name endpoint for admin updates
- ✅ Admin page shows current display names with edit icon buttons
- ✅ Dialog-based display name editor with 50-character validation
- ✅ Added edit functionality for weight and PR entries with visual feedback
- ✅ WeighInCard and PRTracker show current values and dynamic button text
- ✅ Backend enforces daily XP limits to prevent farming
- ✅ Fixed profile navigation issues and enhanced error handling
- ✅ Photo upload validation and better error messaging

## System Architecture

### Frontend Architecture
- **Framework & Tooling:** React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for data fetching, Tailwind CSS for styling.
- **UI Component Strategy:** Radix UI primitives, shadcn/ui components ("New York" style), custom theme with light/dark modes.
- **Typography:** Inter (body), Bebas Neue (display/stats).
- **Color Palette:** Energetic gold (#f1c40f) and vibrant purple (#7c3aed).
- **State Management:** TanStack Query for server state, custom `useAuth` hook for authentication, React hooks for local component state, localStorage for theme persistence.
- **Key Design Patterns:** Component composition, custom hooks, Portal-based UI for popups, Dialog-based forms, centralized API request handling, XP utilities.

### Backend Architecture
- **Framework & Server:** Express.js with TypeScript.
- **Authentication:** Session-based using `express-session` and `passport-local`, with `connect-pg-simple` for PostgreSQL session storage.
- **Database Layer:** Drizzle ORM, Neon serverless PostgreSQL, schema-driven design, `drizzle-kit` for migrations.
- **API Design:** RESTful endpoints under `/api`, authentication middleware for protected routes, mutation and aggregation endpoints.
- **XP & Gamification System:**
    - Level calculation with exponential XP curve (1.6 multiplier).
    - 10-tier title progression (Rookie 1 to Immortal).
    - XP awards for various actions (e.g., check-ins, photos, PR updates) with daily limits.
    - Animated XP popup on earning actions.
    - Activity feed for XP-earning actions.
    - Random daily challenges.
    - Leaderboard based on total XP.

### Database Schema
- **Core Tables:** `users`, `prs`, `activities`, `challengePool`, `userDailyChallenges`, `progressPhotos`, `crewState`, `userGoals`, `sessions`.
- **Relationships:** One-to-one (User → PR), One-to-many (User → Activities, Photos, Challenges, Goals), Singleton (Crew State).
- **Authentication & Authorization:** `passport-local` strategy with `bcrypt` for password hashing, secure HTTP-only session cookies (7-day TTL). `isAuthenticated` middleware for route protection. Admin flag for privileged access.

## External Dependencies

### Third-Party Services
- **Replit Platform:** Replit-specific Vite plugins, `REPL_ID` environment variable.
- **Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`) via `DATABASE_URL`.

### Key NPM Packages
- **UI & Styling:** `@radix-ui/*`, `tailwindcss`, `lucide-react`, `cmdk`.
- **Data & State:** `@tanstack/react-query`, `drizzle-orm`, `drizzle-kit`, `zod`.
- **Backend:** `express`, `passport`, `passport-local`, `bcrypt`, `multer`, `connect-pg-simple`.
- **Build & Development:** `vite`, `@vitejs/plugin-react`, `typescript`, `tsx`, `esbuild`.

### File Upload Strategy
- **Progress Photos:** `multer` for handling, files stored in `static/uploads` directory. Supports `png, jpg, jpeg, gif, webp` formats. Express serves static files.

### Environment Variables Required
- `DATABASE_URL`
- `SESSION_SECRET`
- `REPL_ID` (optional)
- `NODE_ENV`