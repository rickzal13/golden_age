import type { Context, Next } from "hono";
import type { Env } from "../env";

export function errorHandler() {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    try {
      await next();
    } catch (err) {
      const requestId = c.get("requestId") ?? "unknown";

      const custom = err as {
        statusCode?: number;
        code?: string;
        message?: string;
        details?: unknown;
      } | null;
      const statusCode = custom?.statusCode || 500;
      const errorCode = custom?.code || "INTERNAL_ERROR";
      const message = custom?.message || "An unexpected error occurred";
      const details = custom?.details as Array<{ field: string; message: string }> | undefined;

      if (statusCode >= 500) {
        console.error(`[${requestId}] Unhandled error:`, err);
      }

      return c.json(
        { error: { code: errorCode, message, details, requestId } },
        statusCode as 400 | 401 | 403 | 404 | 409 | 429 | 500,
      );
    }
    return;
  };
}
