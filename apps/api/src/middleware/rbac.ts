import type { UserRole } from "@golden-age/shared";
import type { Context, Next } from "hono";
import { ForbiddenError } from "../lib/errors";

export function requireRole(...roles: UserRole[]) {
  return async (c: Context, next: Next) => {
    const user = c.get("user");
    if (!user) {
      throw new ForbiddenError("Authentication required");
    }
    if (!roles.includes(user.role)) {
      throw new ForbiddenError(`Access denied. Required role: ${roles.join(" or ")}`);
    }
    await next();
  };
}
