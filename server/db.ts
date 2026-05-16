import { and, desc, eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  applicationNotes,
  applications,
  candidates,
  InsertUser,
  jobs,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function setUserRole(userId: number, role: "admin" | "user") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export async function listPublishedJobs(opts?: { department?: string; location?: string; keyword?: string }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(jobs.status, "published")];
  if (opts?.department) conditions.push(eq(jobs.department, opts.department));
  if (opts?.location) conditions.push(eq(jobs.location, opts.location));
  if (opts?.keyword) {
    conditions.push(
      or(
        like(jobs.title, `%${opts.keyword}%`),
        like(jobs.description, `%${opts.keyword}%`)
      )!
    );
  }
  return db.select().from(jobs).where(and(...conditions)).orderBy(desc(jobs.createdAt));
}

export async function listAllJobs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobs).orderBy(desc(jobs.createdAt));
}

export async function getJobById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return result[0];
}

export async function createJob(data: typeof jobs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(jobs).values(data);
  return result;
}

export async function updateJob(id: number, data: Partial<typeof jobs.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(jobs).set(data).where(eq(jobs.id, id));
}

export async function deleteJob(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(jobs).where(eq(jobs.id, id));
}

// ─── Candidates ───────────────────────────────────────────────────────────────

export async function getCandidateByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(candidates).where(eq(candidates.userId, userId)).limit(1);
  return result[0];
}

export async function getCandidateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(candidates).where(eq(candidates.id, id)).limit(1);
  return result[0];
}

export async function upsertCandidate(data: typeof candidates.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const existing = await getCandidateByUserId(data.userId);
  if (existing) {
    await db.update(candidates).set(data).where(eq(candidates.userId, data.userId));
    return getCandidateByUserId(data.userId);
  } else {
    await db.insert(candidates).values(data);
    return getCandidateByUserId(data.userId);
  }
}

export async function listAllCandidates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(candidates).orderBy(desc(candidates.createdAt));
}

// ─── Applications ─────────────────────────────────────────────────────────────

export async function createApplication(data: typeof applications.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(applications).values(data);
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return result[0];
}

export async function listApplicationsByJob(jobId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(applications).where(eq(applications.jobId, jobId)).orderBy(desc(applications.createdAt));
}

export async function listApplicationsByCandidate(candidateId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(applications).where(eq(applications.candidateId, candidateId)).orderBy(desc(applications.createdAt));
}

export async function listAllApplications() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(applications).orderBy(desc(applications.createdAt));
}

export async function updateApplicationStatus(
  id: number,
  status: "Applied" | "Screening" | "Interview" | "Offer" | "Hired" | "Rejected"
) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(applications).set({ status }).where(eq(applications.id, id));
}

export async function getExistingApplication(jobId: number, candidateId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(applications)
    .where(and(eq(applications.jobId, jobId), eq(applications.candidateId, candidateId)))
    .limit(1);
  return result[0];
}

// ─── Application Notes ────────────────────────────────────────────────────────

export async function addNote(data: typeof applicationNotes.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(applicationNotes).values(data);
}

export async function listNotesByApplication(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(applicationNotes)
    .where(eq(applicationNotes.applicationId, applicationId))
    .orderBy(desc(applicationNotes.createdAt));
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { activeJobs: 0, totalApplicants: 0, pipeline: {} };

  const allJobs = await db.select().from(jobs);
  const allApps = await db.select().from(applications);

  const activeJobs = allJobs.filter((j) => j.status === "published").length;
  const totalApplicants = allApps.length;

  const pipeline: Record<string, number> = {
    Applied: 0,
    Screening: 0,
    Interview: 0,
    Offer: 0,
    Hired: 0,
    Rejected: 0,
  };
  allApps.forEach((a) => {
    pipeline[a.status] = (pipeline[a.status] || 0) + 1;
  });

  return { activeJobs, totalApplicants, pipeline };
}
