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
- **Arm Anatomy Redesign (Nov 12, 2025):** Arms completely rebuilt with distinct upper arm and forearm sections for realistic muscle progression. Upper arm positioned at cy=118 for better shoulder spacing. Upper arm is wider (armWidth + 2), narrower elbow transition (0.75x), and slimmer forearm (0.85x). Arms rotate at shoulder joint (shoulderY: 88) and angle naturally into tank top. Width progression: 4→26 across 10 stages. Progressive muscle definition with veins appearing from Stage 4+ (forearms). Bicep bulges removed for cleaner look.
- **Enhanced Muscle Definition (Nov 12, 2025):** Chest now features fully dynamic perimeter outlines that scale proportionally with shoulder/chest width to properly fit all body sizes (Stage 3+), in addition to center separation and inner curved lines that also scale dynamically. Abs enhanced with vertical center line separating left and right abs (Stage 3+) plus progressively appearing horizontal lines (top abs Stage 3+, middle abs Stage 4+, lower abs Stage 5+) for clear six-pack definition.
- **Dynamic Arm Angles (Nov 12, 2025):** Arms now angle from 18° (skinny stages) to 30° (massive stages) instead of static 20° across all stages, creating more natural and dynamic poses as characters evolve.
- **Final Stage Progression (Nov 12, 2025):** Dramatically increased visual differences between final 3 stages: Stage 7 (shoulders: 56, arms: 18), Stage 8 (shoulders: 68, arms: 22), Stage 9 (shoulders: 72, arms: 26). Neck width capped at 15-17 to maintain proportions even on massive bodies.
- **V-Taper Physique (Nov 12, 2025):** Torso width now caps at 34 max (down from 66) to create classic bodybuilder V-shape with massive chest (90 max) and slim waist. Replaced rounded ellipse torso with custom path for sharp taper from wide chest to slim waist.
- **Chest Definition Rebuild (Nov 12, 2025):** Completely rebuilt chest muscle system with progressive definition: Stage 2 (small center line), Stage 3 (bigger center line + 2 small horizontal lines defining bottom of pecs), Stage 5+ (extended and more defined horizontal lines). Removed complex curved/perimeter outlines in favor of simple, clean lines.
- **Arm Proportions (Nov 12, 2025):** Reduced forearm width from 0.85x to 0.7x armWidth for slimmer forearms. Increased forearm length from ry=21 to ry=24 and repositioned lower (cy: 154→156). Reduced hand sizes from 0.9x/0.8x to 0.7x/0.6x armWidth multipliers for better proportions across all stages.
- **Neck Outline Fix (Nov 12, 2025):** Removed stroke from neck ellipse to eliminate brown outline showing above tank top collar for cleaner appearance.
- **Progressive Chest Lines (Nov 12, 2025):** Center vertical line now extends progressively (stage * 1.8 pixels) with increasing thickness. Horizontal pec lines converted to dramatic curved paths (quadratic bezier) that grow significantly longer (18 + stage * 2 pixels) and curve dramatically downward (stage * 0.35) to follow natural pec muscle contour. Final stage (9) features the most defined and prominent chest lines for maximum visual impact.
- **Eye Clipping Fix (Nov 12, 2025):** Increased head clip path radius from 27 to 28.5 to prevent eyes from being clipped at head boundary.
- **Progressive Facial Expressions (Nov 12, 2025):** Added dynamic facial expressions that evolve across stages. Eyebrows: Stage 0-2 (light/uncertain), Stage 3-5 (confident/defined), Stage 6-7 (strong/angled), Stage 8-9 (intense/determined). Mouth: Stage 0-2 (small smile), Stage 3-5 (bigger grin), Stage 6-7 (wide powerful grin), Stage 8-9 (intense determined expression). Creates more personality and reflects the fitness journey visually.
- **Rotation Feature Removed (Nov 12, 2025):** Completely removed 360° avatar rotation feature (side view, back view) as it didn't render well. Restored simple front-view-only avatar display for cleaner, more consistent appearance across all stages.
- **Chest Striations (Nov 12, 2025):** Added fine diagonal chest striation lines showing extreme muscle definition at highest stages. Stage 8 shows 1 striation line on each pec, Stage 9 shows 2 striation lines on each pec for maximum muscular detail.
- **Public Stats Viewing (Nov 12, 2025):** Stats pages are now publicly viewable for all users. Backend API supports optional userId parameter (`/api/stats/:userId`), frontend supports `/stats/:userId` route. Added "View Stats" buttons on both XP and PR leaderboards linking to individual user stats pages. Page displays "Your Stats" when viewing own data, or "[Username]'s Stats" when viewing others.
- **Headband Position Fix (Nov 12, 2025):** Adjusted avatar headband position from cy=58 to cy=50, moving it higher on the forehead for better visual appearance.
- **Stats Page Cache Fix (Nov 12, 2025):** Fixed stats page query key to properly invalidate cache when XP changes. Query now uses consistent format `['/api/stats', userId]` with enabled flag to prevent premature fetching.
- **Browse Users Feature (Nov 12, 2025):** Added "Browse Users" section at bottom of stats page showing all platform users in a responsive grid. Each card displays mini avatar, name, level, XP, title, and MVL badge. Clicking any user navigates to their stats page. New `/api/users` endpoint returns public user info (id, username, displayName, level, xp, title, mvlWins).
- **Character Type System (Nov 12, 2025):** Implemented 4 distinct body type variations for avatars while maintaining 10-stage progression. Users can choose between Classic (balanced 1.0x proportions), Bulky (mass monster with 1.15-1.2x wider shoulders/chest/arms), Athletic (lean & defined with 0.85-0.95x narrower proportions), and Powerlifter (thick & strong with 1.15-1.3x stockier build). Character type selector added to Avatar page (`/avatar`) with live preview showing real-time changes. Database schema includes `characterType` field (default: "classic"), API endpoint PUT `/api/avatar` saves selection, and all avatar displays (Dashboard, Stats, Browse Users) use each user's selected character type for personalized physiques.
- **Admin-Only Progression Preview (Nov 12, 2025):** Hidden the "Progression Preview" and "Muscle Progression System" sections on the Avatar page from regular users to preserve the surprise of discovering avatar evolution through leveling. Only admin users can now see all 10 stages at once. Regular users see their current avatar and can customize it, but future stages remain a mystery until earned.

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