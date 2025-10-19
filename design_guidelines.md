# Iron Crew - Fullstack JavaScript Design Guidelines

## Design Approach

**Hybrid Approach**: Combining utility-focused fitness tracking with experience-driven gamification. Drawing inspiration from **Strava's** data visualization, **Duolingo's** gamification patterns, and **Discord's** community engagement aesthetic.

**Core Principles**:
- Energetic but focused - motivate action without distraction
- Data-forward with personality - stats are the hero, gamification adds flavor
- Community-driven - celebrate crew achievements prominently
- Achievement-oriented - make progress visible and rewarding

---

## Color Palette

### Dark Mode (Default)
- **Background**: 15 8% 8% (deep charcoal)
- **Surface/Cards**: 240 6% 12% (elevated dark)
- **Primary/Accent**: 45 93% 58% (energetic gold - for XP, achievements)
- **Secondary**: 262 83% 58% (vibrant purple - for levels, titles)
- **Success**: 142 76% 36% (strong green - for completed actions)
- **Text Primary**: 0 0% 95%
- **Text Secondary**: 0 0% 65%
- **Border**: 240 6% 18%

### Light Mode
- **Background**: 220 20% 97%
- **Surface/Cards**: 0 0% 100%
- **Primary/Accent**: 45 93% 48%
- **Secondary**: 262 83% 58%
- **Success**: 142 76% 36%
- **Text Primary**: 220 20% 15%
- **Text Secondary**: 220 10% 45%
- **Border**: 220 15% 88%

---

## Typography

**Font Families**:
- Primary: 'Inter' (Google Fonts) - clean, modern, excellent for data
- Accent: 'Bebas Neue' (Google Fonts) - bold, athletic for headers and stats

**Hierarchy**:
- Page Headers: Bebas Neue, 48px, uppercase, letter-spacing: 2px
- Section Headers: Inter, 24px, 700 weight
- Card Headers: Inter, 18px, 600 weight
- Body Text: Inter, 15px, 400 weight
- Stats/Numbers: Bebas Neue, 32-40px for emphasis
- Micro Text: Inter, 13px, 500 weight

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-6 or p-8
- Section gaps: gap-6 or gap-8
- Page margins: px-4 md:px-8
- Vertical rhythm: space-y-6 between sections

**Container**: max-w-7xl for main content, max-w-6xl for focused views

**Grid Patterns**:
- Dashboard: 3-column on desktop (repeat(3, 1fr)), 2-col on tablet, 1-col mobile
- Leaderboard: Full-width single column
- Profile: 2-column split (stats left, activity right)

---

## Component Library

### Navigation Bar
- Fixed top, translucent backdrop blur
- Logo with iron/crew emoji (🛠️ or 💪)
- Navigation links with active state indicators
- User avatar dropdown (shows current level/XP on hover)
- Theme toggle icon button

### Cards
- Border-radius: 16px
- Subtle border (1px solid border color)
- Padding: p-6 or p-8
- Shadow: minimal or none (rely on borders for definition)
- Hover state: slight border color brightening

### XP Progress Bar
- Height: 12px
- Rounded corners (rounded-full)
- Background: border color
- Fill: gradient from primary to secondary (gold to purple)
- Smooth transition on value changes (transition-all duration-500)
- Show current XP / Next Level XP above bar

### Leaderboard Items
- Avatar (48px circle) on left
- Username with level badge inline
- Title badge (pill shape, secondary color background)
- XP displayed prominently on right
- Rank number in bold on far left
- Top 3 get special visual treatment (gold/silver/bronze accent)

### Challenge Cards
- Checkbox or "Complete" button
- Challenge text with icon
- XP reward badge (small, gold, "+15 XP")
- Completed state: muted colors, checkmark icon
- Incomplete state: full color, prominent button

### PR Tracker
- 3 input fields (Squat, Bench, Deadlift)
- Large number displays (Bebas Neue font)
- Total calculation shown prominently below
- Historical best indicators (if applicable)
- Single "Update PRs" button below all inputs

### Crew Goal Meter
- Large, prominent component
- Progress bar (height: 24px)
- Current total vs goal displayed above
- Percentage completion
- Celebratory state when goal reached (confetti or glow effect)

### Activity Feed
- Timeline format with subtle connecting lines
- User avatar thumbnail
- Action description with bolded username
- Timestamp (relative, e.g., "2h ago")
- XP badge for actions that earned points
- Limit to 10 most recent items

### Photo Gallery
- Grid layout (grid-cols-3 on desktop)
- Square aspect ratio (aspect-square)
- Rounded corners (rounded-lg)
- Hover overlay with upload date
- Lightbox view on click

### Admin Panel
- Table layout for users list
- Action buttons (delete, edit) with confirmation
- Form for adding challenges to pool
- Crew goal adjustment slider
- Stats dashboard (total users, total XP awarded, etc.)

---

## Page Layouts

### Home/Landing
- **Hero Section**: Full-width crew goal meter with current progress
- Below: 2-column grid (Leaderboard left, Activity Feed right)
- Prominent "Join the Crew" CTA if not logged in

### Dashboard
- Welcome header with user's name, level, and title
- Grid of action cards:
  - Daily Challenges (shows 3-5 challenges)
  - Check-In card with streak counter
  - Quick Stats (current level progress)
  - PR Tracker
  - Weigh-In form
  - Photo Upload
- Crew Progress section at bottom

### Profile
- Header with large avatar, username, level, title
- Stats grid: XP, Level, Streak, PRs
- Tabs: PRs, Photos, Activity
- Visual progress indicators (level bar, PR charts if possible)

### Admin Panel
- Sidebar navigation for different admin functions
- Main content area with tables and forms
- Stats overview cards at top

---

## Interactions & Animations

- **XP Popup**: Fixed position top-right, slide-in from right, fade out after 3s, gold background with white text
- **Level Up**: Modal or toast notification with celebration (brief scale animation)
- **Challenge Completion**: Checkmark animation, card turns muted green
- **Progress Bars**: Smooth width transitions (duration-500 ease-in-out)
- **Hover States**: Subtle scale (scale-105) on cards, color shifts on buttons
- **No unnecessary page transitions** - focus on functional feedback

---

## Images

**Avatar System**: Use emoji-based SVG data URIs (as in original app) OR allow custom uploads
- Default options: 🏋️, 💪, 🔥, ⚡, 🎯
- Display as 32px circles in lists, 64px+ on profiles

**Progress Photos**: User-uploaded, displayed in chronological grid

**No hero images needed** - this is a utility-focused dashboard app. Visual interest comes from data visualization, progress bars, and gamification elements.

---

## Accessibility & Responsiveness

- All interactive elements keyboard accessible
- Focus states clearly visible (ring-2 ring-primary)
- Color contrast WCAG AA compliant minimum
- Mobile-first: stack columns on small screens
- Touch targets minimum 44px
- Dark mode as default, easy toggle