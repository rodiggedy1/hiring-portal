import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

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

// ─── Jobs ────────────────────────────────────────────────────────────────────

export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  department: varchar("department", { length: 128 }).notNull(),
  location: varchar("location", { length: 128 }).notNull(),
  type: mysqlEnum("type", ["Full time", "Part time", "Contract", "Internship"])
    .default("Full time")
    .notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  summary: varchar("summary", { length: 512 }),
  status: mysqlEnum("status", ["draft", "published", "closed"])
    .default("draft")
    .notNull(),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// ─── Candidates ──────────────────────────────────────────────────────────────

export const candidates = mysqlTable("candidates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 64 }),
  skills: text("skills"),
  resumeKey: varchar("resumeKey", { length: 512 }),
  resumeUrl: varchar("resumeUrl", { length: 1024 }),
  linkedIn: varchar("linkedIn", { length: 512 }),
  portfolio: varchar("portfolio", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;

// ─── Applications ─────────────────────────────────────────────────────────────

export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  candidateId: int("candidateId").notNull(),
  status: mysqlEnum("status", [
    "Applied",
    "Screening",
    "Interview",
    "Offer",
    "Hired",
    "Rejected",
  ])
    .default("Applied")
    .notNull(),
  coverLetter: text("coverLetter"),
  // Answers to multi-step form questions stored as JSON string
  formAnswers: text("formAnswers"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

// ─── Application Notes ────────────────────────────────────────────────────────

export const applicationNotes = mysqlTable("application_notes", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  authorId: int("authorId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApplicationNote = typeof applicationNotes.$inferSelect;
export type InsertApplicationNote = typeof applicationNotes.$inferInsert;
