// XP and leveling system utilities

const TITLE_BUCKETS = [
  "Rookie 1",
  "Rookie 2",
  "Noobie",
  "Amateur",
  "Veteran",
  "Meathead",
  "Beast",
  "Hulk",
  "Olympian",
  "Titan",
];

export function xpNeededForLevel(level: number): number {
  if (level >= 50) return 10 ** 9;
  return Math.floor(100 * Math.pow(1.125, level - 1));
}

export function recalcLevel(totalXp: number): number {
  let level = 1;
  let remaining = totalXp;

  while (level < 50) {
    const needed = xpNeededForLevel(level);
    if (remaining >= needed) {
      remaining -= needed;
      level++;
    } else {
      break;
    }
  }

  return level;
}

export function titleForLevel(level: number): string {
  if (level >= 50) return "Immortal";
  const index = Math.floor((level - 1) / 5);
  return TITLE_BUCKETS[Math.min(index, TITLE_BUCKETS.length - 1)];
}

export function calculateLevelAndTitle(xp: number): { level: number; title: string } {
  const level = recalcLevel(xp);
  const title = titleForLevel(level);
  return { level, title };
}
