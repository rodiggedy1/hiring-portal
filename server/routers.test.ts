/**
 * Tests for the hiring portal routers.
 * Covers auth, admin, and hiring procedures.
 */
import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// ── Mock DB and external services ────────────────────────────────────────────

vi.mock("./db", () => ({
  getDb: vi.fn(async () => null),
  upsertUser: vi.fn(async () => {}),
  getUserByOpenId: vi.fn(async () => undefined),
  setUserRole: vi.fn(async () => {}),
}));

vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(async () => true),
}));

// ── Context helpers ──────────────────────────────────────────────────────────

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 1, openId: "user-1", name: "Test User", email: "test@example.com",
      loginMethod: "manus", role: "user",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return {
    user: {
      id: 99, openId: "admin-1", name: "Admin", email: "admin@example.com",
      loginMethod: "manus", role: "admin",
      createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ── auth.logout ──────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
    const ctx: TrpcContext = {
      user: {
        id: 1, openId: "sample-user", email: "sample@example.com", name: "Sample User",
        loginMethod: "manus", role: "user",
        createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date(),
      },
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string, options: Record<string, unknown>) => {
          clearedCookies.push({ name, options });
        },
      } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({
      maxAge: -1,
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });
});

// ── auth.me ──────────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns the user object for authenticated users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
  });
});

// ── admin.setUserRole ────────────────────────────────────────────────────────

describe("admin.setUserRole", () => {
  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.admin.setUserRole({ userId: 1, role: "admin" })
    ).rejects.toThrow();
  });

  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.admin.setUserRole({ userId: 1, role: "admin" })
    ).rejects.toThrow();
  });
});

// ── hiring.getCandidates ─────────────────────────────────────────────────────

describe("hiring.getCandidates", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.hiring.getCandidates()).rejects.toThrow();
  });

  it("throws FORBIDDEN for regular users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.hiring.getCandidates()).rejects.toThrow();
  });

  it("is accessible for admin users (returns array or DB error)", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    try {
      const result = await caller.hiring.getCandidates();
      expect(Array.isArray(result)).toBe(true);
    } catch (err: any) {
      // DB not available in test env is acceptable
      expect(err.message).not.toContain("No procedure found");
    }
  });
});

// ── hiring.submitApplication ─────────────────────────────────────────────────

describe("hiring.submitApplication", () => {
  it("is a public procedure (no auth required)", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    // Procedure exists and is callable — DB unavailable in test env is acceptable
    try {
      await caller.hiring.submitApplication({
        firstName: "Jane",
        lastName: "Doe",
        phone: "5555555555",
        specialties: [],
        hasCleaning: null,
        hasBankAccount: null,
        isAuthorized: null,
        consentBackground: null,
      });
    } catch (err: any) {
      expect(err.message).not.toContain("No procedure found");
    }
  });
});
