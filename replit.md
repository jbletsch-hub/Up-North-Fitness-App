# Iron Crew - Fitness Tracking & Gamification Platform

## Overview
Iron Crew is a fullstack fitness tracking application that integrates workout logging with gamification. It enables users to track personal records (PRs), complete daily challenges, upload progress photos, and earn experience points (XP). The platform features a leveling system, streak tracking, collaborative crew goals, and leaderboards, drawing inspiration from fitness and gamification apps.

The application is built as a modern web app using React for the frontend, Express for the backend, and PostgreSQL (via Neon) for data persistence. It includes a complete XP system with level progression, daily challenges, PR tracking, check-ins, weigh-ins, photo uploads, and user profiles. New users are guided through a profile setup flow.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes

### October 23, 2025 - XP Calculations, Challenge Pool & Reroll Feature
- ✅ **Fixed XP threshold calculation bug** in `client/src/lib/xpUtils.ts`
- ✅ Frontend now correctly calculates cumulative XP requirements matching backend
- ✅ Level 4 now correctly shows 516 XP requirement (was showing 409 XP)
- ✅ Progress bars and XP goals now display accurate values
- ✅ **Fixed "Add Challenge" bug** - AdminPage was displaying `challenge.description` instead of `challenge.text`
- ✅ **Added 45 fitness challenges** to challenge pool (55 total):
  - Strength & Bodyweight exercises (push-ups, planks, squats, lunges, etc.)
  - Cardio & Movement challenges (walking, stairs, dancing, sprints, etc.)
  - Flexibility & Recovery (stretching, yoga, foam rolling, breathing, etc.)
  - Nutrition & Hydration (water intake, vegetables, meal prep, etc.)
  - Mental Health & Habits (sleep, gratitude, meditation, goal setting, etc.)
- ✅ **Added Daily Challenge Reroll Feature**:
  - Users can reroll their daily challenges once per day
  - Only allowed if no challenges have been completed yet that day
  - Added `lastRerollDate` field to users table
  - Added POST `/api/challenges/reroll` endpoint
  - Reroll button in DailyChallenges component with spinning icon during loading
  - New challenges are randomly selected from the pool of 55 challenges
- ✅ Fixed TypeScript errors in production build (HomePage, Dashboard, photo upload)
- ✅ Added `refetchType: 'all'` to all admin mutations for proper cache invalidation
- ✅ Added automatic page reload after "Recalculate All Levels" to ensure UI updates

### October 22, 2025 - Admin XP Management & Level Recalculation
- ✅ **Added Remove XP feature** for admins to subtract XP from users
- ✅ Added POST `/api/admin/users/:userId/xp/remove` endpoint with automatic level recalculation
- ✅ Updated AdminPage with "Remove XP" button alongside "Add XP"
- ✅ **Added System-wide Level Recalculation** to fix stuck levels
- ✅ Added POST `/api/admin/recalculate-levels` endpoint to fix all user levels based on their XP
- ✅ Created "System Tools" card in AdminPage with "Recalculate All Levels" button
- ✅ All XP changes now properly recalculate user level and title
- ✅ Fixed level calculation bug where users could get stuck at incorrect levels
- ✅ Improved ObjectUploader component using @uppy/react for better photo uploads
- ✅ Added Uppy CSS styling for professional upload modal interface

### October 20, 2025 - Object Storage & Admin Controls
- ✅ **Migrated photo uploads to Replit Object Storage** for persistence in published environments
- ✅ Created `server/objectStorage.ts` and `server/objectAcl.ts` for storage management
- ✅ Added GET `/objects/:objectPath` endpoint to serve photos from object storage
- ✅ Added POST `/api/photos/upload-url` endpoint to get presigned upload URLs
- ✅ Updated photo upload flow: get URL → upload to storage → save record
- ✅ Photos now persist across deployments and work in published version
- ✅ Public visibility for photos (anyone can view user profiles)
- ✅ Admins can now edit leaderboard display names for all users
- ✅ Added POST /api/admin/users/:id/display-name endpoint for admin updates
- ✅ Admin page shows current display names with edit icon buttons
- ✅ Dialog-based display name editor with 50-character validation
- ✅ Added edit functionality for weight and PR entries with visual feedback
- ✅ WeighInCard and PRTracker show current values and dynamic button text
- ✅ Backend enforces daily XP limits to prevent farming
- ✅ Fixed profile navigation issues and enhanced error handling

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