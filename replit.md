# Up North Fitness - Fitness Tracking & Gamification Platform

## Overview
Up North Fitness is a full-stack fitness tracking and gamification platform designed to engage users in their fitness journey. It offers workout logging, personal record tracking, daily challenges, and progress photo uploads. The platform gamifies fitness with an XP leveling system, streak tracking, collaborative crew goals, leaderboards (XP and PR), and a daily "Most Valuable Lifter" (MVL) badge system. Key features include yearly goals, calorie tracking, and a dynamic avatar system that visually progresses with user achievements. The platform aims to provide a comprehensive and motivating environment for fitness enthusiasts.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18, TypeScript, and Vite, using Wouter for routing and TanStack Query for data fetching. Styling is managed by Tailwind CSS, Radix UI primitives, and shadcn/ui components, adhering to a "New York" design aesthetic with light/dark modes. Typography uses Inter and Bebas Neue. State management combines TanStack Query for server state, a custom `useAuth` hook for authentication, and React hooks for local component state. The application is mobile-responsive with a mobile-first navigation.

### Backend Architecture
The backend is an Express.js application written in TypeScript. It uses session-based authentication with `express-session`, `passport-local`, and PostgreSQL for session storage. Data is persisted using Drizzle ORM with Neon serverless PostgreSQL, following a schema-driven design and `drizzle-kit` for migrations. The API is RESTful with protected routes.

The gamification system includes an XP curve (~200k XP for level 50) and an 11-tier title progression. XP is awarded for various daily activities and goal completions. A daily MVL competition tracks the highest XP earner from daily activities. Daily challenges are randomized using the Fisher-Yates shuffle. All time-based operations are anchored to Central Time (America/Chicago). Admin functionalities include XP management and user level recalculation.

### System Design Choices
- **Avatar System:** Features a 10-stage visual progression with dynamic facial expressions and muscle definition, evolving from "skinny" to "jacked." Users can select from four character types.
- **UI/UX:** Custom golden dumbbell app icon, PWA support, public profiles for user stats.
- **MVL Race Logic:** MVL calculation focuses on XP from daily activities to emphasize consistent daily effort.
- **PR Tracking:** Separate `prHistory` table tracks all PR updates for historical analysis, displayed on stats page.
- **Goal Completion Animations:** Celebratory popups with particle effects for goal completions.
- **Activity Feed Enhancements:** Filter buttons, user avatars via AvatarDisplay component, Lucide icons.
- **Dashboard Widgets:** Today's XP tracker, MVL standings, Active Challenges.
- **Photo Upload System:** Enforces a 1-photo-per-day limit (resets midnight CT) with enhanced error handling.
- **Edit Weight Feature:** Allows correcting weight entries without awarding duplicate XP.
- **Variable Challenge XP:** Daily challenges have configurable XP values (15, 20, or 25 XP).
- **Admin Promotion System:** Admins can grant or revoke admin privileges.
- **Weekly Goals & Challenge Limits:** Users are limited to 2 active weekly goals and can complete a maximum of 2 daily challenges per week.
- **Streak Management:** Admins can edit user check-in streaks. Stats page displays a 90-day check-in calendar. Achievement badges are awarded for streak milestones (7, 30, 100, 365 days).
- **Quick Stats Dashboard Widget:** Displays current streak, monthly check-ins, weekly PRs, and MVL wins.
- **PR Comparison Tool:** Compares user's lifts to gym averages and percentile rankings.
- **Dashboard Decluttering:** Consolidated dashboard widgets and moved goals management to a dedicated page.
- **Collapsible Dashboard Sections:** Major dashboard sections are collapsible with `localStorage` persistence.
- **Top Lifts Widget:** Displays top 3 users for squat, bench press, and deadlift.
- **Multi-Crew System:** Supports multiple crews with membership management, invitations, and roles. Users can only join one crew.
- **View Context Switcher:** Toggles between crew-specific and gym-wide views. Gym-wide view hides personal sections (Quick Stats, Daily Actions, Tracking, Crew Challenge) and shows only competitive content (MVL Race, Weekly MVM, Crew Competitions, Leaderboards).
- **Crew-Specific MVL:** Daily MVL race can be filtered by crew membership.
- **Crew vs Crew Competitions:** Dashboard displays four competitive categories: Weekly Check-In Battle, Monthly XP War, Challenge Completion %, and Total Lift Showdown.
- **Weekly MVM System:** Tracks and awards the top weekly XP earner across the entire gym.

## External Dependencies

### Third-Party Services
- **Neon Serverless PostgreSQL:** Database service.
- **Replit Object Storage:** Stores user-uploaded progress photos.

### Key NPM Packages
- **Frontend:** `@radix-ui/*`, `tailwindcss`, `lucide-react`, `cmdk`, `@uppy/react`, `@tanstack/react-query`.
- **Backend:** `express`, `passport`, `passport-local`, `bcrypt`, `drizzle-orm`, `drizzle-kit`, `zod`, `multer`, `connect-pg-simple`.

### Environment Variables
- `DATABASE_URL`
- `SESSION_SECRET`
- `NODE_ENV`