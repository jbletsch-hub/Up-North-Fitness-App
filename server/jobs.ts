import cron from "node-cron";
import { storage } from "./storage";
import { getCentralTimeDate } from "./utils/timezone";

export function startScheduledJobs() {
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
  
  console.log("[CRON] Scheduled jobs started - MVL award runs at midnight Central Time");
}
