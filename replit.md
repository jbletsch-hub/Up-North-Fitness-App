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
- **UI/UX:** Uses custom golden dumbbell app icon, supports PWA (Progressive Web App) with `manifest.json`.
- **Public Profiles:** User stats pages are publicly viewable, accessible via a dedicated route (`/stats/:userId`) and linked from leaderboards and a "Browse Users" section.
- **MVL Race Logic:** MVL calculation focuses solely on XP from daily activities to emphasize consistent daily effort.

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