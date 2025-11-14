# Iron Crew - Fitness Tracking & Gamification Platform

## Overview
Iron Crew is a full-stack fitness tracking and gamification platform. Its core purpose is to engage users in their fitness journey through workout logging, personal record tracking, daily challenges, and progress photo uploads. The platform incorporates a gamified experience with an XP leveling system, streak tracking, collaborative crew goals, leaderboards (XP and PR), and a unique daily "Most Valuable Lifter" (MVL) badge system. Key features include yearly goals, calorie tracking, and a dynamic avatar system that visually progresses with user achievements. The vision is to provide a comprehensive and motivating environment for fitness enthusiasts.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18, TypeScript, and Vite, utilizing Wouter for routing and TanStack Query for data fetching. Styling is handled by Tailwind CSS, complemented by Radix UI primitives and shadcn/ui components for a consistent "New York" design aesthetic with light/dark modes. The typography uses Inter and Bebas Neue. State management leverages TanStack Query for server state, a custom `useAuth` hook for authentication, and React hooks for local component state. The application is designed to be mobile-responsive, featuring a mobile-first navigation with a hamburger menu for smaller screens.

### Backend Architecture
The backend is an Express.js application written in TypeScript. Authentication is session-based, using `express-session` with `passport-local` and PostgreSQL for session storage. Data persistence is managed via Drizzle ORM with Neon serverless PostgreSQL, following a schema-driven design and `drizzle-kit` for migrations. The API is RESTful, with protected routes enforced by authentication middleware.

The gamification system features an XP curve (1.125 multiplier, ~200k XP for level 50) and an 11-tier title progression. XP is awarded for various daily activities (check-ins, weigh-ins, PRs, photos, calorie logs, daily challenges) and goal completions (weekly, yearly, lifetime). A daily MVL competition tracks the highest XP earner from daily activities. Daily challenges are randomized using the Fisher-Yates shuffle algorithm. All time-based operations are anchored to Central Time (America/Chicago). Admin functionalities include XP management and user level recalculation.

### System Design Choices
- **Avatar System:** Features a 10-stage visual progression with dynamic facial expressions and muscle definition, evolving from "skinny" to "jacked." Users can select from four distinct character types (Classic, Bulky, Athletic, Powerlifter) which modify body proportions.
- **Avatar Progress Ring:** Dashboard displays user avatar with circular SVG progress ring showing XP progress to next level (November 13, 2025).
- **UI/UX:** Uses custom golden dumbbell app icon, supports PWA (Progressive Web App) with `manifest.json` (v1.0.1 with cache-busting for iOS updates).
- **Public Profiles:** User stats pages are publicly viewable, accessible via a dedicated route (`/stats/:userId`) and linked from leaderboards and a "Browse Users" section.
- **MVL Race Logic:** MVL calculation focuses solely on XP from daily activities to emphasize consistent daily effort. Goal completions don't count toward MVL standings.
- **PR XP Awards:** Users only receive 10 XP for PR updates if at least one lift (squat, bench, deadlift) actually increases. Same/lower numbers award no XP.
- **PR History Tracking:** Separate `prHistory` database table tracks all PR updates for historical progression analysis. PR progression chart on Stats page displays squat/bench/deadlift/total improvements over time using recharts LineChart (November 13, 2025).
- **Goal Completion Animations:** Goal completions trigger celebratory popup with particle effects, scaling animations, and auto-dismiss, following XP popup pattern (November 13, 2025).
- **Activity Feed Enhancements:** Filter buttons (All, PRs, Photos, Challenges), user avatars via AvatarDisplay component with full customization (shirt, shorts, hair, accessories), proper Lucide icons instead of emojis (November 13, 2025).
- **Dashboard Widgets:** Today's XP tracker with reset countdown, MVL standings with live countdown to midnight CT and user position, Active Challenges showing completion progress (November 13, 2025).
- **Mobile Input Fix:** Uses `type="text"` with `inputMode="numeric"` for number inputs to fix iOS Safari typing bug.
- **Photo Upload System:** Progress photos include `uploadDate` field (YYYY-MM-DD in Central Time) for reliable daily limit enforcement. 1-photo-per-day limit resets exactly at midnight CT. Enhanced error handling shows clear messages for upload failures and daily limit violations (November 13, 2025).
- **Edit Weight Feature:** Users can correct weight entry mistakes after initial daily weigh-in without earning XP. POST /api/weighin awards 15 XP for first daily weigh-in only if weight changes from previous weight, PATCH /api/weighin allows editing weight with no XP awarded. WeighInCard shows "Weigh In" button before daily weigh-in and "Edit Weight" button after (disabled when unchanged, "Weight Saved" label). Prevents accidental duplicate XP from typo corrections. Weight must differ from yesterday to earn XP (November 14, 2025).
- **Variable Challenge XP:** Daily challenges now have configurable XP values (15, 20, or 25 XP) to reduce MVL race ties and add strategic variety. Each challenge stores its xpValue in the database (default 20). Admin panel includes XP selector dropdown when creating challenges and edit button (pencil icon) for modifying existing challenges. Edit dialog allows admins to change XP values for challenges already in the pool. Challenge cards and activity feed display the specific XP amount (+15 XP, +20 XP, or +25 XP). Challenge completion awards the custom xpValue instead of fixed amount. Backend endpoint PATCH /api/admin/challenges/:id handles XP value updates (November 14, 2025).
- **Admin Promotion System:** Admins can grant or revoke admin privileges to other users. Admin panel User Management section includes Zap icon toggle buttons for each user (colored when user is admin, muted when not). Users with admin status display an "Admin" badge next to their username. Confirmation dialog appears before toggling admin status. Backend endpoint POST /api/admin/users/:id/toggle-admin handles privilege changes (November 14, 2025).

## External Dependencies

### Third-Party Services
- **Neon Serverless PostgreSQL:** Database service.
- **Replit Object Storage:** For storing user-uploaded progress photos.

### Key NPM Packages
- **Frontend:** `@radix-ui/*`, `tailwindcss`, `lucide-react`, `cmdk`, `@uppy/react`, `@tanstack/react-query`.
- **Backend:** `express`, `passport`, `passport-local`, `bcrypt`, `drizzle-orm`, `drizzle-kit`, `zod`, `multer`, `connect-pg-simple`.
- **Development:** `vite`, `typescript`, `tsx`.

### Environment Variables
- `DATABASE_URL`
- `SESSION_SECRET`
- `REPL_ID` (optional, Replit-specific)
- `NODE_ENV`