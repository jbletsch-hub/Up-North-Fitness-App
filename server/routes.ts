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

// Get Monday of current week in Central Time
export function getWeekBounds(): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  
  // Get day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = centralTime.getDay();
  
  // Calculate days to subtract to get to Monday
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  // Create new date for Monday
  const monday = new Date(centralTime);
  monday.setDate(centralTime.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  
  // Create new date for Sunday (end of week)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  // Format as YYYY-MM-DD
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return {
    weekStart: formatDate(monday),
    weekEnd: formatDate(sunday)
  };
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

async function awardXP(userId: string, amount: number, reason: string, countTowardMVL = true) {
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
  // Only count daily activities, NOT goal completions
  if (countTowardMVL) {
    const today = getTodayDate();
    let newDailyXP = user.dailyXp + amount;
    
    // Reset daily XP if it's a new day
    if (user.lastDailyXpReset !== today) {
      newDailyXP = amount;
    }
    
    await storage.updateUserDailyXP(userId, newDailyXP, today);
  }

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

// Get the start of the current week (Monday at midnight CT) in YYYY-MM-DD format
function getChallengeWeekStart(): string {
  const now = new Date();
  const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  
  // Get the day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = centralTime.getDay();
  
  // Calculate days since Monday (Sunday is 0, so we need to handle it specially)
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  // Get the Monday of this week
  const monday = new Date(centralTime);
  monday.setDate(centralTime.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);
  
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, '0');
  const day = String(monday.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
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

  // Update character type endpoint
  app.post("/api/profile/character-type", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { characterType } = req.body;

      const validTypes = ["classic", "bulky", "athletic", "powerlifter"];
      if (!characterType || !validTypes.includes(characterType)) {
        return res.status(400).json({ message: "Invalid character type" });
      }

      const user = await storage.updateUserAvatar(userId, { characterType });
      res.json({ success: true, user });
    } catch (error) {
      console.error("Error updating character type:", error);
      res.status(500).json({ message: "Failed to update character type" });
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

      // Check if user has already uploaded a photo today
      const userPhotos = await storage.getPhotosByUser(userId);
      const hasUploadedToday = userPhotos.some(photo => photo.uploadDate === today);

      res.json({
        user,
        challenges,
        pr,
        goal,
        total,
        hasUploadedToday,
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard" });
    }
  });

  // Quick stats for dashboard widget
  app.get("/api/dashboard/quick-stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get today's XP
      const todayXP = user.dailyXp || 0;

      // Get current streak
      const currentStreak = user.streakCount || 0;

      // Get today's challenges
      const today = getTodayDate();
      const challenges = await storage.getUserDailyChallenges(userId, today);
      const completedChallenges = challenges.filter(c => c.completed).length;
      const totalChallenges = challenges.length;

      // Get monthly check-ins (check-ins in current month)
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const activities = await storage.getActivitiesByUser(userId, 1000);
      const checkIns = activities.filter((a: any) => 
        a.type === "checkin" && new Date(a.createdAt) >= monthStart
      );
      const monthlyCheckIns = checkIns.length;

      // Get weekly PRs (PR updates in current week, starting Monday)
      const weekStart = getCentralTimeWeekStart();
      const prHistory = await storage.getPRHistory(userId);
      const weeklyPRs = prHistory.filter((pr: any) => {
        const prDate = new Date(pr.createdAt).toISOString().split('T')[0];
        return prDate >= weekStart;
      }).length;

      // Get MVL wins
      const mvlWins = user.mvlWins || 0;

      res.json({
        todayXP,
        currentStreak,
        completedChallenges,
        totalChallenges,
        monthlyCheckIns,
        weeklyPRs,
        mvlWins,
      });
    } catch (error) {
      console.error("Error fetching quick stats:", error);
      res.status(500).json({ message: "Failed to fetch quick stats" });
    }
  });

  // Complete challenge
  app.post("/api/challenges/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const challengeId = req.params.id;

      // Get the challenge to find its XP value
      const today = getTodayDate();
      const challenges = await storage.getUserDailyChallenges(userId, today);
      const challenge = challenges.find((c) => c.id === challengeId);
      
      if (!challenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }

      // Check weekly challenge limit (2 per week, resets Monday midnight CT)
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const currentWeekStart = getChallengeWeekStart();
      let challengesThisWeek = user.challengesCompletedThisWeek || 0;

      // If it's a new week, reset the counter
      if (user.lastChallengeWeekStart !== currentWeekStart) {
        challengesThisWeek = 0;
      }

      // Check if user has already completed 2 challenges this week
      if (challengesThisWeek >= 2) {
        return res.status(400).json({ 
          message: "You can only complete 2 challenges per week. Week resets Monday at midnight CT." 
        });
      }

      const xpValue = challenge.xpValue || 20; // Default to 20 if not set

      await storage.completeChallenge(challengeId);
      const result = await awardXP(userId, xpValue, "completed a daily challenge");

      // Update weekly challenge tracking
      await storage.updateWeeklyChallengeTracking(userId, challengesThisWeek + 1, currentWeekStart);

      // Log activity
      await storage.createActivity({
        userId,
        type: "challenge",
        detail: `completed a challenge: "${challenge.text}"`,
        xpAwarded: xpValue,
      });

      // Check if all daily challenges are completed
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

      // Log activity
      await storage.createActivity({
        userId,
        type: "checkin",
        detail: `checked in (${newStreak} day streak!)`,
        xpAwarded: 15,
      });

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

      // Get old PR values to check if numbers increased
      const oldPR = await storage.getPR(userId);
      const newSquat = parseInt(squat) || 0;
      const newBench = parseInt(bench) || 0;
      const newDeadlift = parseInt(deadlift) || 0;
      
      // Only award XP if at least one lift increased
      let xpAwarded = 0;
      let result;
      if (oldPR) {
        const squatIncreased = newSquat > oldPR.squat;
        const benchIncreased = newBench > oldPR.bench;
        const deadliftIncreased = newDeadlift > oldPR.deadlift;
        
        if (squatIncreased || benchIncreased || deadliftIncreased) {
          result = await awardXP(userId, 10, "improved their PRs!");
          xpAwarded = 10;
        }
      } else {
        // First time setting PRs - always award XP
        result = await awardXP(userId, 10, "set their first PRs!");
        xpAwarded = 10;
      }

      await storage.updateUserPRDate(userId, today);

      const pr = await storage.upsertPR(userId, {
        squat: newSquat,
        bench: newBench,
        deadlift: newDeadlift,
      });

      // Save PR to history for progression tracking
      await storage.createPRHistory(userId, {
        squat: newSquat,
        bench: newBench,
        deadlift: newDeadlift,
      });

      // Log activity if XP was awarded (meaning PRs improved)
      if (xpAwarded > 0) {
        const total = newSquat + newBench + newDeadlift;
        await storage.createActivity({
          userId,
          type: "pr",
          detail: `hit a new PR! Total: ${total}lbs (${newSquat}/${newBench}/${newDeadlift})`,
          xpAwarded,
        });
      }

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

      const newWeight = parseFloat(weight);
      const currentWeight = user.weight || 0;
      
      // Only award XP if weight has changed
      let xpAwarded = 0;
      if (newWeight !== currentWeight) {
        await awardXP(userId, 15, "recorded their weight");
        xpAwarded = 15;

        // Log activity
        await storage.createActivity({
          userId,
          type: "weighin",
          detail: `weighed in at ${newWeight}lbs`,
          xpAwarded: 15,
        });
      }

      await storage.updateUserWeight(userId, newWeight, today);

      res.json({ success: true, weight: newWeight, xpAwarded });
    } catch (error) {
      console.error("Error recording weight:", error);
      res.status(500).json({ message: "Failed to record weight" });
    }
  });

  // Edit weigh-in (no XP awarded)
  app.patch("/api/weighin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { weight } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = getTodayDate();
      
      // Only allow editing if already weighed in today
      if (user.lastWeighinDate !== today) {
        return res.status(400).json({ message: "You haven't weighed in today yet" });
      }

      // Update weight without awarding XP
      await storage.updateUserWeight(userId, parseFloat(weight), today);

      res.json({ success: true, weight: parseFloat(weight), xpAwarded: 0 });
    } catch (error) {
      console.error("Error updating weight:", error);
      res.status(500).json({ message: "Failed to update weight" });
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

      // Check if user has already uploaded a photo today (using Central Time date)
      const today = getTodayDate();
      const userPhotos = await storage.getPhotosByUser(userId);
      const todayPhoto = userPhotos.find(photo => photo.uploadDate === today);

      if (todayPhoto) {
        console.log("[PHOTO UPLOAD] User already uploaded today:", today);
        return res.status(400).json({ message: "You can only upload one progress photo per day" });
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

      // Save to database with uploadDate in Central Time
      await storage.createProgressPhoto({
        userId,
        imagePath: objectPath,
        uploadDate: today, // Store the Central Time date
      });

      const result = await awardXP(userId, 15, "uploaded a progress photo");

      // Log activity
      await storage.createActivity({
        userId,
        type: "photo",
        detail: "uploaded a progress photo",
        xpAwarded: 15,
      });

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

  app.post("/api/admin/users/:id/toggle-admin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { isAdmin } = req.body;
      const updatedUser = await storage.toggleUserAdmin(req.params.id, isAdmin);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error toggling admin status:", error);
      res.status(500).json({ message: "Failed to toggle admin status" });
    }
  });

  app.post("/api/admin/users/:id/update-streak", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { streakCount } = req.body;
      
      if (typeof streakCount !== 'number' || streakCount < 0) {
        return res.status(400).json({ message: "Streak count must be a non-negative number" });
      }

      const today = getTodayDate();
      const updatedUser = await storage.updateUserStreak(req.params.id, streakCount, today);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating user streak:", error);
      res.status(500).json({ message: "Failed to update user streak" });
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

      const { text, xpValue } = req.body;
      const challenge = await storage.createChallenge({ text, xpValue: xpValue || 20 });
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

  app.patch("/api/admin/challenges/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);

      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { xpValue } = req.body;
      const updatedChallenge = await storage.updateChallengeXP(req.params.id, xpValue);
      res.json(updatedChallenge);
    } catch (error) {
      console.error("Error updating challenge XP:", error);
      res.status(500).json({ message: "Failed to update challenge XP" });
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

  // Crew Challenge Admin endpoints
  app.get("/api/admin/crew-challenges", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const challenges = await storage.getAllCrewChallenges();
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching crew challenges:", error);
      res.status(500).json({ message: "Failed to fetch crew challenges" });
    }
  });

  app.post("/api/admin/crew-challenges", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { text, description, targetValue, unit } = req.body;
      const challenge = await storage.createCrewChallenge({
        text,
        description,
        targetValue: parseInt(targetValue),
        unit,
      });
      res.status(201).json(challenge);
    } catch (error) {
      console.error("Error creating crew challenge:", error);
      res.status(500).json({ message: "Failed to create crew challenge" });
    }
  });

  app.patch("/api/admin/crew-challenges/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { text, description, targetValue, unit } = req.body;
      const updateData: any = {};
      if (text !== undefined) updateData.text = text;
      if (description !== undefined) updateData.description = description;
      if (targetValue !== undefined) updateData.targetValue = parseInt(targetValue);
      if (unit !== undefined) updateData.unit = unit;

      const challenge = await storage.updateCrewChallenge(req.params.id, updateData);
      res.json(challenge);
    } catch (error) {
      console.error("Error updating crew challenge:", error);
      res.status(500).json({ message: "Failed to update crew challenge" });
    }
  });

  app.delete("/api/admin/crew-challenges/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await storage.deleteCrewChallenge(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting crew challenge:", error);
      res.status(500).json({ message: "Failed to delete crew challenge" });
    }
  });

  // Crew Challenge user endpoints
  app.get("/api/crew-challenge/current", isAuthenticated, async (req: any, res) => {
    try {
      const activeChallenge = await storage.getActiveCrewChallenge();
      
      if (!activeChallenge || !activeChallenge.challenge) {
        return res.json({ active: false, challenge: null });
      }
      
      res.json({
        active: true,
        ...activeChallenge,
      });
    } catch (error) {
      console.error("Error fetching active crew challenge:", error);
      res.status(500).json({ message: "Failed to fetch active crew challenge" });
    }
  });

  app.post("/api/crew-challenge/progress", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { contribution } = req.body;
      
      if (!contribution || contribution <= 0) {
        return res.status(400).json({ message: "Invalid contribution value" });
      }
      
      const activeChallenge = await storage.getActiveCrewChallenge();
      
      if (!activeChallenge) {
        return res.status(404).json({ message: "No active crew challenge" });
      }
      
      // Update user's contribution
      const userProgress = await storage.updateUserCrewProgress(
        userId,
        activeChallenge.weekStart,
        contribution
      );
      
      // Calculate total crew progress by summing all user contributions
      const leaderboard = await storage.getCrewLeaderboard(activeChallenge.weekStart, 1000);
      const totalProgress = leaderboard.reduce((sum, user) => sum + user.contribution, 0);
      
      // Update crew challenge progress
      await storage.updateCrewChallengeProgress(activeChallenge.weekStart, totalProgress);
      
      res.json({
        success: true,
        userContribution: userProgress.contribution,
        totalProgress,
      });
    } catch (error) {
      console.error("Error updating crew challenge progress:", error);
      res.status(500).json({ message: "Failed to update crew challenge progress" });
    }
  });

  app.get("/api/crew-challenge/leaderboard", isAuthenticated, async (req: any, res) => {
    try {
      const activeChallenge = await storage.getActiveCrewChallenge();
      
      if (!activeChallenge) {
        return res.json([]);
      }
      
      const leaderboard = await storage.getCrewLeaderboard(activeChallenge.weekStart, 10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching crew challenge leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch crew challenge leaderboard" });
    }
  });

  // Goals endpoints
  app.get("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const { type } = req.query;
      
      // If type is specified, return just those goals
      if (type) {
        const goals = await storage.getUserGoals(req.user.id, type);
        res.json(goals);
        return;
      }
      
      // Otherwise, return all goals grouped by type
      const allGoals = await storage.getUserGoals(req.user.id);
      const groupedGoals = {
        weekly: allGoals.filter((g: any) => g.type === "weekly"),
        yearly: allGoals.filter((g: any) => g.type === "yearly"),
        lifetime: allGoals.filter((g: any) => g.type === "lifetime"),
      };
      
      res.json(groupedGoals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const { type, title, targetValue, unit, currentValue } = req.body;
      const userId = req.user.id;
      
      // Check if this is a weekly goal and if user already has 2 this week
      if (type === "weekly") {
        const weekStart = getCentralTimeWeekStart();
        const hasMaxWeeklyGoals = await storage.hasWeeklyGoalThisWeek(userId, weekStart);
        
        if (hasMaxWeeklyGoals) {
          return res.status(400).json({ 
            error: "You can only create 2 weekly goals per week. Your week resets on Sunday." 
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
      
      // Check if this is a lifetime goal and if user already has 2 active lifetime goals
      if (type === "lifetime") {
        const activeLifetimeGoals = await storage.getUserGoals(userId, "lifetime");
        const activeCount = activeLifetimeGoals.filter(g => !g.completed).length;
        
        if (activeCount >= 2) {
          return res.status(400).json({ 
            error: "You can only have 2 active lifetime goals at a time. Complete or delete an existing one first." 
          });
        }
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
      
      // Award XP based on goal type (does NOT count toward MVL race)
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
      
      // Don't count goal XP toward daily MVL race
      const result = await awardXP(userId, xpAmount, xpReason, false);

      // Log activity
      await storage.createActivity({
        userId,
        type: "goal",
        detail: `completed a ${goalBefore.type} goal: "${goalBefore.title}"`,
        xpAwarded: xpAmount,
      });

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
      const { calories } = req.body;
      
      if (!calories || calories <= 0) {
        return res.status(400).json({ message: "Please provide a valid calorie amount" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = getTodayDate();

      // Check if user already logged calories today
      if (user.lastCalorieLogDate === today) {
        return res.status(400).json({ message: "You can only log calories once per day" });
      }

      // Update user's last calorie log date and calories amount
      await storage.updateUserCalorieLogDate(userId, today, calories);

      // Award 15 XP for logging calories
      const result = await awardXP(userId, 15, "logged daily calories");

      // Log activity
      await storage.createActivity({
        userId,
        type: "calories",
        detail: `logged ${calories} calories`,
        xpAwarded: 15,
      });

      res.json({ 
        success: true, 
        calories,
        ...result 
      });
    } catch (error) {
      console.error("Error logging calories:", error);
      res.status(500).json({ message: "Failed to log calories" });
    }
  });

  // Activity Feed endpoint - get recent activities from all users
  app.get("/api/activity-feed", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });

  // Stats endpoint - get user stats and analytics data
  // Supports viewing any user's stats by adding optional userId parameter
  app.get("/api/stats/:userId?", isAuthenticated, async (req: any, res) => {
    try {
      // If userId is provided in URL, use it; otherwise use current user's ID
      const targetUserId = req.params.userId || req.user.id;
      
      const user = await storage.getUser(targetUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const activities = await storage.getActivitiesByUser(targetUserId, 100);
      
      // Get all user goals and count completed ones
      const allGoals = await storage.getUserGoals(targetUserId);
      const completedGoalsCount = allGoals.filter((g: any) => g.completed).length;
      
      // Group active goals by type
      const activeGoals = allGoals.filter((g: any) => !g.completed);
      const groupedGoals = {
        weekly: activeGoals.filter((g: any) => g.type === "weekly"),
        yearly: activeGoals.filter((g: any) => g.type === "yearly"),
        lifetime: activeGoals.filter((g: any) => g.type === "lifetime"),
      };
      
      // Get PR progression history
      const prProgressionData = await storage.getPRHistory(targetUserId, 30);
      
      // Format PR history for chart
      const prProgression = prProgressionData
        .reverse() // Oldest first for chart
        .map((pr) => ({
          date: new Date(pr.createdAt).toISOString().split('T')[0],
          squat: pr.squat,
          bench: pr.bench,
          deadlift: pr.deadlift,
          total: pr.squat + pr.bench + pr.deadlift,
        }));
      
      // Aggregate XP by date
      const xpByDate: Record<string, number> = {};
      activities.forEach((activity: any) => {
        const date = new Date(activity.createdAt).toISOString().split('T')[0];
        xpByDate[date] = (xpByDate[date] || 0) + (activity.xpAwarded || 0);
      });
      
      const xpTrend = Object.entries(xpByDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-30)
        .map(([date, xp]) => ({ date, xp }));

      // Extract check-in history for streak calendar (last 90 days)
      const checkinActivities = activities.filter((a: any) => a.type === "checkin");
      const checkinDates = checkinActivities.map((a: any) => {
        const date = new Date(a.createdAt);
        // Convert to YYYY-MM-DD in Central Time
        const centralTime = new Date(date.toLocaleString("en-US", { timeZone: "America/Chicago" }));
        const year = centralTime.getFullYear();
        const month = String(centralTime.getMonth() + 1).padStart(2, '0');
        const day = String(centralTime.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      });
      
      // Remove duplicates and sort
      const uniqueCheckinDates = Array.from(new Set(checkinDates)).sort();

      // Get current PRs
      const currentPR = await storage.getPR(targetUserId);

      res.json({
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        totalActivities: activities.length,
        xpTrend,
        prProgression, // PR history for chart
        currentPR: currentPR || { squat: 0, bench: 0, deadlift: 0 }, // Current PR values
        currentStreak: user?.streakCount || 0,
        totalXP: user?.xp || 0,
        currentLevel: user?.level || 1,
        currentWeight: user?.weight,
        calories: user?.calories,
        mvlWins: user?.mvlWins || 0,
        completedGoals: completedGoalsCount,
        goals: groupedGoals,
        characterType: user?.characterType || "classic",
        shirtColor: user?.shirtColor,
        shortsColor: user?.shortsColor,
        hairStyle: user?.hairStyle,
        hairColor: user?.hairColor,
        headband: user?.headband,
        wristbands: user?.wristbands,
        facialHair: user?.facialHair,
        checkinHistory: uniqueCheckinDates, // Array of YYYY-MM-DD dates
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // PR Comparison endpoint
  app.get("/api/pr-comparison/:userId", isAuthenticated, async (req, res) => {
    try {
      const targetUserId = req.params.userId;
      const userPR = await storage.getPR(targetUserId);
      
      if (!userPR) {
        return res.status(404).json({ message: "PR not found" });
      }

      // Get all PRs for comparison
      const allPRs = await storage.getAllPRs();
      
      if (allPRs.length === 0) {
        return res.json({
          gymAverages: { squat: 0, bench: 0, deadlift: 0 },
          percentiles: { squat: 0, bench: 0, deadlift: 0, total: 0 },
          topLifters: []
        });
      }

      // Calculate gym averages
      const totalSquat = allPRs.reduce((sum, pr) => sum + pr.squat, 0);
      const totalBench = allPRs.reduce((sum, pr) => sum + pr.bench, 0);
      const totalDeadlift = allPRs.reduce((sum, pr) => sum + pr.deadlift, 0);

      const gymAverages = {
        squat: totalSquat / allPRs.length,
        bench: totalBench / allPRs.length,
        deadlift: totalDeadlift / allPRs.length,
      };

      // Calculate percentiles
      const userTotal = userPR.squat + userPR.bench + userPR.deadlift;
      
      const squatPercentile = (allPRs.filter(pr => pr.squat < userPR.squat).length / allPRs.length) * 100;
      const benchPercentile = (allPRs.filter(pr => pr.bench < userPR.bench).length / allPRs.length) * 100;
      const deadliftPercentile = (allPRs.filter(pr => pr.deadlift < userPR.deadlift).length / allPRs.length) * 100;
      const totalPercentile = (allPRs.filter(pr => (pr.squat + pr.bench + pr.deadlift) < userTotal).length / allPRs.length) * 100;

      const percentiles = {
        squat: squatPercentile,
        bench: benchPercentile,
        deadlift: deadliftPercentile,
        total: totalPercentile,
      };

      // Get top lifters
      const allUsers = await storage.getAllUsers();
      const liftersWithTotals = await Promise.all(
        allUsers.map(async (user: any) => {
          const pr = await storage.getPR(user.id);
          return {
            userId: user.id,
            username: user.username,
            total: pr ? pr.squat + pr.bench + pr.deadlift : 0,
          };
        })
      );

      const topLifters = liftersWithTotals
        .filter(l => l.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      res.json({
        gymAverages,
        percentiles,
        topLifters,
      });
    } catch (error) {
      console.error("Error fetching PR comparison:", error);
      res.status(500).json({ message: "Failed to fetch PR comparison" });
    }
  });

  // Top Lifts endpoint - Get top 3 users for each lift
  app.get("/api/top-lifts", isAuthenticated, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      // Get all PRs with user info
      const usersWithPRs = await Promise.all(
        allUsers.map(async (user: any) => {
          const pr = await storage.getPR(user.id);
          return {
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
            squat: pr?.squat || 0,
            bench: pr?.bench || 0,
            deadlift: pr?.deadlift || 0,
          };
        })
      );

      // Get top 3 for each lift type
      const topSquat = usersWithPRs
        .filter(u => u.squat > 0)
        .sort((a, b) => b.squat - a.squat)
        .slice(0, 3)
        .map(u => ({ userId: u.userId, username: u.username, displayName: u.displayName, value: u.squat }));

      const topBench = usersWithPRs
        .filter(u => u.bench > 0)
        .sort((a, b) => b.bench - a.bench)
        .slice(0, 3)
        .map(u => ({ userId: u.userId, username: u.username, displayName: u.displayName, value: u.bench }));

      const topDeadlift = usersWithPRs
        .filter(u => u.deadlift > 0)
        .sort((a, b) => b.deadlift - a.deadlift)
        .slice(0, 3)
        .map(u => ({ userId: u.userId, username: u.username, displayName: u.displayName, value: u.deadlift }));

      res.json({
        squat: topSquat,
        bench: topBench,
        deadlift: topDeadlift,
      });
    } catch (error) {
      console.error("Error fetching top lifts:", error);
      res.status(500).json({ message: "Failed to fetch top lifts" });
    }
  });

  // Get all users (public endpoint for browsing)
  app.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      // Return only basic public info
      const publicUsers = allUsers.map((u: any) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        level: u.level,
        xp: u.xp,
        title: u.title,
        mvlWins: u.mvlWins || 0,
        characterType: u.characterType || "classic",
        shirtColor: u.shirtColor,
        shortsColor: u.shortsColor,
        hairStyle: u.hairStyle,
        hairColor: u.hairColor,
        headband: u.headband,
        wristbands: u.wristbands,
        facialHair: u.facialHair,
      }));
      
      res.json(publicUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
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

  // Crew-specific MVL leaderboard endpoint
  app.get("/api/leaderboards/crew-mvl/:crewId", async (req, res) => {
    try {
      const { crewId } = req.params;
      const leaderboard = await storage.getCrewMVLLeaderboard(crewId, 10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching crew MVL leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch crew MVL leaderboard" });
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

  // Avatar customization endpoint
  app.put("/api/avatar", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { characterType, shirtColor, shortsColor, headband, wristbands, hairStyle, hairColor, facialHair } = req.body;
      
      await storage.updateUserAvatar(userId, {
        characterType,
        shirtColor,
        shortsColor,
        headband,
        wristbands,
        hairStyle,
        hairColor,
        facialHair,
      });
      
      const updatedUser = await storage.getUser(userId);
      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error("Error updating avatar:", error);
      res.status(500).json({ message: "Failed to update avatar" });
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

  // ============ CREW MANAGEMENT ROUTES ============
  
  // Get all crews
  app.get("/api/crews", isAuthenticated, async (req, res) => {
    try {
      const crews = await storage.getAllCrews();
      res.json(crews);
    } catch (error) {
      console.error("Error fetching crews:", error);
      res.status(500).json({ message: "Failed to fetch crews" });
    }
  });

  // Get user's crew
  app.get("/api/crews/my-crew", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userCrew = await storage.getUserCrew(userId);
      res.json(userCrew);
    } catch (error) {
      console.error("Error fetching user crew:", error);
      res.status(500).json({ message: "Failed to fetch user crew" });
    }
  });

  // Get crew by ID
  app.get("/api/crews/:id", isAuthenticated, async (req, res) => {
    try {
      const crew = await storage.getCrew(req.params.id);
      if (!crew) {
        return res.status(404).json({ message: "Crew not found" });
      }
      res.json(crew);
    } catch (error) {
      console.error("Error fetching crew:", error);
      res.status(500).json({ message: "Failed to fetch crew" });
    }
  });

  // Create a new crew
  app.post("/api/crews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { name, description, color } = req.body;

      // Check if user is already in a crew
      const existingCrew = await storage.getUserCrew(userId);
      if (existingCrew) {
        return res.status(400).json({ message: "You're already in a crew. Leave your current crew first." });
      }

      // Check if crew name is taken
      const existingCrewByName = await storage.getCrewByName(name);
      if (existingCrewByName) {
        return res.status(400).json({ message: "A crew with this name already exists." });
      }

      // Create the crew
      const crew = await storage.createCrew({ name, description, color });

      // Add creator as leader
      await storage.addCrewMember({
        crewId: crew.id,
        userId,
        role: "leader",
      });

      res.status(201).json(crew);
    } catch (error) {
      console.error("Error creating crew:", error);
      res.status(500).json({ message: "Failed to create crew" });
    }
  });

  // Update crew
  app.patch("/api/crews/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const crewId = req.params.id;
      const { name, description, color } = req.body;

      // Check if user is a leader of this crew
      const userCrew = await storage.getUserCrew(userId);
      if (!userCrew || userCrew.crewId !== crewId || userCrew.role !== "leader") {
        return res.status(403).json({ message: "Only crew leaders can update crew details" });
      }

      const updated = await storage.updateCrew(crewId, { name, description, color });
      res.json(updated);
    } catch (error) {
      console.error("Error updating crew:", error);
      res.status(500).json({ message: "Failed to update crew" });
    }
  });

  // Get crew members
  app.get("/api/crews/:id/members", isAuthenticated, async (req, res) => {
    try {
      const members = await storage.getCrewMembers(req.params.id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching crew members:", error);
      res.status(500).json({ message: "Failed to fetch crew members" });
    }
  });

  // Leave crew
  app.post("/api/crews/leave", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const userCrew = await storage.getUserCrew(userId);
      
      if (!userCrew) {
        return res.status(400).json({ message: "You're not in a crew" });
      }

      // Check if user is the only leader
      const members = await storage.getCrewMembers(userCrew.crewId);
      const leaders = members.filter(m => m.role === "leader");
      
      if (leaders.length === 1 && leaders[0].userId === userId && members.length > 1) {
        return res.status(400).json({ 
          message: "You're the only leader. Transfer leadership or promote another member before leaving." 
        });
      }

      await storage.removeCrewMember(userCrew.crewId, userId);
      
      // Delete crew if it's empty
      const remainingMembers = await storage.getCrewMembers(userCrew.crewId);
      if (remainingMembers.length === 0) {
        await storage.deleteCrew(userCrew.crewId);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving crew:", error);
      res.status(500).json({ message: "Failed to leave crew" });
    }
  });

  // Invite user to crew
  app.post("/api/crews/:id/invite", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const crewId = req.params.id;
      const { targetUserId } = req.body;

      // Check if user is a leader of this crew
      const userCrew = await storage.getUserCrew(userId);
      if (!userCrew || userCrew.crewId !== crewId || userCrew.role !== "leader") {
        return res.status(403).json({ message: "Only crew leaders can send invites" });
      }

      // Check if target user is already in a crew
      const targetCrew = await storage.getUserCrew(targetUserId);
      if (targetCrew) {
        return res.status(400).json({ message: "This user is already in a crew" });
      }

      // Create invite
      const invite = await storage.createCrewInvite({
        crewId,
        userId: targetUserId,
        invitedBy: userId,
        status: "pending",
      });

      res.status(201).json(invite);
    } catch (error) {
      console.error("Error sending crew invite:", error);
      res.status(500).json({ message: "Failed to send crew invite" });
    }
  });

  // Get user's pending invites
  app.get("/api/crews/invites/my-invites", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const invites = await storage.getUserInvites(userId);
      res.json(invites);
    } catch (error) {
      console.error("Error fetching invites:", error);
      res.status(500).json({ message: "Failed to fetch invites" });
    }
  });

  // Accept/Decline crew invite
  app.post("/api/crews/invites/:id/:action", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const inviteId = req.params.id;
      const action = req.params.action; // "accept" or "decline"

      if (action !== "accept" && action !== "declined") {
        return res.status(400).json({ message: "Invalid action" });
      }

      const invites = await storage.getUserInvites(userId);
      const invite = invites.find(i => i.id === inviteId);

      if (!invite) {
        return res.status(404).json({ message: "Invite not found" });
      }

      if (action === "accept") {
        // Check if user is already in a crew
        const existingCrew = await storage.getUserCrew(userId);
        if (existingCrew) {
          return res.status(400).json({ message: "You're already in a crew" });
        }

        // Add user to crew
        await storage.addCrewMember({
          crewId: invite.crewId,
          userId,
          role: "member",
        });

        await storage.updateInviteStatus(inviteId, "accepted");
      } else {
        await storage.updateInviteStatus(inviteId, "declined");
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error responding to invite:", error);
      res.status(500).json({ message: "Failed to respond to invite" });
    }
  });

  // Promote/demote crew member
  app.post("/api/crews/:id/members/:userId/role", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.id;
      const crewId = req.params.id;
      const targetUserId = req.params.userId;
      const { role } = req.body;

      // Check if current user is a leader
      const userCrew = await storage.getUserCrew(currentUserId);
      if (!userCrew || userCrew.crewId !== crewId || userCrew.role !== "leader") {
        return res.status(403).json({ message: "Only crew leaders can change member roles" });
      }

      await storage.updateMemberRole(crewId, targetUserId, role);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating member role:", error);
      res.status(500).json({ message: "Failed to update member role" });
    }
  });

  // Remove crew member
  app.delete("/api/crews/:id/members/:userId", isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.id;
      const crewId = req.params.id;
      const targetUserId = req.params.userId;

      // Check if current user is a leader
      const userCrew = await storage.getUserCrew(currentUserId);
      if (!userCrew || userCrew.crewId !== crewId || userCrew.role !== "leader") {
        return res.status(403).json({ message: "Only crew leaders can remove members" });
      }

      // Can't remove yourself this way
      if (targetUserId === currentUserId) {
        return res.status(400).json({ message: "Use the leave endpoint to remove yourself" });
      }

      await storage.removeCrewMember(crewId, targetUserId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing crew member:", error);
      res.status(500).json({ message: "Failed to remove crew member" });
    }
  });

  // Crew Competitions Endpoints
  app.get("/api/crew-competitions/check-ins", isAuthenticated, async (req, res) => {
    try {
      const standings = await storage.getWeeklyCheckInBattle();
      res.json(standings);
    } catch (error) {
      console.error("Error fetching check-in battle:", error);
      res.status(500).json({ message: "Failed to fetch check-in battle" });
    }
  });

  app.get("/api/crew-competitions/xp", isAuthenticated, async (req, res) => {
    try {
      const standings = await storage.getMonthlyXPWar();
      res.json(standings);
    } catch (error) {
      console.error("Error fetching XP war:", error);
      res.status(500).json({ message: "Failed to fetch XP war" });
    }
  });

  app.get("/api/crew-competitions/challenges", isAuthenticated, async (req, res) => {
    try {
      const standings = await storage.getChallengeCompletionRates();
      res.json(standings);
    } catch (error) {
      console.error("Error fetching challenge completion:", error);
      res.status(500).json({ message: "Failed to fetch challenge completion" });
    }
  });

  app.get("/api/crew-competitions/lifts", isAuthenticated, async (req, res) => {
    try {
      const standings = await storage.getTotalLiftShowdown();
      res.json(standings);
    } catch (error) {
      console.error("Error fetching lift showdown:", error);
      res.status(500).json({ message: "Failed to fetch lift showdown" });
    }
  });

  // Weekly MVM Endpoints
  app.get("/api/mvm/leaderboard", isAuthenticated, async (req, res) => {
    try {
      const leaderboard = await storage.getWeeklyMVMLeaderboard(10);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching MVM leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch MVM leaderboard" });
    }
  });

  app.get("/api/mvm/winners", isAuthenticated, async (req, res) => {
    try {
      const winners = await storage.getWeeklyMVMWinners(10);
      res.json(winners);
    } catch (error) {
      console.error("Error fetching MVM winners:", error);
      res.status(500).json({ message: "Failed to fetch MVM winners" });
    }
  });

  app.post("/api/admin/award-mvm", isAuthenticated, async (req: any, res) => {
    try {
      const adminUser = await storage.getUser(req.user.id);
      if (!adminUser?.isAdmin) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const { weekStart } = getWeekBounds();
      
      // Check if MVM already awarded for this week
      const existingWinner = await storage.getWeeklyMVMWinnerForWeek(weekStart);
      if (existingWinner) {
        return res.status(400).json({ message: "MVM already awarded for this week" });
      }

      // Get top weekly earner
      const leaderboard = await storage.getWeeklyMVMLeaderboard(1);
      if (!leaderboard || leaderboard.length === 0 || leaderboard[0].weeklyXP === 0) {
        return res.status(400).json({ message: "No eligible MVM winner this week" });
      }

      const winner = leaderboard[0];
      
      // Award MVM
      await storage.awardWeeklyMVM(winner.id, weekStart, winner.weeklyXP);
      
      // Create activity for the win
      await storage.createActivity({
        userId: winner.id,
        type: "achievement",
        detail: "🏆 Awarded Most Valuable Member (MVM) badge for the week!",
        xpAwarded: 0,
      });

      res.json({ 
        success: true, 
        winner: {
          username: winner.username,
          displayName: winner.displayName,
          weeklyXP: winner.weeklyXP,
        }
      });
    } catch (error) {
      console.error("Error awarding MVM:", error);
      res.status(500).json({ message: "Failed to award MVM" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
