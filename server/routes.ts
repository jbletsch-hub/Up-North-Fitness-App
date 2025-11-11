import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { calculateLevelAndTitle } from "./utils/xpSystem";
import { getCentralTimeDate, getCentralTimeYesterday, getCentralTimeWeekStart, getCentralTimeYearStart } from "./utils/timezone";
import multer from "multer";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

// Middleware to check if user is authenticated
function isAuthenticated(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

const upload = multer({ storage: multer.memoryStorage() });

// Use Central Time for all date operations
function getTodayDate(): string {
  return getCentralTimeDate();
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

async function awardXP(userId: string, amount: number, reason: string) {
  const user = await storage.getUser(userId);
  if (!user) return;

  const oldLevel = user.level;
  const newXP = user.xp + amount;
  const { level, title } = calculateLevelAndTitle(newXP);

  await storage.updateUserXP(userId, newXP, level, title);
  await storage.createActivity({
    userId,
    type: "xp",
    detail: reason,
    xpAwarded: amount,
  });

  // Track daily XP for MVL (Most Valuable Lifter) leaderboard
  const today = getTodayDate();
  let newDailyXP = user.dailyXp + amount;
  
  // Reset daily XP if it's a new day
  if (user.lastDailyXpReset !== today) {
    newDailyXP = amount;
  }
  
  await storage.updateUserDailyXP(userId, newDailyXP, today);

  const leveledUp = level > oldLevel;

  return { 
    xp: newXP, 
    xpAwarded: amount,
    level, 
    title,
    leveledUp,
    oldLevel
  };
}

// Fisher-Yates shuffle algorithm for proper randomization
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function assignDailyChallenges(userId: string, date: string) {
  const existing = await storage.getUserDailyChallenges(userId, date);
  if (existing.length > 0) return;

  const allChallenges = await storage.getAllChallenges();
  if (allChallenges.length === 0) {
    // Initialize default challenges if none exist
    const defaultChallenges = [
      "Complete 50 push-ups",
      "Run 2 miles",
      "Hold plank for 2 minutes",
      "Drink 8 glasses of water",
      "Do 100 bodyweight squats",
      "Complete a 30-minute workout",
      "Stretch for 15 minutes",
      "Take a cold shower",
      "Meditate for 10 minutes",
      "Go for a 30-minute walk",
    ];

    for (const text of defaultChallenges) {
      await storage.createChallenge({ text });
    }

    const refreshedChallenges = await storage.getAllChallenges();
    const selected = shuffleArray(refreshedChallenges).slice(0, 4);

    for (const challenge of selected) {
      await storage.createUserDailyChallenge({
        userId,
        date,
        challengeId: challenge.id,
        completed: false,
      });
    }
  } else {
    const selected = shuffleArray(allChallenges).slice(0, 4);

    for (const challenge of selected) {
      await storage.createUserDailyChallenge({
        userId,
        date,
        challengeId: challenge.id,
        completed: false,
      });
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes (/api/register, /api/login, /api/logout, /api/user)
  setupAuth(app);

  // Profile setup endpoint
  app.post("/api/profile/setup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, profilePicture } = req.body;

      if (!firstName || !profilePicture) {
        return res.status(400).json({ message: "First name and profile picture are required" });
      }

      const user = await storage.updateUserProfile(userId, firstName, lastName, profilePicture);
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error setting up profile:", error);
      res.status(500).json({ message: "Failed to setup profile" });
    }
  });

  // Update display name endpoint
  app.post("/api/profile/display-name", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { displayName } = req.body;

      if (!displayName || displayName.trim().length === 0) {
        return res.status(400).json({ message: "Display name is required" });
      }

      if (displayName.length > 50) {
        return res.status(400).json({ message: "Display name must be 50 characters or less" });
      }

      const user = await storage.updateUserDisplayName(userId, displayName.trim());
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error updating display name:", error);
      res.status(500).json({ message: "Failed to update display name" });
    }
  });

  // Home page data
  app.get("/api/home", async (req, res) => {
    try {
      const leaderboard = await storage.getAllUsers();
      const activities = await storage.getRecentActivities(10);
      const goal = await storage.getCrewGoal();
      const allPRs = await storage.getAllPRs();
      const total = allPRs.reduce((sum, pr) => sum + pr.squat + pr.bench + pr.deadlift, 0);

      const formattedActivities = activities.map((a) => ({
        ...a,
        createdAt: getRelativeTime(new Date(a.createdAt)),
      }));

      res.json({
        leaderboard,
        activities: formattedActivities,
        goal,
        total,
      });
    } catch (error) {
      console.error("Error fetching home data:", error);
      res.status(500).json({ message: "Failed to fetch home data" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = getTodayDate();
      await assignDailyChallenges(userId, today);

      const challenges = await storage.getUserDailyChallenges(userId, today);
      const pr = (await storage.getPR(userId)) || { squat: 0, bench: 0, deadlift: 0 };
      const goal = await storage.getCrewGoal();
      const allPRs = await storage.getAllPRs();
      const total = allPRs.reduce((sum, pr) => sum + pr.squat + pr.bench + pr.deadlift, 0);

      res.json({
        user,
        challenges,
        pr,
        goal,
        total,
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard" });
    }
  });

  // Complete challenge
  app.post("/api/challenges/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const challengeId = req.params.id;

      await storage.completeChallenge(challengeId);
      const result = await awardXP(userId, 15, "completed a daily challenge");

      // Check if all daily challenges are completed
      const today = getTodayDate();
      const allChallenges = await storage.getUserDailyChallenges(userId, today);
      const allCompleted = allChallenges.every((c) => c.completed);

      let bonusResult;
      if (allCompleted) {
        bonusResult = await awardXP(userId, 45, "completed all daily challenges!");
      }

      res.json({ 
        success: true, 
        ...result,
        allCompleted,
        bonusXP: bonusResult?.xpAwarded || 0
      });
    } catch (error) {
      console.error("Error completing challenge:", error);
      res.status(500).json({ message: "Failed to complete challenge" });
    }
  });

  // Reroll daily challenges
  app.post("/api/challenges/reroll", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = getTodayDate();

      // Check if user has already rerolled today
      if (user.lastRerollDate === today) {
        return res.status(400).json({ message: "You can only reroll once per day" });
      }

      // Check if any challenges have been completed today
      const challenges = await storage.getUserDailyChallenges(userId, today);
      const hasCompleted = challenges.some((c) => c.completed);
      
      if (hasCompleted) {
        return res.status(400).json({ message: "Cannot reroll after completing a challenge" });
      }

      // Delete current challenges for today
      await storage.deleteUserDailyChallenges(userId, today);

      // Assign new challenges
      await assignDailyChallenges(userId, today);

      // Update last reroll date
      await storage.updateUserRerollDate(userId, today);

      // Get new challenges
      const newChallenges = await storage.getUserDailyChallenges(userId, today);

      res.json({ success: true, challenges: newChallenges });
    } catch (error) {
      console.error("Error rerolling challenges:", error);
      res.status(500).json({ message: "Failed to reroll challenges" });
    }
  });

  // Check-in
  app.post("/api/checkin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = getTodayDate();
      const yesterdayStr = getCentralTimeYesterday();

      let newStreak = 1;
      if (user.lastCheckinDate === yesterdayStr) {
        newStreak = user.streakCount + 1;
      } else if (user.lastCheckinDate === today) {
        return res.status(400).json({ message: "Already checked in today" });
      }

      await storage.updateUserStreak(userId, newStreak, today);
      const result = await awardXP(userId, 15, "checked in");

      res.json({ success: true, streak: newStreak, ...result });
    } catch (error) {
      console.error("Error checking in:", error);
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  // Update PRs
  app.post("/api/prs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { squat, bench, deadlift } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = getTodayDate();
      
      // Prevent updating PRs more than once per day
      if (user.lastPrUpdateDate === today) {
        return res.status(400).json({ message: "You can only update your PRs once per day" });
      }

      await storage.updateUserPRDate(userId, today);
      const result = await awardXP(userId, 10, "updated their PRs");
      const xpAwarded = 10;

      const pr = await storage.upsertPR(userId, {
        squat: parseInt(squat) || 0,
        bench: parseInt(bench) || 0,
        deadlift: parseInt(deadlift) || 0,
      });

      // Check if crew goal is reached and auto-advance
      const allPRs = await storage.getAllPRs();
      const total = allPRs.reduce((sum, pr) => sum + pr.squat + pr.bench + pr.deadlift, 0);
      const currentGoal = await storage.getCrewGoal();
      
      let goalAdvanced = false;
      let newGoal = currentGoal;
      
      if (total >= currentGoal) {
        // Automatically advance by 250 lbs
        newGoal = currentGoal + 250;
        await storage.updateCrewGoal(newGoal);
        goalAdvanced = true;
        console.log(`🎯 Crew goal auto-advanced! ${currentGoal} → ${newGoal} (total: ${total})`);
      }

      res.json({ success: true, pr, xpAwarded, goalAdvanced, oldGoal: currentGoal, newGoal });
    } catch (error) {
      console.error("Error updating PRs:", error);
      res.status(500).json({ message: "Failed to update PRs" });
    }
  });

  // Weigh-in
  app.post("/api/weighin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { weight } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = getTodayDate();
      
      // Prevent weighing in more than once per day
      if (user.lastWeighinDate === today) {
        return res.status(400).json({ message: "You can only weigh in once per day" });
      }

      const result = await awardXP(userId, 15, "recorded their weight");
      const xpAwarded = 15;

      await storage.updateUserWeight(userId, parseFloat(weight), today);

      res.json({ success: true, weight: parseFloat(weight), xpAwarded });
    } catch (error) {
      console.error("Error recording weight:", error);
      res.status(500).json({ message: "Failed to record weight" });
    }
  });

  // Upload progress photo (using object storage)
  app.post("/api/photos", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { photoURL } = req.body;

      console.log("[PHOTO UPLOAD] Received photoURL:", photoURL);

      if (!photoURL) {
        return res.status(400).json({ message: "No photo URL provided" });
      }

      // Import ObjectStorageService here to avoid circular dependency
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();

      console.log("[PHOTO UPLOAD] Normalizing path...");
      // Set ACL policy for the uploaded photo (public visibility so anyone can view profiles)
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        photoURL,
        {
          owner: userId,
          visibility: "public", // Public so anyone can view user profiles
        }
      );

      console.log("[PHOTO UPLOAD] Normalized objectPath:", objectPath);

      // Save to database
      await storage.createProgressPhoto({
        userId,
        imagePath: objectPath,
      });

      const result = await awardXP(userId, 15, "uploaded a progress photo");

      console.log("[PHOTO UPLOAD] Success! XP awarded:", result?.xpAwarded || 0);
      res.json({ success: true, objectPath, ...result });
    } catch (error) {
      console.error("[PHOTO UPLOAD] Error saving photo:", error);
      res.status(500).json({ message: "Failed to save photo", error: String(error) });
    }
  });

  // Get upload URL for progress photo
  app.post("/api/photos/upload-url", isAuthenticated, async (req, res) => {
    try {
      const { ObjectStorageService } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      console.log("[PHOTO UPLOAD] Generated upload URL:", uploadURL);
      res.json({ uploadURL });
    } catch (error) {
      console.error("[PHOTO UPLOAD] Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL", error: String(error) });
    }
  });

  // Serve uploaded photos from object storage
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const { ObjectStorageService, ObjectNotFoundError } = await import("./objectStorage");
      const objectStorageService = new ObjectStorageService();
      
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      const { ObjectNotFoundError } = await import("./objectStorage");
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get user profile
  app.get("/api/profile/:username", async (req, res) => {
    try {
      // Trim username to handle URL-encoded spaces and leading/trailing whitespace
      const username = decodeURIComponent(req.params.username).trim();
      const user = await storage.getUserByUsername(username);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const pr = (await storage.getPR(user.id)) || { squat: 0, bench: 0, deadlift: 0 };
      const photos = await storage.getPhotosByUser(user.id);
      const activities = await storage.getActivitiesByUser(user.id, 20);
      
      // Get daily challenges for today
      const today = getTodayDate();
      await assignDailyChallenges(user.id, today);
      const challenges = await storage.getUserDailyChallenges(user.id, today);
      
      // Get goals
      const weeklyGoals = await storage.getUserGoals(user.id, "weekly");
      const lifetimeGoals = await storage.getUserGoals(user.id, "lifetime");

      const formattedActivities = activities.map((a) => ({
        ...a,
        createdAt: getRelativeTime(new Date(a.createdAt)),
      }));

      res.json({
        user,
        pr,
        photos,
        activities: formattedActivities,
        challenges,
        weeklyGoals,
        lifetimeGoals,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.post("/api/admin/users/:id/display-name", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { displayName } = req.body;
      
      if (!displayName || displayName.trim().length === 0) {
        return res.status(400).json({ message: "Display name is required" });
      }

      if (displayName.length > 50) {
        return res.status(400).json({ message: "Display name must be 50 characters or less" });
      }

      const updatedUser = await storage.updateUserDisplayName(req.params.id, displayName.trim());
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating display name:", error);
      res.status(500).json({ message: "Failed to update display name" });
    }
  });

  app.get("/api/admin/challenges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const challenges = await storage.getAllChallenges();
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.post("/api/admin/challenges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { text } = req.body;
      const challenge = await storage.createChallenge({ text });
      res.json(challenge);
    } catch (error) {
      console.error("Error creating challenge:", error);
      res.status(500).json({ message: "Failed to create challenge" });
    }
  });

  app.delete("/api/admin/challenges/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteChallenge(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting challenge:", error);
      res.status(500).json({ message: "Failed to delete challenge" });
    }
  });

  app.post("/api/admin/goal", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { goal } = req.body;
      await storage.updateCrewGoal(parseInt(goal));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  app.post("/api/admin/goal/advance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Get current goal and add 250 lbs
      const currentGoal = await storage.getCrewGoal();
      const nextGoal = currentGoal + 250;
      
      await storage.updateCrewGoal(nextGoal);
      res.json({ success: true, goal: nextGoal });
    } catch (error) {
      console.error("Error advancing goal:", error);
      res.status(500).json({ message: "Failed to advance goal" });
    }
  });

  app.post("/api/admin/goal/reset-to-5000", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.updateCrewGoal(5000);
      res.json({ success: true, goal: 5000 });
    } catch (error) {
      console.error("Error resetting goal to 5000:", error);
      res.status(500).json({ message: "Failed to reset goal to 5000" });
    }
  });

  app.post("/api/admin/users/:userId/xp/add", isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const admin = await storage.getUser(adminId);

      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { userId } = req.params;
      const { xp } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newXP = user.xp + parseInt(xp);
      const { level, title } = calculateLevelAndTitle(newXP);
      await storage.updateUserXP(userId, newXP, level, title);

      res.json({ success: true, newXP });
    } catch (error) {
      console.error("Error adding XP:", error);
      res.status(500).json({ message: "Failed to add XP" });
    }
  });

  app.post("/api/admin/users/:userId/xp/remove", isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const admin = await storage.getUser(adminId);

      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { userId } = req.params;
      const { xp } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newXP = Math.max(0, user.xp - parseInt(xp));
      const { level, title } = calculateLevelAndTitle(newXP);
      await storage.updateUserXP(userId, newXP, level, title);

      res.json({ success: true, newXP, level, title });
    } catch (error) {
      console.error("Error removing XP:", error);
      res.status(500).json({ message: "Failed to remove XP" });
    }
  });

  app.post("/api/admin/users/:userId/xp/reset", isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const admin = await storage.getUser(adminId);

      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { userId } = req.params;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { level, title } = calculateLevelAndTitle(0);
      await storage.updateUserXP(userId, 0, level, title);
      res.json({ success: true, newXP: 0 });
    } catch (error) {
      console.error("Error resetting XP:", error);
      res.status(500).json({ message: "Failed to reset XP" });
    }
  });

  app.post("/api/admin/recalculate-levels", isAuthenticated, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      const admin = await storage.getUser(adminId);

      if (!admin?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const allUsers = await storage.getAllUsers();
      let updated = 0;

      console.log(`[RECALC] Starting level recalculation for ${allUsers.length} users`);

      for (const user of allUsers) {
        const { level, title } = calculateLevelAndTitle(user.xp);
        console.log(`[RECALC] User ${user.username}: XP=${user.xp}, CurrentLevel=${user.level}, CorrectLevel=${level}, CurrentTitle=${user.title}, CorrectTitle=${title}`);
        
        if (user.level !== level || user.title !== title) {
          console.log(`[RECALC] Updating ${user.username} from level ${user.level} to ${level}, title "${user.title}" to "${title}"`);
          await storage.updateUserXP(user.id, user.xp, level, title);
          updated++;
        }
      }

      console.log(`[RECALC] Recalculation complete. Updated ${updated} users.`);
      res.json({ success: true, usersUpdated: updated });
    } catch (error) {
      console.error("Error recalculating levels:", error);
      res.status(500).json({ message: "Failed to recalculate levels" });
    }
  });

  // Goals endpoints
  app.get("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const { type } = req.query;
      const goals = await storage.getUserGoals(req.user.id, type);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const { type, title, targetValue, unit, currentValue } = req.body;
      const userId = req.user.id;
      
      // Check if this is a weekly goal and if user already has 3 this week
      if (type === "weekly") {
        const weekStart = getCentralTimeWeekStart();
        const hasMaxWeeklyGoals = await storage.hasWeeklyGoalThisWeek(userId, weekStart);
        
        if (hasMaxWeeklyGoals) {
          return res.status(400).json({ 
            error: "You can only create 3 weekly goals per week. Your week resets on Sunday." 
          });
        }
        
        // Create weekly goal with weekStart tracking
        const goal = await storage.createGoal({
          userId,
          type,
          title,
          targetValue,
          currentValue: currentValue || 0,
          unit,
          completed: false,
        }, weekStart);
        
        return res.status(201).json(goal);
      }

      // Check if this is a yearly goal and if user already has one this year
      if (type === "yearly") {
        const yearStart = getCentralTimeYearStart();
        const hasYearlyGoal = await storage.hasYearlyGoalThisYear(userId, yearStart);
        
        if (hasYearlyGoal) {
          return res.status(400).json({ 
            error: "You can only create one yearly goal per year. Your year resets on January 1st." 
          });
        }
        
        // Create yearly goal with yearStart tracking
        const goal = await storage.createGoal({
          userId,
          type,
          title,
          targetValue,
          currentValue: currentValue || 0,
          unit,
          completed: false,
        }, undefined, yearStart);
        
        return res.status(201).json(goal);
      }
      
      // Create lifetime goal
      const goal = await storage.createGoal({
        userId,
        type,
        title,
        targetValue,
        currentValue: currentValue || 0,
        unit,
        completed: false,
      });
      res.status(201).json(goal);
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ error: "Failed to create goal" });
    }
  });

  app.patch("/api/goals/:id/progress", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { currentValue } = req.body;
      const goal = await storage.updateGoalProgress(id, currentValue);
      res.json(goal);
    } catch (error) {
      console.error("Error updating goal progress:", error);
      res.status(500).json({ error: "Failed to update goal progress" });
    }
  });

  app.patch("/api/goals/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      
      // Get goal to check type before completing
      const goalBefore = await storage.getGoal(id);
      if (!goalBefore) {
        return res.status(404).json({ error: "Goal not found" });
      }

      const goal = await storage.completeGoal(id);
      
      // Award XP based on goal type
      let xpAmount: number;
      let xpReason: string;
      
      if (goalBefore.type === "weekly") {
        xpAmount = 100;
        xpReason = "completed a weekly goal!";
      } else if (goalBefore.type === "yearly") {
        xpAmount = 2000;
        xpReason = "completed a yearly goal!";
      } else {
        xpAmount = 5000;
        xpReason = "completed a lifetime goal!";
      }
      
      const result = await awardXP(userId, xpAmount, xpReason);

      res.json({ ...goal, ...result });
    } catch (error) {
      console.error("Error completing goal:", error);
      res.status(500).json({ error: "Failed to complete goal" });
    }
  });

  app.delete("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGoal(id);
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // Calorie tracking endpoint
  app.post("/api/calories", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = getTodayDate();

      // Check if user already logged calories today
      if (user.lastCalorieLogDate === today) {
        return res.status(400).json({ message: "You can only log calories once per day" });
      }

      // Update user's last calorie log date
      await storage.updateUserCalorieLogDate(userId, today);

      // Award 15 XP for logging calories
      const result = await awardXP(userId, 15, "logged daily calories");

      res.json({ 
        success: true, 
        ...result 
      });
    } catch (error) {
      console.error("Error logging calories:", error);
      res.status(500).json({ message: "Failed to log calories" });
    }
  });

  // Today's MVL (Most Valuable Lifter) Leaderboard endpoint
  app.get("/api/leaderboards/mvl", async (req, res) => {
    try {
      const leaderboard = await storage.getTodayMVLLeaderboard(10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching MVL leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch MVL leaderboard" });
    }
  });

  // Admin endpoint to award MVL to yesterday's top earner
  app.post("/api/admin/award-mvl", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.id);
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // Get current top earner
      const leaderboard = await storage.getTodayMVLLeaderboard(1);
      if (!leaderboard || leaderboard.length === 0 || leaderboard[0].dailyXp === 0) {
        return res.status(400).json({ message: "No eligible MVL winner today" });
      }

      const winner = leaderboard[0];
      
      // Award MVL win
      await storage.awardMVLWin(winner.id);
      
      // Create activity for the win
      await storage.createActivity({
        userId: winner.id,
        type: "achievement",
        detail: "🏆 Awarded Most Valuable Lifter (MVL) badge!",
        xpAwarded: 0,
      });

      // Reset everyone's daily XP for tomorrow
      const today = getTodayDate();
      await storage.resetAllDailyXP(today);

      res.json({ 
        success: true, 
        winner: {
          username: winner.username,
          displayName: winner.displayName,
          dailyXp: winner.dailyXp,
          mvlWins: winner.mvlWins + 1
        }
      });
    } catch (error) {
      console.error("Error awarding MVL:", error);
      res.status(500).json({ message: "Failed to award MVL" });
    }
  });

  // PR Leaderboards endpoint
  app.get("/api/leaderboards/prs", async (req, res) => {
    try {
      const leaderboards = await storage.getPRLeaderboards();
      res.json(leaderboards);
    } catch (error) {
      console.error("Error fetching PR leaderboards:", error);
      res.status(500).json({ message: "Failed to fetch PR leaderboards" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
