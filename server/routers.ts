import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

const COOKIE_NAME = "session";

export const appRouter = router({
  system: systemRouter,

  // =======================
  // AUTH ROUTER
  // =======================
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      // Clear session cookie
      ctx.res.cookie(COOKIE_NAME, "", { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // =======================
  // ADMIN ROUTER
  // =======================
  admin: router({
    // ===================================================
    // PAGE CONTENT MANAGEMENT
    // ===================================================
    getPageContent: publicProcedure
      .input(z.object({ pageKey: z.string() }))
      .query(({ input }) => db.getPageContent(input.pageKey)),

    updatePageContent: protectedProcedure
      .input(
        z.object({
          pageKey: z.string(),
          headline: z.string().optional(),
          subHeadline: z.string().optional(),
          missionText: z.string().optional(),
          visionText: z.string().optional(),
          studentsTrained: z.number().optional(),
          expertInstructors: z.number().optional(),
          jobPlacementRate: z.number().optional(),

          // ✅ Image URLs for all pages
          heroImageUrl: z.string().optional(),
          bannerImageUrl: z.string().optional(),
          founderImageUrl: z.string().optional(),
          companyImageUrl: z.string().optional(),
          missionImageUrl: z.string().optional(),
          visionImageUrl: z.string().optional(),
          
          // ✅ About page text fields
          founderBio: z.string().optional(),
          founderMessage: z.string().optional(),
          aboutCompany: z.string().optional(),
        })
      )

      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.updatePageContent(input.pageKey, input);
        return { success: true };
      }),

    // ===================================================
    // COURSES MANAGEMENT
    // ===================================================
    getCourses: publicProcedure.query(() => db.getCourses()),

    createCourse: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          duration: z.string().optional(),
          level: z.string().optional(),
          instructor: z.string().optional(),
          // --- FIX: Replaced 'price' with 'priceEgp' and 'priceUsd' ---
          priceEgp: z.number().default(0),
          priceUsd: z.number().default(0),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await db.createCourse({
          ...input,
          priceEgp: String(input.priceEgp),
          priceUsd: String(input.priceUsd),
        } as any);
      }),

    updateCourse: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          duration: z.string().optional(),
          level: z.string().optional(),
          instructor: z.string().optional(),
          // --- FIX: Replaced 'price' with 'priceEgp' and 'priceUsd' (as optional) ---
          priceEgp: z.number().optional(),
          priceUsd: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { id, ...data } = input;
        const updates: any = { ...data };
        if (data.priceEgp !== undefined) updates.priceEgp = String(data.priceEgp);
        if (data.priceUsd !== undefined) updates.priceUsd = String(data.priceUsd);
        await db.updateCourse(id, updates);
        return { success: true };
      }),

    deleteCourse: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.deleteCourse(input.id);
        return { success: true };
      }),

    // ===================================================
    // PROGRAMS MANAGEMENT
    // ===================================================
    getPrograms: publicProcedure.query(() => db.getPrograms()),

    createProgram: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          duration: z.string().optional(),
          skills: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await db.createProgram(input);
      }),

    updateProgram: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          description: z.string().optional(),
          imageUrl: z.string().optional(),
          duration: z.string().optional(),
          skills: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { id, ...data } = input;
        await db.updateProgram(id, data);
        return { success: true };
      }),

    deleteProgram: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.deleteProgram(input.id);
        return { success: true };
      }),

    // ===================================================
    // BLOG POSTS MANAGEMENT
    // ===================================================
    getBlogPosts: publicProcedure.query(() => db.getBlogPosts()),

    createBlogPost: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          author: z.string(),
          content: z.string(),
          summary: z.string().optional(),
          imageUrl: z.string().optional(),
          publishedAt: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await db.createBlogPost({
          ...input,
          publishedAt: input.publishedAt || new Date(),
        });
      }),

    updateBlogPost: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          author: z.string().optional(),
          content: z.string().optional(),
          summary: z.string().optional(),
          imageUrl: z.string().optional(),
          publishedAt: z.date().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { id, ...data } = input;
        await db.updateBlogPost(id, data);
        return { success: true };
      }),

    deleteBlogPost: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.deleteBlogPost(input.id);
        return { success: true };
      }),

    // ===================================================
    // JOB LISTINGS MANAGEMENT
    // ===================================================
    getJobListings: publicProcedure.query(() => db.getJobListings()),

    getAllJobListings: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return await db.getAllJobListings();
    }),

    createJobListing: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          location: z.string(),
          description: z.string(),
          requirements: z.string().optional(),
          jobType: z.string().optional(),
          salary: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        return await db.createJobListing({ ...input, isActive: true });
      }),

    updateJobListing: protectedProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          location: z.string().optional(),
          description: z.string().optional(),
          requirements: z.string().optional(),
          jobType: z.string().optional(),
          salary: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const { id, ...data } = input;
        await db.updateJobListing(id, data);
        return { success: true };
      }),

    deleteJobListing: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.deleteJobListing(input.id);
        return { success: true };
      }),

    // ===================================================
    // STUDENT APPLICATIONS MANAGEMENT
    // ===================================================
    getApplications: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return await db.getStudentApplications();
    }),

    createApplication: publicProcedure
      .input(
        z.object({
          fullName: z.string(),
          email: z.string(),
          phone: z.string().optional(),
          message: z.string().optional(),
          courseId: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createStudentApplication(input);
      }),

    deleteApplication: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.deleteStudentApplication(input.id);
        return { success: true };
      }),

    // ===================================================
    // CONTACT MESSAGES MANAGEMENT (NEW)
    // ===================================================
    getMessages: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return await db.getContactMessages();
    }),

    createMessage: publicProcedure
      .input(
        z.object({
          name: z.string(),
          email: z.string(),
          phone: z.string().optional(),
          subject: z.string().optional(),
          message: z.string(),
          messageType: z.string().default("contact"),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createContactMessage(input);
      }),

    deleteMessage: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.deleteContactMessage(input.id);
        return { success: true };
      }),

    // ===================================================
    // SITE SETTINGS MANAGEMENT
    // ===================================================
    getSiteSettings: publicProcedure.query(async () => {
      // Return empty object for now - implement if needed
      return {};
    }),

    updateSiteSetting: protectedProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        await db.setSiteSetting(input.key, input.value);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;