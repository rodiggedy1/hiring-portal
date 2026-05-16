import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import {
  addNote,
  createApplication,
  createJob,
  deleteJob,
  getCandidateById,
  getCandidateByUserId,
  getDashboardStats,
  getExistingApplication,
  getJobById,
  listAllApplications,
  listAllCandidates,
  listAllJobs,
  listApplicationsByCandidate,
  listApplicationsByJob,
  listNotesByApplication,
  listPublishedJobs,
  setUserRole,
  updateApplicationStatus,
  updateJob,
  upsertCandidate,
} from "./db";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Jobs Router ──────────────────────────────────────────────────────────────

const jobsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        department: z.string().optional(),
        location: z.string().optional(),
        keyword: z.string().optional(),
      }).optional()
    )
    .query(({ input }) => listPublishedJobs(input ?? {})),

  listAll: adminProcedure.query(() => listAllJobs()),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const job = await getJobById(input.id);
      if (!job) throw new TRPCError({ code: "NOT_FOUND" });
      return job;
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        department: z.string().min(1),
        location: z.string().min(1),
        type: z.enum(["Full time", "Part time", "Contract", "Internship"]),
        description: z.string().min(1),
        requirements: z.string().min(1),
        summary: z.string().optional(),
        status: z.enum(["draft", "published", "closed"]).default("draft"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createJob({ ...input, createdBy: ctx.user.id });
      return { success: true };
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        department: z.string().min(1).optional(),
        location: z.string().min(1).optional(),
        type: z.enum(["Full time", "Part time", "Contract", "Internship"]).optional(),
        description: z.string().min(1).optional(),
        requirements: z.string().min(1).optional(),
        summary: z.string().optional(),
        status: z.enum(["draft", "published", "closed"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateJob(id, data);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deleteJob(input.id);
      return { success: true };
    }),
});

// ─── Candidates Router ────────────────────────────────────────────────────────

const candidatesRouter = router({
  me: protectedProcedure.query(({ ctx }) =>
    getCandidateByUserId(ctx.user.id)
  ),

  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const candidate = await getCandidateById(input.id);
      if (!candidate) throw new TRPCError({ code: "NOT_FOUND" });
      return candidate;
    }),

  listAll: adminProcedure.query(() => listAllCandidates()),

  upsert: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        skills: z.string().optional(),
        linkedIn: z.string().optional(),
        portfolio: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await upsertCandidate({ ...input, userId: ctx.user.id });
      return { success: true };
    }),

  uploadResume: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileBase64: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const buffer = Buffer.from(input.fileBase64, "base64");
      const key = `resumes/${ctx.user.id}-${Date.now()}-${input.fileName}`;
      const { url } = await storagePut(key, buffer, input.mimeType);
      await upsertCandidate({
        userId: ctx.user.id,
        name: ctx.user.name ?? "",
        email: ctx.user.email ?? "",
        resumeKey: key,
        resumeUrl: url,
      });
      return { url, key };
    }),
});

// ─── Applications Router ──────────────────────────────────────────────────────

const applicationsRouter = router({
  submit: protectedProcedure
    .input(
      z.object({
        jobId: z.number(),
        coverLetter: z.string().optional(),
        formAnswers: z.string().optional(),
        // candidate info for upsert
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        skills: z.string().optional(),
        linkedIn: z.string().optional(),
        portfolio: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const job = await getJobById(input.jobId);
      if (!job || job.status !== "published") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found or not open" });
      }

      // Upsert candidate profile
      const candidate = await upsertCandidate({
        userId: ctx.user.id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        skills: input.skills,
        linkedIn: input.linkedIn,
        portfolio: input.portfolio,
      });

      if (!candidate) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Check duplicate
      const existing = await getExistingApplication(input.jobId, candidate.id);
      if (existing) {
        throw new TRPCError({ code: "CONFLICT", message: "You have already applied for this position" });
      }

      await createApplication({
        jobId: input.jobId,
        candidateId: candidate.id,
        coverLetter: input.coverLetter,
        formAnswers: input.formAnswers,
        status: "Applied",
      });

      // Notify owner
      try {
        await notifyOwner({
          title: `New Application: ${job.title}`,
          content: `${input.name} (${input.email}) has applied for the ${job.title} position.`,
        });
      } catch (e) {
        console.warn("[Notification] Failed to notify owner:", e);
      }

      return { success: true };
    }),

  mine: protectedProcedure.query(async ({ ctx }) => {
    const candidate = await getCandidateByUserId(ctx.user.id);
    if (!candidate) return [];
    const apps = await listApplicationsByCandidate(candidate.id);
    // Enrich with job info
    const enriched = await Promise.all(
      apps.map(async (app) => {
        const job = await getJobById(app.jobId);
        return { ...app, job };
      })
    );
    return enriched;
  }),

  listByJob: adminProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ input }) => {
      const apps = await listApplicationsByJob(input.jobId);
      return Promise.all(
        apps.map(async (app) => {
          const candidate = await getCandidateById(app.candidateId);
          return { ...app, candidate };
        })
      );
    }),

  listAll: adminProcedure.query(async () => {
    const apps = await listAllApplications();
    return Promise.all(
      apps.map(async (app) => {
        const [job, candidate] = await Promise.all([
          getJobById(app.jobId),
          getCandidateById(app.candidateId),
        ]);
        return { ...app, job, candidate };
      })
    );
  }),

  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const app = await import("./db").then((m) => m.getApplicationById(input.id));
      if (!app) throw new TRPCError({ code: "NOT_FOUND" });
      const [job, candidate] = await Promise.all([
        getJobById(app.jobId),
        getCandidateById(app.candidateId),
      ]);
      return { ...app, job, candidate };
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateApplicationStatus(input.id, input.status);
      return { success: true };
    }),
});

// ─── Notes Router ─────────────────────────────────────────────────────────────

const notesRouter = router({
  add: adminProcedure
    .input(
      z.object({
        applicationId: z.number(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await addNote({
        applicationId: input.applicationId,
        authorId: ctx.user.id,
        content: input.content,
      });
      return { success: true };
    }),

  list: adminProcedure
    .input(z.object({ applicationId: z.number() }))
    .query(({ input }) => listNotesByApplication(input.applicationId)),
});

// ─── Admin Router ─────────────────────────────────────────────────────────────

const adminRouter = router({
  dashboard: adminProcedure.query(() => getDashboardStats()),

  setUserRole: adminProcedure
    .input(z.object({ userId: z.number(), role: z.enum(["admin", "user"]) }))
    .mutation(async ({ input }) => {
      await setUserRole(input.userId, input.role);
      return { success: true };
    }),
});

// ─── App Router ───────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  jobs: jobsRouter,
  candidates: candidatesRouter,
  applications: applicationsRouter,
  notes: notesRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
