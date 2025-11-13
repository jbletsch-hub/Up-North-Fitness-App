import {
  users,
  prs,
  activities,
  challengePool,
  userDailyChallenges,
  progressPhotos,
  crewState,
  userGoals,
  crewChallengePool,
  activeCrewChallenge,
  userCrewChallengeProgress,
  type User,
  type UpsertUser,
  type InsertUser,
  type PR,
  type InsertPR,
  type Activity,
  type InsertActivity,
  type ChallengePool,
  type InsertChallengePool,
  type UserDailyChallenge,
  type InsertUserDailyChallenge,
  type ProgressPhoto,
  type InsertProgressPhoto,
  type CrewState,
  type InsertCrewState,
  type UserGoal,
  type InsertUserGoal,
  type CrewChallengePool,
  type InsertCrewChallengePool,
  type ActiveCrewChallenge,
  type InsertActiveCrewChallenge,
  type UserCrewChallengeProgress,
  type InsertUserCrewChallengeProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<void>;
  updateUserXP(id: string, xp: number, level: number, title: string): Promise<User>;
  updateUserDailyXP(id: string, dailyXp: number, lastDailyXpReset: string): Promise<User>;
  updateUserStreak(id: string, streakCount: number, lastCheckinDate: string): Promise<User>;
  updateUserWeight(id: string, weight: number, lastWeighinDate: string): Promise<User>;
  updateUserPRDate(id: string, lastPrUpdateDate: string): Promise<User>;
  updateUserRerollDate(id: string, lastRerollDate: string): Promise<User>;
  updateUserCalorieLogDate(id: string, lastCalorieLogDate: string, calories?: number): Promise<User>;
  updateUserProfile(id: string, firstName: string, lastName: string | undefined, profileImageUrl: string): Promise<User>;
  updateUserDisplayName(id: string, displayName: string): Promise<User>;
  updateUserAvatar(id: string, avatar: { characterType?: string; shirtColor?: string; shortsColor?: string; headband?: boolean; wristbands?: boolean; hairStyle?: string; hairColor?: string; facialHair?: string }): Promise<User>;
  getTodayMVLLeaderboard(limit: number): Promise<User[]>;
  awardMVLWin(id: string): Promise<User>;
  resetAllDailyXP(date: string): Promise<void>;
  
  // PR operations
  getPR(userId: string): Promise<PR | undefined>;
  upsertPR(userId: string, pr: InsertPR): Promise<PR>;
  getAllPRs(): Promise<PR[]>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByUser(userId: string, limit?: number): Promise<Activity[]>;
  getRecentActivities(limit?: number): Promise<Array<Activity & { username: string; characterType: string; level: number }>>;
  
  // Challenge pool operations
  getAllChallenges(): Promise<ChallengePool[]>;
  createChallenge(challenge: InsertChallengePool): Promise<ChallengePool>;
  deleteChallenge(id: string): Promise<void>;
  
  // User daily challenges operations
  getUserDailyChallenges(userId: string, date: string): Promise<Array<UserDailyChallenge & { text: string }>>;
  createUserDailyChallenge(challenge: InsertUserDailyChallenge): Promise<UserDailyChallenge>;
  completeChallenge(id: string): Promise<UserDailyChallenge>;
  deleteUserDailyChallenges(userId: string, date: string): Promise<void>;
  
  // Progress photos operations
  createProgressPhoto(photo: InsertProgressPhoto): Promise<ProgressPhoto>;
  getPhotosByUser(userId: string): Promise<ProgressPhoto[]>;
  
  // Crew state operations
  getCrewGoal(): Promise<number>;
  updateCrewGoal(goal: number): Promise<CrewState>;
  
  // User goals operations
  getUserGoals(userId: string, type?: string): Promise<UserGoal[]>;
  getGoal(id: string): Promise<UserGoal | undefined>;
  createGoal(goal: InsertUserGoal, weekStart?: string, yearStart?: string): Promise<UserGoal>;
  updateGoalProgress(id: string, currentValue: number): Promise<UserGoal>;
  completeGoal(id: string): Promise<UserGoal>;
  deleteGoal(id: string): Promise<void>;
  hasWeeklyGoalThisWeek(userId: string, weekStart: string): Promise<boolean>;
  hasYearlyGoalThisYear(userId: string, yearStart: string): Promise<boolean>;
  getPRLeaderboards(): Promise<{ bench: any[], squat: any[], deadlift: any[] }>;
  
  // Crew challenge pool operations (admin)
  getAllCrewChallenges(): Promise<CrewChallengePool[]>;
  createCrewChallenge(challenge: InsertCrewChallengePool): Promise<CrewChallengePool>;
  updateCrewChallenge(id: string, challenge: Partial<InsertCrewChallengePool>): Promise<CrewChallengePool>;
  deleteCrewChallenge(id: string): Promise<void>;
  
  // Active crew challenge operations
  getActiveCrewChallenge(): Promise<(ActiveCrewChallenge & { challenge: CrewChallengePool | null }) | null>;
  setActiveCrewChallenge(challengeId: string, weekStart: string): Promise<ActiveCrewChallenge>;
  updateCrewChallengeProgress(weekStart: string, progress: number): Promise<ActiveCrewChallenge>;
  
  // User crew challenge progress operations
  getUserCrewProgress(userId: string, weekStart: string): Promise<UserCrewChallengeProgress | undefined>;
  updateUserCrewProgress(userId: string, weekStart: string, contribution: number): Promise<UserCrewChallengeProgress>;
  getCrewLeaderboard(weekStart: string, limit?: number): Promise<Array<UserCrewChallengeProgress & { username: string; displayName: string | null; characterType: string; level: number }>>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      ttl: 7 * 24 * 60 * 60, // 1 week in seconds
      tableName: "sessions",
    });
  }

  async seedAdminUser(hashPasswordFn: (password: string) => Promise<string>): Promise<void> {
    try {
      const adminUser = await this.getUserByUsername("admin");
      if (!adminUser) {
        const hashedPassword = await hashPasswordFn("admin123");
        await this.createUser({
          username: "admin",
          password: hashedPassword,
          isAdmin: true,
        });
        console.log("✅ Admin user created (username: admin, password: admin123)");
      }
    } catch (error) {
      console.error("Error seeding admin user:", error);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.xp));
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserXP(id: string, xp: number, level: number, title: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ xp, level, title })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserDailyXP(id: string, dailyXp: number, lastDailyXpReset: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ dailyXp, lastDailyXpReset })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserStreak(id: string, streakCount: number, lastCheckinDate: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ streakCount, lastCheckinDate })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserWeight(id: string, weight: number, lastWeighinDate: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ weight, lastWeighinDate })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPRDate(id: string, lastPrUpdateDate: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ lastPrUpdateDate })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserRerollDate(id: string, lastRerollDate: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ lastRerollDate })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserCalorieLogDate(id: string, lastCalorieLogDate: string, calories?: number): Promise<User> {
    const updateData: any = { lastCalorieLogDate };
    if (calories !== undefined) {
      updateData.calories = calories;
    }
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: string, firstName: string, lastName: string | undefined, profileImageUrl: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ firstName, lastName, profileImageUrl })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserDisplayName(id: string, displayName: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ displayName })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserAvatar(id: string, avatar: { characterType?: string; shirtColor?: string; shortsColor?: string; headband?: boolean; wristbands?: boolean; hairStyle?: string; hairColor?: string; facialHair?: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set(avatar)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getTodayMVLLeaderboard(limit: number): Promise<User[]> {
    const leaderboard = await db
      .select()
      .from(users)
      .orderBy(desc(users.dailyXp))
      .limit(limit);
    return leaderboard;
  }

  async awardMVLWin(id: string): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    
    const [updatedUser] = await db
      .update(users)
      .set({ mvlWins: user.mvlWins + 1 })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async resetAllDailyXP(date: string): Promise<void> {
    await db
      .update(users)
      .set({ dailyXp: 0, lastDailyXpReset: date });
  }

  // PR operations
  async getPR(userId: string): Promise<PR | undefined> {
    const [pr] = await db.select().from(prs).where(eq(prs.userId, userId));
    return pr;
  }

  async upsertPR(userId: string, prData: InsertPR): Promise<PR> {
    const [pr] = await db
      .insert(prs)
      .values({ userId, ...prData })
      .onConflictDoUpdate({
        target: prs.userId,
        set: prData,
      })
      .returning();
    return pr;
  }

  async getAllPRs(): Promise<PR[]> {
    return await db.select().from(prs);
  }

  // Activity operations
  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(activityData)
      .returning();
    return activity;
  }

  async getActivitiesByUser(userId: string, limit: number = 10): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getRecentActivities(limit: number = 10): Promise<Array<Activity & { username: string; characterType: string; level: number }>> {
    const result = await db
      .select({
        id: activities.id,
        userId: activities.userId,
        type: activities.type,
        detail: activities.detail,
        xpAwarded: activities.xpAwarded,
        createdAt: activities.createdAt,
        username: users.username,
        characterType: users.characterType,
        level: users.level,
      })
      .from(activities)
      .leftJoin(users, eq(activities.userId, users.id))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
    
    return result.map(r => ({
      ...r,
      username: r.username || "Unknown",
      characterType: r.characterType || "classic",
      level: r.level || 1,
    }));
  }

  // Challenge pool operations
  async getAllChallenges(): Promise<ChallengePool[]> {
    return await db.select().from(challengePool);
  }

  async createChallenge(challengeData: InsertChallengePool): Promise<ChallengePool> {
    const [challenge] = await db
      .insert(challengePool)
      .values(challengeData)
      .returning();
    return challenge;
  }

  async deleteChallenge(id: string): Promise<void> {
    await db.delete(challengePool).where(eq(challengePool.id, id));
  }

  // User daily challenges operations
  async getUserDailyChallenges(userId: string, date: string): Promise<Array<UserDailyChallenge & { text: string }>> {
    const result = await db
      .select({
        id: userDailyChallenges.id,
        userId: userDailyChallenges.userId,
        date: userDailyChallenges.date,
        challengeId: userDailyChallenges.challengeId,
        completed: userDailyChallenges.completed,
        text: challengePool.text,
      })
      .from(userDailyChallenges)
      .leftJoin(challengePool, eq(userDailyChallenges.challengeId, challengePool.id))
      .where(and(eq(userDailyChallenges.userId, userId), eq(userDailyChallenges.date, date)));
    
    return result.map(r => ({
      ...r,
      text: r.text || "",
    }));
  }

  async createUserDailyChallenge(challengeData: InsertUserDailyChallenge): Promise<UserDailyChallenge> {
    const [challenge] = await db
      .insert(userDailyChallenges)
      .values(challengeData)
      .returning();
    return challenge;
  }

  async completeChallenge(id: string): Promise<UserDailyChallenge> {
    const [challenge] = await db
      .update(userDailyChallenges)
      .set({ completed: true })
      .where(eq(userDailyChallenges.id, id))
      .returning();
    return challenge;
  }

  async deleteUserDailyChallenges(userId: string, date: string): Promise<void> {
    await db
      .delete(userDailyChallenges)
      .where(and(eq(userDailyChallenges.userId, userId), eq(userDailyChallenges.date, date)));
  }

  // Progress photos operations
  async createProgressPhoto(photoData: InsertProgressPhoto): Promise<ProgressPhoto> {
    const [photo] = await db
      .insert(progressPhotos)
      .values(photoData)
      .returning();
    return photo;
  }

  async getPhotosByUser(userId: string): Promise<ProgressPhoto[]> {
    return await db
      .select()
      .from(progressPhotos)
      .where(eq(progressPhotos.userId, userId))
      .orderBy(desc(progressPhotos.createdAt));
  }

  // Crew state operations
  async getCrewGoal(): Promise<number> {
    const [state] = await db.select().from(crewState).where(eq(crewState.id, 1));
    if (!state) {
      const [newState] = await db
        .insert(crewState)
        .values({ id: 1, currentGoal: 5000 })
        .returning();
      return newState.currentGoal;
    }
    return state.currentGoal;
  }

  async updateCrewGoal(goal: number): Promise<CrewState> {
    const [state] = await db
      .insert(crewState)
      .values({ id: 1, currentGoal: goal })
      .onConflictDoUpdate({
        target: crewState.id,
        set: { currentGoal: goal },
      })
      .returning();
    return state;
  }

  // User goals operations
  async getUserGoals(userId: string, type?: string): Promise<UserGoal[]> {
    if (type) {
      return await db
        .select()
        .from(userGoals)
        .where(and(eq(userGoals.userId, userId), eq(userGoals.type, type)))
        .orderBy(desc(userGoals.createdAt));
    }
    
    return await db
      .select()
      .from(userGoals)
      .where(eq(userGoals.userId, userId))
      .orderBy(desc(userGoals.createdAt));
  }

  async getGoal(id: string): Promise<UserGoal | undefined> {
    const [goal] = await db.select().from(userGoals).where(eq(userGoals.id, id));
    return goal;
  }

  async createGoal(goalData: InsertUserGoal, weekStart?: string, yearStart?: string): Promise<UserGoal> {
    let values: any = goalData;
    if (weekStart) {
      values = { ...goalData, weekStart };
    }
    if (yearStart) {
      values = { ...values, yearStart };
    }
    const [goal] = await db
      .insert(userGoals)
      .values(values)
      .returning();
    return goal;
  }

  async updateGoalProgress(id: string, currentValue: number): Promise<UserGoal> {
    const [goal] = await db
      .update(userGoals)
      .set({ currentValue })
      .where(eq(userGoals.id, id))
      .returning();
    return goal;
  }

  async completeGoal(id: string): Promise<UserGoal> {
    const [goal] = await db
      .update(userGoals)
      .set({ completed: true, completedAt: new Date() })
      .where(eq(userGoals.id, id))
      .returning();
    return goal;
  }

  async deleteGoal(id: string): Promise<void> {
    await db.delete(userGoals).where(eq(userGoals.id, id));
  }

  async hasWeeklyGoalThisWeek(userId: string, weekStart: string): Promise<boolean> {
    const goals = await db
      .select()
      .from(userGoals)
      .where(
        and(
          eq(userGoals.userId, userId),
          eq(userGoals.type, "weekly"),
          eq(userGoals.weekStart, weekStart)
        )
      );
    return goals.length >= 3;
  }

  async hasYearlyGoalThisYear(userId: string, yearStart: string): Promise<boolean> {
    const goals = await db
      .select()
      .from(userGoals)
      .where(
        and(
          eq(userGoals.userId, userId),
          eq(userGoals.type, "yearly"),
          eq(userGoals.yearStart, yearStart)
        )
      );
    return goals.length > 0;
  }

  async getPRLeaderboards(): Promise<{ bench: any[], squat: any[], deadlift: any[] }> {
    // Get top 3 for each lift
    const benchTop = await db
      .select({
        userId: prs.userId,
        value: prs.bench,
        username: users.username,
        displayName: users.displayName,
      })
      .from(prs)
      .innerJoin(users, eq(prs.userId, users.id))
      .where(sql`${prs.bench} > 0`)
      .orderBy(sql`${prs.bench} DESC`)
      .limit(3);

    const squatTop = await db
      .select({
        userId: prs.userId,
        value: prs.squat,
        username: users.username,
        displayName: users.displayName,
      })
      .from(prs)
      .innerJoin(users, eq(prs.userId, users.id))
      .where(sql`${prs.squat} > 0`)
      .orderBy(sql`${prs.squat} DESC`)
      .limit(3);

    const deadliftTop = await db
      .select({
        userId: prs.userId,
        value: prs.deadlift,
        username: users.username,
        displayName: users.displayName,
      })
      .from(prs)
      .innerJoin(users, eq(prs.userId, users.id))
      .where(sql`${prs.deadlift} > 0`)
      .orderBy(sql`${prs.deadlift} DESC`)
      .limit(3);

    return {
      bench: benchTop,
      squat: squatTop,
      deadlift: deadliftTop,
    };
  }

  // Crew challenge pool operations (admin)
  async getAllCrewChallenges(): Promise<CrewChallengePool[]> {
    return await db
      .select()
      .from(crewChallengePool)
      .orderBy(desc(crewChallengePool.createdAt));
  }

  async createCrewChallenge(challengeData: InsertCrewChallengePool): Promise<CrewChallengePool> {
    const [challenge] = await db
      .insert(crewChallengePool)
      .values(challengeData)
      .returning();
    return challenge;
  }

  async updateCrewChallenge(id: string, challengeData: Partial<InsertCrewChallengePool>): Promise<CrewChallengePool> {
    const [challenge] = await db
      .update(crewChallengePool)
      .set(challengeData)
      .where(eq(crewChallengePool.id, id))
      .returning();
    return challenge;
  }

  async deleteCrewChallenge(id: string): Promise<void> {
    await db.delete(crewChallengePool).where(eq(crewChallengePool.id, id));
  }

  // Active crew challenge operations
  async getActiveCrewChallenge(): Promise<(ActiveCrewChallenge & { challenge: CrewChallengePool | null }) | null> {
    const results = await db
      .select({
        id: activeCrewChallenge.id,
        challengeId: activeCrewChallenge.challengeId,
        weekStart: activeCrewChallenge.weekStart,
        currentProgress: activeCrewChallenge.currentProgress,
        completed: activeCrewChallenge.completed,
        updatedAt: activeCrewChallenge.updatedAt,
        challenge: crewChallengePool,
      })
      .from(activeCrewChallenge)
      .leftJoin(crewChallengePool, eq(activeCrewChallenge.challengeId, crewChallengePool.id))
      .where(eq(activeCrewChallenge.id, 1));

    if (results.length === 0) {
      return null;
    }

    return results[0] as ActiveCrewChallenge & { challenge: CrewChallengePool | null };
  }

  async setActiveCrewChallenge(challengeId: string, weekStart: string): Promise<ActiveCrewChallenge> {
    const [challenge] = await db
      .insert(activeCrewChallenge)
      .values({
        id: 1,
        challengeId,
        weekStart,
        currentProgress: 0,
        completed: false,
      })
      .onConflictDoUpdate({
        target: activeCrewChallenge.id,
        set: {
          challengeId,
          weekStart,
          currentProgress: 0,
          completed: false,
          updatedAt: new Date(),
        },
      })
      .returning();
    return challenge;
  }

  async updateCrewChallengeProgress(weekStart: string, progress: number): Promise<ActiveCrewChallenge> {
    const [challenge] = await db
      .update(activeCrewChallenge)
      .set({
        currentProgress: progress,
        updatedAt: new Date(),
      })
      .where(eq(activeCrewChallenge.id, 1))
      .returning();
    return challenge;
  }

  // User crew challenge progress operations
  async getUserCrewProgress(userId: string, weekStart: string): Promise<UserCrewChallengeProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userCrewChallengeProgress)
      .where(
        and(
          eq(userCrewChallengeProgress.userId, userId),
          eq(userCrewChallengeProgress.weekStart, weekStart)
        )
      );
    return progress;
  }

  async updateUserCrewProgress(userId: string, weekStart: string, contribution: number): Promise<UserCrewChallengeProgress> {
    const existing = await this.getUserCrewProgress(userId, weekStart);

    if (existing) {
      const [progress] = await db
        .update(userCrewChallengeProgress)
        .set({
          contribution,
          updatedAt: new Date(),
        })
        .where(eq(userCrewChallengeProgress.id, existing.id))
        .returning();
      return progress;
    } else {
      const [progress] = await db
        .insert(userCrewChallengeProgress)
        .values({
          userId,
          weekStart,
          contribution,
        })
        .returning();
      return progress;
    }
  }

  async getCrewLeaderboard(weekStart: string, limit: number = 10): Promise<Array<UserCrewChallengeProgress & { username: string; displayName: string | null; characterType: string; level: number }>> {
    const results = await db
      .select({
        id: userCrewChallengeProgress.id,
        userId: userCrewChallengeProgress.userId,
        weekStart: userCrewChallengeProgress.weekStart,
        contribution: userCrewChallengeProgress.contribution,
        updatedAt: userCrewChallengeProgress.updatedAt,
        username: users.username,
        displayName: users.displayName,
        characterType: users.characterType,
        level: users.level,
      })
      .from(userCrewChallengeProgress)
      .innerJoin(users, eq(userCrewChallengeProgress.userId, users.id))
      .where(eq(userCrewChallengeProgress.weekStart, weekStart))
      .orderBy(desc(userCrewChallengeProgress.contribution))
      .limit(limit);

    return results;
  }
}

export const storage = new DatabaseStorage();
