import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  real,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table - extended for Iron Crew functionality
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password"), // nullable to support migration from Replit Auth
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  displayName: varchar("display_name"), // Custom name for leaderboard display
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Iron Crew specific fields
  isAdmin: boolean("is_admin").default(false),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  title: varchar("title").default("Rookie 1").notNull(),
  streakCount: integer("streak_count").default(0).notNull(),
  lastCheckinDate: varchar("last_checkin_date"),
  lastPrUpdateDate: varchar("last_pr_update_date"),
  weight: real("weight"),
  lastWeighinDate: varchar("last_weighin_date"),
  lastRerollDate: varchar("last_reroll_date"),
  lastCalorieLogDate: varchar("last_calorie_log_date"),
  calories: integer("calories"),
  
  // MVL (Most Valuable Lifter) tracking
  mvlWins: integer("mvl_wins").default(0).notNull(),
  dailyXp: integer("daily_xp").default(0).notNull(),
  lastDailyXpReset: varchar("last_daily_xp_reset"),
  
  // Avatar customization
  characterType: varchar("character_type").default("classic").notNull(),
  shirtColor: varchar("shirt_color").default("#FF5722"),
  shortsColor: varchar("shorts_color").default("#20B2AA"),
  headband: boolean("headband").default(false),
  wristbands: boolean("wristbands").default(false),
  hairStyle: varchar("hair_style").default("short"),
  hairColor: varchar("hair_color").default("#4A3728"),
  facialHair: varchar("facial_hair").default("none"),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  xp: true,
  level: true,
  title: true,
  streakCount: true,
  lastCheckinDate: true,
  lastPrUpdateDate: true,
  lastWeighinDate: true,
  lastRerollDate: true,
  lastCalorieLogDate: true,
  calories: true,
  mvlWins: true,
  dailyXp: true,
  lastDailyXpReset: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Personal Records table
export const prs = pgTable("prs", {
  userId: varchar("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  squat: integer("squat").default(0).notNull(),
  bench: integer("bench").default(0).notNull(),
  deadlift: integer("deadlift").default(0).notNull(),
});

export const insertPRSchema = createInsertSchema(prs).omit({ userId: true });
export type InsertPR = z.infer<typeof insertPRSchema>;
export type PR = typeof prs.$inferSelect;

// PR History table - tracks progression over time
export const prHistory = pgTable("pr_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  squat: integer("squat").default(0).notNull(),
  bench: integer("bench").default(0).notNull(),
  deadlift: integer("deadlift").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPRHistorySchema = createInsertSchema(prHistory).omit({ id: true, createdAt: true });
export type InsertPRHistory = z.infer<typeof insertPRHistorySchema>;
export type PRHistory = typeof prHistory.$inferSelect;

// Activity table
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type").notNull(),
  detail: text("detail").notNull(),
  xpAwarded: integer("xp_awarded").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Challenge pool table
export const challengePool = pgTable("challenge_pool", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
});

export const insertChallengePoolSchema = createInsertSchema(challengePool).omit({ id: true });
export type InsertChallengePool = z.infer<typeof insertChallengePoolSchema>;
export type ChallengePool = typeof challengePool.$inferSelect;

// User daily challenges table
export const userDailyChallenges = pgTable("user_daily_challenges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  date: varchar("date").notNull(),
  challengeId: varchar("challenge_id").references(() => challengePool.id, { onDelete: "cascade" }).notNull(),
  completed: boolean("completed").default(false).notNull(),
});

export const insertUserDailyChallengeSchema = createInsertSchema(userDailyChallenges).omit({ id: true });
export type InsertUserDailyChallenge = z.infer<typeof insertUserDailyChallengeSchema>;
export type UserDailyChallenge = typeof userDailyChallenges.$inferSelect;

