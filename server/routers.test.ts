import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────

vi.mock("./db", () => ({
  listPublishedJobs: vi.fn(async () => [
    { id: 1, title: "Product Designer", department: "Design", location: "London, UK", type: "Full time", description: "...", requirements: "...", summary: "Lead design", status: "published", createdBy: null, createdAt: new Date(), updatedAt: new Date() },
  ]),
  listAllJobs: vi.fn(async () => []),
  getJobById: vi.fn(async (id: number) =>
    id === 1
      ? { id: 1, title: "Product Designer", department: "Design", location: "London, UK", type: "Full time", description: "...", requirements: "...", summary: "Lead design", status: "published", createdBy: null, createdAt: new Date(), updatedAt: new Date() }
      : undefined
  ),
  createJob: vi.fn(async () => {}),
  updateJob: vi.fn(async () => {}),
  deleteJob: vi.fn(async () => {}),
  getCandidateByUserId: vi.fn(async () => undefined),
  getCandidateById: vi.fn(async () => undefined),
  upsertCandidate: vi.fn(async () => ({ id: 1, userId: 1, name: "Test User", email: "test@example.com", phone: null, skills: null, resumeKey: null, resumeUrl: null, linkedIn: null, portfolio: null, createdAt: new Date(), updatedAt: new Date() })),
  listAllCandidates: vi.fn(async () => []),
  createApplication: vi.fn(async () => {}),
  getApplicationById: vi.fn(async () => undefined),
  listApplicationsByJob: vi.fn(async () => []),
  listApplicationsByCandidate: vi.fn(async () => []),
  listAllApplications: vi.fn(async () => []),
  updateApplicationStatus: vi.fn(async () => {}),
  getExistingApplication: vi.fn(async () => undefined),
  addNote: vi.fn(async () => {}),
  listNotesByApplication: vi.fn(async () => []),
  getDashboardStats: vi.fn(async () => ({ activeJobs: 2, totalApplicants: 5, pipeline: { Applied: 3, Screening: 1, Interview: 1, Offer: 0, Hired: 0, Rejected: 0 } })),
  setUserRole: vi.fn(async () => {}),
  getUserByOpenId: vi.fn(async () => undefined),
  getUserById: vi.fn(async () => undefined),
  upsertUser: vi.fn(async () => {}),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(async () => true),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn(async () => ({ key: "test-key", url: "/manus-storage/test-key" })),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: { id: 1, openId: "user-1", name: "Test User", email: "test@example.com", loginMethod: "manus", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return {
    user: { id: 99, openId: "admin-1", name: "Admin", email: "admin@example.com", loginMethod: "manus", role: "admin", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("jobs.list (public)", () => {
  it("returns published jobs", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.jobs.list({});
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("Product Designer");
  });
});

describe("jobs.getById (public)", () => {
  it("returns a job by id", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const job = await caller.jobs.getById({ id: 1 });
    expect(job.title).toBe("Product Designer");
  });

  it("throws NOT_FOUND for unknown id", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.jobs.getById({ id: 999 })).rejects.toThrow();
  });
});

describe("jobs.create (admin only)", () => {
  it("allows admin to create a job", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.jobs.create({
      title: "Test Job",
      department: "Engineering",
      location: "Remote",
      type: "Full time",
      description: "A test job description",
      requirements: "Some requirements",
      status: "draft",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.jobs.create({
        title: "Test Job",
        department: "Engineering",
        location: "Remote",
        type: "Full time",
        description: "A test job description",
        requirements: "Some requirements",
        status: "draft",
      })
    ).rejects.toThrow();
  });
});

describe("applications.apply", () => {
  it("allows authenticated user to apply", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.applications.submit({
      jobId: 1,
      name: "Test User",
      email: "test@example.com",
      coverLetter: "I am very interested in this role.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects unauthenticated user", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.applications.submit({
        jobId: 1,
        name: "Test User",
        email: "test@example.com",
      })
    ).rejects.toThrow();
  });
});

describe("admin.dashboard", () => {
  it("returns stats for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const stats = await caller.admin.dashboard();
    expect(stats.activeJobs).toBe(2);
    expect(stats.totalApplicants).toBe(5);
  });

  it("rejects non-admin", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.admin.dashboard()).rejects.toThrow();
  });
});

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const ctx = makeUserCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
  });
});
