import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { calculateLevelAndTitle } from "./utils/xpSystem";
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

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
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
    const selected = refreshedChallenges.sort(() => Math.random() - 0.5).slice(0, 4);

    for (const challenge of selected) {
      await storage.createUserDailyChallenge({
        userId,
        date,
        challengeId: challenge.id,
        completed: false,
      });
    }
  } else {
    const selected = allChallenges.sort(() => Math.random() - 0.5).slice(0, 4);

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

  // Check-in
  app.post("/api/checkin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const today = getTodayDate();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

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
      let xpAwarded = 0;

      if (user.lastPrUpdateDate !== today) {
        await storage.updateUserPRDate(userId, today);
        const result = await awardXP(userId, 10, "updated their PRs");
        xpAwarded = 10;
      }

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
      let xpAwarded = 0;

      if (user.lastWeighinDate !== today) {
        const result = await awardXP(userId, 15, "recorded their weight");
        xpAwarded = 15;
      }

      await storage.updateUserWeight(userId, parseFloat(weight), today);

      res.json({ success: true, weight: parseFloat(weight), xpAwarded });
    } catch (error) {
      console.error("Error recording weight:", error);
      res.status(500).json({ message: "Failed to record weight" });
    }
  });

  // Upload progress photo
  app.post("/api/photos", isAuthenticated, upload.single("photo"), async (req: any, res) => {
    try {
      const userId = req.user.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Save to static uploads directory
      const uploadsDir = "static/uploads";
      const filename = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
      const filepath = path.join(uploadsDir, filename);

      await mkdir(uploadsDir, { recursive: true });
      await writeFile(filepath, file.buffer);

      await storage.createProgressPhoto({
        userId,
        imagePath: `/uploads/${filename}`,
      });

      const result = await awardXP(userId, 15, "uploaded a progress photo");

      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Error uploading photo:", error);
      res.status(500).json({ message: "Failed to upload photo" });
    }
  });

  // Get user profile
  app.get("/api/profile/:username", async (req, res) => {
    try {
      const { username } = req.params;
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

  app.post("/api/admin/goal/reset", isAuthenticated, async (req: any, res) => {
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
      console.error("Error resetting goal:", error);
      res.status(500).json({ message: "Failed to reset goal" });
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
      const goal = await storage.createGoal({
        userId: req.user.id,
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
      const xpAmount = goalBefore.type === "weekly" ? 100 : 1000;
      const xpReason = goalBefore.type === "weekly" 
        ? "completed a weekly goal!" 
        : "completed a lifetime goal!";
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

  const httpServer = createServer(app);
  return httpServer;
}