// Progress photos table
export const progressPhotos = pgTable("progress_photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  imagePath: text("image_path").notNull(),
  uploadDate: varchar("upload_date").notNull(), // YYYY-MM-DD in Central Time
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProgressPhotoSchema = createInsertSchema(progressPhotos).omit({ id: true, createdAt: true });
export type InsertProgressPhoto = z.infer<typeof insertProgressPhotoSchema>;
export type ProgressPhoto = typeof progressPhotos.$inferSelect;

// Crew state table
export const crewState = pgTable("crew_state", {
  id: integer("id").primaryKey().default(1),
  currentGoal: integer("current_goal").default(5000).notNull(),
});

export const insertCrewStateSchema = createInsertSchema(crewState);
export type InsertCrewState = z.infer<typeof insertCrewStateSchema>;
export type CrewState = typeof crewState.$inferSelect;

// User goals table
export const userGoals = pgTable("user_goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type").notNull(), // "weekly", "lifetime", or "yearly"
  title: text("title").notNull(),
  targetValue: real("target_value").notNull(),
  currentValue: real("current_value").default(0).notNull(),
  unit: varchar("unit").notNull(),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  weekStart: varchar("week_start"), // For weekly goals: Sunday date of the week (YYYY-MM-DD format)
  yearStart: varchar("year_start"), // For yearly goals: January 1st date of the year (YYYY-MM-DD format)
});

export const insertUserGoalSchema = createInsertSchema(userGoals).omit({ 
  id: true, 
  createdAt: true,
  completedAt: true,
  weekStart: true,
  yearStart: true,
});
export type InsertUserGoal = z.infer<typeof insertUserGoalSchema>;
export type UserGoal = typeof userGoals.$inferSelect;

// Weekly crew challenge pool table - admin-managed templates
export const crewChallengePool = pgTable("crew_challenge_pool", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  description: text("description"), // Optional detailed description
  targetValue: integer("target_value").notNull(), // Total crew target (e.g., 1000 reps, 500 workouts)
  unit: varchar("unit").notNull(), // "reps", "workouts", "lbs lifted", etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCrewChallengePoolSchema = createInsertSchema(crewChallengePool).omit({ id: true, createdAt: true });
export type InsertCrewChallengePool = z.infer<typeof insertCrewChallengePoolSchema>;
export type CrewChallengePool = typeof crewChallengePool.$inferSelect;

// Active weekly crew challenge - singleton table tracking current challenge
export const activeCrewChallenge = pgTable("active_crew_challenge", {
  id: integer("id").primaryKey().default(1), // Always 1 (singleton)
  challengeId: varchar("challenge_id").references(() => crewChallengePool.id, { onDelete: "set null" }),
  weekStart: varchar("week_start").notNull(), // Monday date (YYYY-MM-DD format)
  currentProgress: integer("current_progress").default(0).notNull(), // Crew's total progress
  completed: boolean("completed").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertActiveCrewChallengeSchema = createInsertSchema(activeCrewChallenge).omit({ id: true, updatedAt: true });
export type InsertActiveCrewChallenge = z.infer<typeof insertActiveCrewChallengeSchema>;
export type ActiveCrewChallenge = typeof activeCrewChallenge.$inferSelect;

// User progress on weekly crew challenge
export const userCrewChallengeProgress = pgTable("user_crew_challenge_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  weekStart: varchar("week_start").notNull(), // Week identifier (Monday date YYYY-MM-DD)
  contribution: integer("contribution").default(0).notNull(), // User's individual contribution
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserCrewChallengeProgressSchema = createInsertSchema(userCrewChallengeProgress).omit({ 
  id: true, 
  updatedAt: true 
});
export type InsertUserCrewChallengeProgress = z.infer<typeof insertUserCrewChallengeProgressSchema>;
export type UserCrewChallengeProgress = typeof userCrewChallengeProgress.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  pr: one(prs, {
    fields: [users.id],
    references: [prs.userId],
  }),
  activities: many(activities),
  dailyChallenges: many(userDailyChallenges),
  photos: many(progressPhotos),
  goals: many(userGoals),
}));

export const userGoalsRelations = relations(userGoals, ({ one }) => ({
  user: one(users, {
    fields: [userGoals.userId],
    references: [users.id],
  }),
}));

export const prsRelations = relations(prs, ({ one }) => ({
  user: one(users, {
    fields: [prs.userId],
    references: [users.id],
  }),
}));

export const prHistoryRelations = relations(prHistory, ({ one }) => ({
  user: one(users, {
    fields: [prHistory.userId],
    references: [users.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
}));

export const userDailyChallengesRelations = relations(userDailyChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userDailyChallenges.userId],
    references: [users.id],
  }),
  challenge: one(challengePool, {
    fields: [userDailyChallenges.challengeId],
    references: [challengePool.id],
  }),
}));

export const progressPhotosRelations = relations(progressPhotos, ({ one }) => ({
  user: one(users, {
    fields: [progressPhotos.userId],
    references: [users.id],
  }),
}));
