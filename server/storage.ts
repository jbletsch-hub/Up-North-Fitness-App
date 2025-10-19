import {
  users,
  prs,
  activities,
  challengePool,
  userDailyChallenges,
  progressPhotos,
  crewState,
  userGoals,
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
  updateUserStreak(id: string, streakCount: number, lastCheckinDate: string): Promise<User>;
  updateUserWeight(id: string, weight: number, lastWeighinDate: string): Promise<User>;
  updateUserPRDate(id: string, lastPrUpdateDate: string): Promise<User>;
  updateUserProfile(id: string, firstName: string, lastName: string | undefined, profileImageUrl: string): Promise<User>;
  
  // PR operations
  getPR(userId: string): Promise<PR | undefined>;
  upsertPR(userId: string, pr: InsertPR): Promise<PR>;
  getAllPRs(): Promise<PR[]>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getActivitiesByUser(userId: string, limit?: number): Promise<Activity[]>;
  getRecentActivities(limit?: number): Promise<Array<Activity & { username: string }>>;
  
  // Challenge pool operations
  getAllChallenges(): Promise<ChallengePool[]>;
  createChallenge(challenge: InsertChallengePool): Promise<ChallengePool>;
  deleteChallenge(id: string): Promise<void>;
  
  // User daily challenges operations
  getUserDailyChallenges(userId: string, date: string): Promise<Array<UserDailyChallenge & { text: string }>>;
  createUserDailyChallenge(challenge: InsertUserDailyChallenge): Promise<UserDailyChallenge>;
  completeChallenge(id: string): Promise<UserDailyChallenge>;
  
  // Progress photos operations
  createProgressPhoto(photo: InsertProgressPhoto): Promise<ProgressPhoto>;
  getPhotosByUser(userId: string): Promise<ProgressPhoto[]>;
  
  // Crew state operations
  getCrewGoal(): Promise<number>;
  updateCrewGoal(goal: number): Promise<CrewState>;
  
  // User goals operations
  getUserGoals(userId: string, type?: string): Promise<UserGoal[]>;
  getGoal(id: string): Promise<UserGoal | undefined>;
  createGoal(goal: InsertUserGoal): Promise<UserGoal>;
  updateGoalProgress(id: string, currentValue: number): Promise<UserGoal>;
  completeGoal(id: string): Promise<UserGoal>;
  deleteGoal(id: string): Promise<void>;
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

  async updateUserProfile(id: string, firstName: string, lastName: string | undefined, profileImageUrl: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ firstName, lastName, profileImageUrl })
      .where(eq(users.id, id))
      .returning();
    return user;
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

  async getRecentActivities(limit: number = 10): Promise<Array<Activity & { username: string }>> {
    const result = await db
      .select({
        id: activities.id,
        userId: activities.userId,
        type: activities.type,
        detail: activities.detail,
        xpAwarded: activities.xpAwarded,
        createdAt: activities.createdAt,
        username: users.username,
      })
      .from(activities)
      .leftJoin(users, eq(activities.userId, users.id))
      .orderBy(desc(activities.createdAt))
      .limit(limit);
    
    return result.map(r => ({
      ...r,
      username: r.username || "Unknown",
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

  async createGoal(goalData: InsertUserGoal): Promise<UserGoal> {
    const [goal] = await db
      .insert(userGoals)
      .values(goalData)
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
}

export const storage = new DatabaseStorage();
