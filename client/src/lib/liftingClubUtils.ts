// Lifting club milestone utilities

export const CLUB_MILESTONES = [
  500, 600, 700, 800, 900, 1000, // 100lb increments
  1200, 1500, 2000, // bigger jumps
];

export interface ClubInfo {
  totalLift: number;
  currentClub: number | null;
  nextClub: number | null;
  lbsToNext: number;
  progress: number; // percentage to next club (0-100)
  tier: 'beginner' | 'intermediate' | 'advanced' | 'elite' | 'legendary';
}

export function calculateTotalLift(squat: number, bench: number, deadlift: number): number {
  return squat + bench + deadlift;
}

export function getClubTier(clubLevel: number | null): ClubInfo['tier'] {
  if (!clubLevel || clubLevel < 1000) return 'beginner';
  if (clubLevel < 1200) return 'intermediate';
  if (clubLevel < 1500) return 'advanced';
  if (clubLevel < 2000) return 'elite';
  return 'legendary';
}

export function getLiftingClubInfo(squat: number, bench: number, deadlift: number): ClubInfo {
  const totalLift = calculateTotalLift(squat, bench, deadlift);
  
  // Find current club (highest milestone you've reached)
  let currentClub: number | null = null;
  for (let i = CLUB_MILESTONES.length - 1; i >= 0; i--) {
    if (totalLift >= CLUB_MILESTONES[i]) {
      currentClub = CLUB_MILESTONES[i];
      break;
    }
  }
  
  // Find next club
  let nextClub: number | null = null;
  for (const milestone of CLUB_MILESTONES) {
    if (totalLift < milestone) {
      nextClub = milestone;
      break;
    }
  }
  
  // Calculate progress
  const lbsToNext = nextClub ? nextClub - totalLift : 0;
  let progress = 0;
  
  if (currentClub && nextClub) {
    const range = nextClub - currentClub;
    const achieved = totalLift - currentClub;
    progress = Math.round((achieved / range) * 100);
  } else if (nextClub && !currentClub) {
    // Haven't reached first milestone yet
    progress = Math.round((totalLift / nextClub) * 100);
  } else {
    // Beyond all milestones
    progress = 100;
  }
  
  const tier = getClubTier(currentClub);
  
  return {
    totalLift,
    currentClub,
    nextClub,
    lbsToNext,
    progress,
    tier,
  };
}

export function getClubName(milestone: number): string {
  return `${milestone}lb Club`;
}

export function getClubColor(tier: ClubInfo['tier']): string {
  const colors = {
    beginner: 'text-gray-500',
    intermediate: 'text-blue-500',
    advanced: 'text-purple-500',
    elite: 'text-yellow-500',
    legendary: 'text-red-500',
  };
  return colors[tier];
}

export function getClubBgColor(tier: ClubInfo['tier']): string {
  const colors = {
    beginner: 'bg-gray-500/10',
    intermediate: 'bg-blue-500/10',
    advanced: 'bg-purple-500/10',
    elite: 'bg-yellow-500/10',
    legendary: 'bg-red-500/10',
  };
  return colors[tier];
}

export function getClubBorderColor(tier: ClubInfo['tier']): string {
  const colors = {
    beginner: 'border-gray-500/20',
    intermediate: 'border-blue-500/20',
    advanced: 'border-purple-500/20',
    elite: 'border-yellow-500/20',
    legendary: 'border-red-500/20',
  };
  return colors[tier];
}
