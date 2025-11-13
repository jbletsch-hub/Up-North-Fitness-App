import cron from "node-cron";
import { storage } from "./storage";
import { getCentralTimeDate } from "./utils/timezone";

// Helper function to get Monday date in YYYY-MM-DD format (Central Time)
function getMondayDate(): string {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }));
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

// Fisher-Yates shuffle algorithm for random selection
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function startScheduledJobs() {
  // Run at midnight Central Time every Monday for weekly crew challenge selection
  cron.schedule("0 0 * * 1", async () => {
    try {
      console.log("[CRON] Starting weekly crew challenge selection...");
      
      const weekStart = getMondayDate();
      const challenges = await storage.getAllCrewChallenges();
      
      if (challenges.length === 0) {
        console.log("[CRON] No crew challenges in pool - skipping selection");
        return;
      }
      
      // Randomly select a challenge using Fisher-Yates shuffle
      const shuffled = shuffleArray(challenges);
      const selectedChallenge = shuffled[0];
      
      console.log(`[CRON] Selected crew challenge: "${selectedChallenge.text}" (Target: ${selectedChallenge.targetValue} ${selectedChallenge.unit})`);
      
      // Set as active crew challenge
      await storage.setActiveCrewChallenge(selectedChallenge.id, weekStart);
      
      console.log(`[CRON] Weekly crew challenge set for week starting ${weekStart}`);
    } catch (error) {
      console.error("[CRON] Error in weekly crew challenge selection:", error);
    }
  }, {
    timezone: "America/Chicago"
  });

  // Run at midnight Central Time every day
  // Cron format: second minute hour day month weekday
  // We use TZ to ensure it runs in Central Time
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("[CRON] Starting midnight MVL award process...");
      
      const today = getCentralTimeDate();
      
      // Get yesterday's top XP earner (before resetting)
      const leaderboard = await storage.getTodayMVLLeaderboard(1);
      
      if (leaderboard.length > 0 && leaderboard[0].dailyXp > 0) {
        const winner = leaderboard[0];
        console.log(`[CRON] MVL Winner: ${winner.username} with ${winner.dailyXp} XP`);
        
        // Award MVL win
        await storage.awardMVLWin(winner.id);
        
        // Create activity entry for the winner
        await storage.createActivity({
          userId: winner.id,
          type: "xp",
          detail: "🏆 Awarded Most Valuable Lifter (MVL) badge!",
          xpAwarded: 0,
        });
        
        console.log(`[CRON] MVL badge awarded to ${winner.username}. Total MVL wins: ${winner.mvlWins + 1}`);
      } else {
        console.log("[CRON] No eligible MVL winner (no one earned XP yesterday)");
      }
      
      // Reset all daily XP for the new day
      await storage.resetAllDailyXP(today);
      console.log("[CRON] Daily XP reset complete for all users");
      
    } catch (error) {
      console.error("[CRON] Error in midnight MVL award process:", error);
    }
  }, {
    timezone: "America/Chicago"
  });
  
  console.log("[CRON] Scheduled jobs started - Weekly crew challenge (Monday midnight CT), MVL award (daily midnight CT)");
}
