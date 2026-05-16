import {
  int,
  index,
  longtext,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  tinyint,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users (auth) ─────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Candidates (hiring pipeline) ─────────────────────────────────────────────
/**
 * Stores job applications submitted via the public /apply form.
 * Each row represents one applicant moving through the hiring pipeline.
 */
export const candidates = mysqlTable(
  "candidates",
  {
    id: int("id").autoincrement().primaryKey(),
    // Basic info
    firstName: varchar("firstName", { length: 128 }).notNull(),
    lastName: varchar("lastName", { length: 128 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 30 }).notNull(),
    // Address
    streetAddress: varchar("streetAddress", { length: 255 }),
    apt: varchar("apt", { length: 64 }),
    city: varchar("city", { length: 128 }),
    state: varchar("state", { length: 8 }),
    zip: varchar("zip", { length: 16 }),
    // Requirements
    hasCleaning: tinyint("hasCleaning"),
    hasBankAccount: tinyint("hasBankAccount"),
    isAuthorized: tinyint("isAuthorized"),
    consentBackground: tinyint("consentBackground"),
    experience: text("experience"),
    // Specialties (JSON array of strings)
    specialties: text("specialties"),
    // Pipeline stage
    stage: varchar("stage", { length: 64 }).notNull().default("Application Submitted"),
    bioPhotoUrl: text("bioPhotoUrl"),
    videoUrl: text("videoUrl"),
    interviewVideoUrl: text("interviewVideoUrl"),
    // AI evaluation
    aiScore: int("aiScore"),
    aiSummary: text("aiSummary"),
    // AI interview
    interviewCallId: varchar("interviewCallId", { length: 128 }),
    interviewTranscript: longtext("interviewTranscript"),
    interviewScore: int("interviewScore"),
    interviewSummary: text("interviewSummary"),
    // Status page magic link token
    statusToken: varchar("statusToken", { length: 64 }),
    // Manually scheduled interview call time
    scheduledCallAt: timestamp("scheduledCallAt"),
    // Archived (hidden from pipeline but not deleted)
    archived: tinyint("archived").notNull().default(0),
    // Metadata
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    idxPhone: index("idx_cand_phone").on(table.phone),
    idxStage: index("idx_cand_stage").on(table.stage),
    idxCreated: index("idx_cand_created").on(table.createdAt),
  })
);

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

// ─── Interview video chunks ───────────────────────────────────────────────────
export const interviewChunks = mysqlTable(
  "interview_chunks",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: varchar("sessionId", { length: 128 }).notNull(),
    chunkIndex: int("chunkIndex").notNull(),
    s3Key: varchar("s3Key", { length: 512 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    idxSession: index("idx_ichunk_session").on(table.sessionId),
  })
);

export type InterviewChunk = typeof interviewChunks.$inferSelect;
