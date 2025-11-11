import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../db";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Try normal Manus authentication
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication failed (normal in local dev)
    // 👇 Fallback: create a dummy admin user for local access
    if (process.env.NODE_ENV === "development") {
      user = {
        id: "local-admin",
        name: "Local Admin",
        email: "admin@local.dev",
        role: "admin",
      } as unknown as User;
    } else {
      // In production, keep user null if not authenticated
      user = null;
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
