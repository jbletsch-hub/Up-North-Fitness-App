// Calculate cumulative XP threshold to reach a specific level (matches backend)
export function getXPForLevel(level: number): number {
  if (level === 1) return 0;
  
  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += Math.floor(100 * Math.pow(1.125, i - 1));
  }
  return totalXP;
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
