import type { Context, Next } from "hono";
import { UnauthorizedError } from "../lib/errors";
import type { JwtPayload } from "../lib/jwt";
import { verifyAccessToken } from "../lib/jwt";

declare module "hono" {
  interface ContextVariableMap {
    user: JwtPayload;
  }
}

export async function requireAuth(c: Context, next: Next) {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing or invalid authorization header");
  }

  const token = header.slice(7);
  try {
    const payload = await verifyAccessToken(token);
    c.set("user", payload);
    await next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
