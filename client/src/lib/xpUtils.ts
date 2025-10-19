// Calculate XP required for a given level (same as backend formula)
export function getXPForLevel(level: number): number {
  if (level === 1) return 0;
  return Math.floor(100 * Math.pow(1.6, level - 1));
}

// Calculate how much XP is needed to reach the next level
export function getXPToNextLevel(currentXP: number, currentLevel: number): number {
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  return nextLevelXP - currentXP;
}

// Calculate progress percentage towards next level
export function getLevelProgress(currentXP: number, currentLevel: number): number {
  const currentLevelXP = getXPForLevel(currentLevel);
  const nextLevelXP = getXPForLevel(currentLevel + 1);
  const xpInCurrentLevel = currentXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  return Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForLevel) * 100));
}
