# Up North Fitness - Fitness Tracking & Gamification Platform

## Overview
Up North Fitness is a full-stack fitness tracking and gamification platform designed to motivate users through their fitness journey. It features workout logging, personal record tracking, daily challenges, and progress photo uploads. The platform incorporates gamification elements such as an XP leveling system, streak tracking, collaborative crew goals, competitive leaderboards (XP and PR), and a daily "Most Valuable Lifter" (MVL) badge system. It also includes yearly goals, calorie tracking, and a dynamic avatar system that visually evolves with user achievements, providing a comprehensive and engaging fitness experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX
The frontend is built with React 18, TypeScript, and Vite, utilizing Wouter for routing. Styling is managed by Tailwind CSS, Radix UI primitives, and shadcn/ui components, adhering to a "New York" design aesthetic with light/dark modes. Typography uses Inter and Bebas Neue. The application supports PWA and is mobile-responsive with a mobile-first navigation. A custom compass navigation logo and optimized PWA icon are included. Public profiles are available for user stats, and a view context switcher allows toggling between crew-specific and gym-wide views. Dashboard sections are collapsible with `localStorage` persistence.

### Technical Implementations
The backend is an Express.js application in TypeScript, using session-based authentication with `express-session`, `passport-local`, and PostgreSQL for session storage. Data persistence is handled by Drizzle ORM with Neon serverless PostgreSQL, following a schema-driven design. TanStack Query manages data fetching on the frontend, with state managed by a custom `useAuth` hook for authentication and React hooks for local component state. Server-persisted data strictly relies on TanStack Query cache invalidation, with the server as the single source of truth, avoiding optimistic local state. Critical fixes for persistence, dashboard loading, and privacy settings have been implemented, along with mobile touch interaction improvements.

**PWA & Service Worker:** Service worker (v1.0.18) uses a dual caching strategy - network-first for HTML/JS/navigation to ensure users always get the latest code when online, and cache-first for static assets (images, icons) for performance. This prevents cached JavaScript from blocking bug fixes in production builds. The service worker is now enabled for production builds only and uses `ignoreSearch: true` for navigation fallbacks to prevent version query params from breaking offline installation. Manifest (v1.0.8) includes explicit `scope: "/"` and maskable icon support for better platform compliance. Service worker registration was re-enabled after being disabled which was preventing PWA installation.

### Feature Specifications
The gamification system includes an XP curve (approx. 200k XP for level 50), an 11-tier title progression, and XP awards for daily activities and goal completions. A daily MVL competition tracks the highest XP earner from daily activities, and daily challenges are randomized. All time-based operations are anchored to Central Time (America/Chicago). An advanced avatar system offers a 10-stage visual progression with dynamic facial expressions, muscle definition, and diverse customization options including gender-specific body proportions, 6 skin tones, gender-specific hair styles, and facial hair (males only). The platform supports PR tracking with historical data, goal completion animations, and an enhanced activity feed. 

**Celebration System:** Achievement celebrations use canvas-confetti library with multiple effects: confetti for PRs and goal completions, fireworks for crew goal advancements and 100-day streaks, and flame effects for streak milestones (7, 30, 60 days). The `useCelebration` hook provides centralized celebration management integrated into goal completions, PR logging, crew milestones, and streak achievements.

**Photo Management:** A photo upload system uses Replit Object Storage with direct uploads and a 1-photo-per-day limit. Photos are set to public visibility in object storage but access is controlled server-side through privacy checks. A photo comparison feature allows users to select before/after photos from their timeline with an interactive slider interface, displaying progress metrics like days elapsed. The `/api/photos/:userId` endpoint respects privacy settings, only returning photo data to the owner, users viewing public profiles, or crew members. Error handling gracefully manages access-denied scenarios.

**Lifting Club Badges:** A tier-based achievement system tracks total lift (squat + bench + deadlift) with milestones at 500, 600, 700, 800, 900, 1000, 1200, 1500, and 2000 lbs. Each milestone tier (beginner, intermediate, advanced, elite, legendary) has distinct badge styling with gradient backgrounds and unique icons. The LiftingClubProgress card displays current club status, progress to next milestone, and individual lift breakdown. A compact LiftingClubWidget provides at-a-glance motivation on the Dashboard.

**Performance Analytics:** Best Performance Day feature analyzes PR history to identify which day of the week users hit PRs most frequently. The `/api/stats/best-day/:userId` endpoint aggregates historical PR data and returns day-of-week breakdowns. The BestPerformanceDay component visualizes this data with a bar chart highlighting the best performance day and showing PR frequency across all days.

**2XP Boost System:** Admin-controlled boost system allows admins to enable 2X XP multiplier for specific users via toggle button in User Management. The boost applies ONLY to daily challenges and weekly goals (yearly and lifetime goals are not affected). Users with active boost see a prominent badge on Dashboard and boosted XP amounts (with Sparkles icon) displayed on all challenge/goal cards. The `users.has2XPBoost` boolean field controls the boost status, and XP is doubled server-side before being awarded to ensure accurate tracking. Admin UI shows visual indicators (Sparkles badge) for users with active boosts.

Features include weight entry correction, variable challenge XP, admin promotion, weekly goals (limit 2 active), daily challenge limits (max 2 per week), and admin tools for streak management. The dashboard includes widgets for XP tracking, MVL standings, and active challenges, along with a Quick Stats widget, Top Lifts widget, and Lifting Club widget. A multi-crew system supports membership management, invitations, and roles, with users limited to one crew. Crew-specific MVL and various "Crew vs Crew" competitions (Weekly Check-In Battle, Monthly XP War, Challenge Completion %, Total Lift Showdown) are implemented. A Weekly MVM system tracks the top weekly XP earner gym-wide. A simplified privacy system uses a single `isProfilePrivate` toggle: public profiles show all data, while private profiles restrict data for non-crew members, with crew members always bypassing restrictions. Leaderboards sanitize private user data to show only competitive info.

## External Dependencies

### Third-Party Services
- **Neon Serverless PostgreSQL:** Database
- **Replit Object Storage:** For user-uploaded photos

### Key NPM Packages
- **Frontend:** `@radix-ui/*`, `tailwindcss`, `lucide-react`, `cmdk`, `@uppy/react`, `@tanstack/react-query`, `canvas-confetti`, `date-fns`
- **Backend:** `express`, `passport`, `passport-local`, `bcrypt`, `drizzle-orm`, `drizzle-kit`, `zod`, `multer`, `connect-pg-simple`

### Environment Variables
- `DATABASE_URL`
- `SESSION_SECRET`
- `NODE_ENV`
- `PRIVATE_OBJECT_DIR`
- `PUBLIC_OBJECT_SEARCH_PATHS`