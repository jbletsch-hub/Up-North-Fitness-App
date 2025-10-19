import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { calculateLevelAndTitle } from "./utils/xpSystem";
import multer from "multer";
import path from "path";
import { writeFile, mkdir } from "fs/promises";

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

  const newXP = user.xp + amount;
  const { level, title } = calculateLevelAndTitle(newXP);

  await storage.updateUserXP(userId, newXP, level, title);
  await storage.createActivity({
    userId,
    type: "xp",
    detail: reason,
    xpAwarded: amount,
  });

  return { xp: newXP, level, title };
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
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || (req.user.isAdmin ? "admin" : null);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      let user = await storage.getUser(userId);
      
      // If user doesn't exist in database yet, fetch the claims from session and create the user
      if (!user && req.user.claims) {
        const claims = req.user.claims;
        const email = claims.email;
        let username = email?.split("@")[0] || claims.first_name || `user${userId}`;
        
        // Check if username exists and make it unique
        const existingUser = await storage.getUserByUsername(username);
        if (existingUser && existingUser.id !== userId) {
          username = `${username}${userId.slice(-4)}`;
        }
        
        user = await storage.upsertUser({
          id: userId,
          email,
          firstName: claims.first_name,
          lastName: claims.last_name,
          profileImageUrl: claims.profile_image_url,
          username,
        });
      }
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
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
      const userId = req.user.claims?.sub || "admin";
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
      const userId = req.user.claims?.sub || "admin";
      const challengeId = req.params.id;

      await storage.completeChallenge(challengeId);
      const result = await awardXP(userId, 15, "completed a daily challenge");

      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Error completing challenge:", error);
      res.status(500).json({ message: "Failed to complete challenge" });
    }
  });

  // Check-in
  app.post("/api/checkin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || "admin";
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
      const userId = req.user.claims?.sub || "admin";
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

      res.json({ success: true, pr, xpAwarded });
    } catch (error) {
      console.error("Error updating PRs:", error);
      res.status(500).json({ message: "Failed to update PRs" });
    }
  });

  // Weigh-in
  app.post("/api/weighin", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || "admin";
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
      const userId = req.user.claims?.sub || "admin";
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Save to private object storage directory
      const privateDir = process.env.PRIVATE_OBJECT_DIR || ".private";
      const filename = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
      const filepath = path.join(privateDir, filename);

      await mkdir(privateDir, { recursive: true });
      await writeFile(filepath, file.buffer);

      await storage.createProgressPhoto({
        userId,
        imagePath: filepath,
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

      const formattedActivities = activities.map((a) => ({
        ...a,
        createdAt: getRelativeTime(new Date(a.createdAt)),
      }));

      res.json({
        user,
        pr,
        photos,
        activities: formattedActivities,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || "admin";
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
      const userId = req.user.claims?.sub || "admin";
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
      const userId = req.user.claims?.sub || "admin";
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
      const userId = req.user.claims?.sub || "admin";
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
      const userId = req.user.claims?.sub || "admin";
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
      const userId = req.user.claims?.sub || "admin";
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

  const httpServer = createServer(app);
  return httpServer;
}
