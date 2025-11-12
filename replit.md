# Iron Crew - Fitness Tracking & Gamification Platform

## Overview
Iron Crew is a full-stack fitness tracking application that integrates workout logging with gamification. It allows users to track personal records (PRs), complete daily challenges, upload progress photos, and earn experience points (XP). The platform features a leveling system, streak tracking, collaborative crew goals, leaderboards, goal tracking, and a daily MVL (Most Valuable Lifter) badge system. Key capabilities include yearly goals, calorie tracking, dedicated PR leaderboards, and competitive daily XP tracking. The application aims to provide a comprehensive and engaging fitness journey.

## Recent Updates
- **XP System Overhaul:** Changed XP multiplier from 1.6 to 1.125 for gentler progression curve. Total XP to reach level 50 is now ~200,000 XP (down from several million). Provides achievable progression over ~2.5 years of active use.
- **Avatar Redesign:** Completely rebuilt avatar with cleaner cartoon style matching classic muscle progression image. Smoother shapes, clearer visual progression from skinny to jacked across 10 stages.
- **Title Update:** Changed "Rookie 3" to "Noobie" in title progression system.
- **Default Colors:** Updated to orange-red tank (#FF5722) and teal shorts (#20B2AA) to match reference design.
- **App Icon & PWA:** Custom golden dumbbell icon for browser tabs and mobile shortcuts, with web app manifest (manifest.json) for proper Progressive Web App support across iOS, Android, and desktop platforms.
- **Weekly Goals Limit:** Increased from 1 to 3 weekly goals per week, still resetting every Sunday at midnight Central Time.
- **Challenge Randomization:** Implemented Fisher-Yates shuffle algorithm for truly random daily challenge selection, eliminating biased patterns.
- **Arm Anatomy Redesign (Nov 12, 2025):** Arms completely rebuilt with distinct upper arm and forearm sections for realistic muscle progression. Upper arm is wider (armWidth + 2), narrower elbow transition (0.75x), and slimmer forearm (0.85x). Arms rotate at shoulder joint (shoulderY: 88) and angle naturally into tank top. Width progression: 4→21 across 10 stages. Progressive muscle definition with veins appearing from Stage 4+ (forearms). Bicep bulges removed for cleaner look.
- **Enhanced Muscle Definition (Nov 12, 2025):** Chest now features full perimeter outlines defining the entire pec muscle shape (Stage 3+), in addition to center separation and inner curved lines. Abs enhanced with vertical center line separating left and right abs (Stage 3+) plus progressively appearing horizontal lines (top abs Stage 3+, middle abs Stage 4+, lower abs Stage 5+) for clear six-pack definition.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework & Tooling:** React 18 with TypeScript, Vite, Wouter for routing, TanStack Query for data fetching, Tailwind CSS for styling.
- **UI Component Strategy:** Radix UI primitives, shadcn/ui components ("New York" style), custom theme with light/dark modes. Typography uses Inter and Bebas Neue.
- **State Management:** TanStack Query for server state, custom `useAuth` hook for authentication, React hooks for local state, localStorage for theme persistence.
- **Key Design Patterns:** Component composition, custom hooks, Portal-based UI, Dialog-based forms, centralized API request handling, XP utilities.
- **Mobile Responsiveness:** Mobile-first navigation with a hamburger menu for screens < 768px. All page headers and content scale responsively, with reduced padding and vertical stacking on mobile for improved UX.

### Backend Architecture
- **Framework & Server:** Express.js with TypeScript.
- **Authentication:** Session-based using `express-session` and `passport-local`, with `connect-pg-simple` for PostgreSQL session storage.
- **Database Layer:** Drizzle ORM, Neon serverless PostgreSQL, schema-driven design, `drizzle-kit` for migrations.
- **API Design:** RESTful endpoints under `/api`, authentication middleware for protected routes.
- **XP & Gamification System:**
    - Level calculation with gentle exponential XP curve (1.125 multiplier, ~200k XP for level 50) and a 11-tier title progression: Rookie 1 (Lv 1-5), Rookie 2 (Lv 6-10), Noobie (Lv 11-15), Amateur (Lv 16-20), Veteran (Lv 21-25), Meathead (Lv 26-30), Beast (Lv 31-35), Hulk (Lv 36-40), Olympian (Lv 41-45), Titan (Lv 46-49), Immortal (Lv 50).
    - XP awards for various actions with daily limits: Check-in (30 XP), Weigh-in (15 XP), PR update (30 XP), Progress photo (25 XP), Calorie log (15 XP), Daily challenge (25 XP each, 3 per day), All 3 challenges bonus (50 XP).
    - Goal completion rewards: Weekly goal (100 XP), Yearly goal (2,000 XP), Lifetime goal (5,000 XP).
    - Features include an animated XP popup, an activity feed, random daily challenges with a reroll option, and dual leaderboards (XP and PR rankings).
    - Daily MVL (Most Valuable Lifter) competition tracks and rewards the highest daily XP earner, with an associated leaderboard and badge.
    - Challenge selection uses Fisher-Yates shuffle algorithm for truly random distribution without patterns or bias.
    - Admin recalculation endpoint (/api/admin/recalculate-levels) allows recalculating all user levels after XP system changes.
- **Timezone Management:** All time-based operations (check-ins, weigh-ins, daily challenges, goal resets, streaks) are now anchored to Central Time (America/Chicago).
- **Goal Management:** Supports weekly, yearly, and lifetime goals with specific reset logic and enforcement (e.g., one yearly goal per year, up to 3 weekly goals per week).
- **Admin Controls:** Functionality for adding/removing XP, recalculating user levels, and editing user display names.

### Database Schema
- **Core Tables:** `users`, `prs`, `activities`, `challengePool`, `userDailyChallenges`, `progressPhotos`, `crewState`, `userGoals`, `sessions`.
- **Key Fields:** Includes `lastCalorieLogDate` for daily calorie tracking, `userGoals.type` (weekly, yearly, lifetime), `userGoals.yearStart`, `userGoals.weekStart`, `users.mvlWins`, `users.dailyXp`, `users.lastDailyXpReset`, and `users.lastRerollDate`.
- **Relationships:** One-to-one (User → PR), One-to-many (User → Activities, Photos, Challenges, Goals), Singleton (Crew State).
- **Authentication & Authorization:** `passport-local` strategy with `bcrypt` for password hashing, secure HTTP-only session cookies. `isAuthenticated` middleware for route protection. Admin flag for privileged access.

## External Dependencies

### Third-Party Services
- **Replit Platform:** Utilizes Replit-specific Vite plugins and environment variables.
- **Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`).
- **Object Storage:** Replit Object Storage for persistent photo uploads.

### Key NPM Packages
- **UI & Styling:** `@radix-ui/*`, `tailwindcss`, `lucide-react`, `cmdk`, `@uppy/react` (for photo upload UI).
- **Data & State:** `@tanstack/react-query`, `drizzle-orm`, `drizzle-kit`, `zod`.
- **Backend:** `express`, `passport`, `passport-local`, `bcrypt`, `multer`, `connect-pg-simple`.
- **Build & Development:** `vite`, `@vitejs/plugin-react`, `typescript`, `tsx`, `esbuild`.

### Environment Variables Required
- `DATABASE_URL`
- `SESSION_SECRET`
- `REPL_ID` (optional)
- `NODE_ENV`