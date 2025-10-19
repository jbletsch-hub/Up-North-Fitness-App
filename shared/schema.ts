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
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Iron Crew specific fields
  username: varchar("username").unique(),
  isAdmin: boolean("is_admin").default(false),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  title: varchar("title").default("Rookie 1").notNull(),
  streakCount: integer("streak_count").default(0).notNull(),
  lastCheckinDate: varchar("last_checkin_date"),
  lastPrUpdateDate: varchar("last_pr_update_date"),
  weight: real("weight"),
  lastWeighinDate: varchar("last_weighin_date"),
});

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

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  pr: one(prs, {
    fields: [users.id],
    references: [prs.userId],
  }),
  activities: many(activities),
  dailyChallenges: many(userDailyChallenges),
  photos: many(progressPhotos),
}));

export const prsRelations = relations(prs, ({ one }) => ({
  user: one(users, {
    fields: [prs.userId],
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
