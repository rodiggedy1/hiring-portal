import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { users } from "../drizzle/schema";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { hiringRouter } from "./hiringRouter";

const adminRouter = router({
  setUserRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["admin", "user"]) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
      return { success: true };
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    /**
     * Password-based admin login — validates against ADMIN_USERNAME / ADMIN_PASSWORD env vars.
     * On success, upserts a synthetic admin user (openId = "admin") and issues a session cookie.
     */
    adminLogin: publicProcedure
      .input(z.object({ username: z.string(), password: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (
          !ENV.adminPassword ||
          input.username !== ENV.adminUsername ||
          input.password !== ENV.adminPassword
        ) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
        }
        // Upsert a synthetic admin user so authenticateRequest can resolve it from the DB
        const db = await getDb();
        if (db) {
          await db
            .insert(users)
            .values({ openId: "admin", name: "Admin", role: "admin" })
            .onDuplicateKeyUpdate({ set: { role: "admin", name: "Admin" } });
        }
        const sessionToken = await sdk.createSessionToken("admin", {
          name: "Admin",
          expiresInMs: ONE_YEAR_MS,
        });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),
  }),
  admin: adminRouter,
  hiring: hiringRouter,
});

export type AppRouter = typeof appRouter;
