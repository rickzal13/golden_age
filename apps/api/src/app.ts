import { Hono } from "hono";
import type { Env } from "./env";
import { cors } from "./middleware/cors";
import { logger } from "./middleware/logger";
import { requestId } from "./middleware/request-id";
import { authRoutes } from "./modules/auth/auth.routes";
import { childrenRoutes } from "./modules/children/children.routes";
import { filesRoutes } from "./modules/files/files.routes";
import { growthRoutes } from "./modules/growth/growth.routes";
import { usersRoutes } from "./modules/users/users.routes";

export function createApp(env: Env) {
  const app = new Hono<{ Bindings: Env }>();

  app.use("*", requestId);
  app.use("*", cors(env));
  app.use("*", logger());

  app.onError((err, c) => {
    const requestId = c.get("requestId") ?? "unknown";
    const custom = err as {
      statusCode?: number;
      code?: string;
      message?: string;
      details?: unknown;
    };

    const statusCode = custom.statusCode || 500;
    const code = custom.code || "INTERNAL_ERROR";
    const message = custom.message || "An unexpected error occurred";

    if (statusCode >= 500) {
      console.error(`[${requestId}] Unhandled error:`, err);
    }

    return c.json(
      { error: { code, message, details: custom.details, requestId } },
      statusCode as 400 | 401 | 403 | 404 | 409 | 429 | 500,
    );
  });

  app.get("/health", (c) => {
    return c.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      requestId: c.get("requestId"),
    });
  });

  app.get("/", (c) => {
    return c.json({
      name: "Golden Age API",
      version: "0.1.0",
      docs: `${env.API_URL}/docs`,
    });
  });

  app.route("/api/v1/auth", authRoutes);
  app.route("/api/v1/users", usersRoutes);
  app.route("/api/v1/children", childrenRoutes);
  app.route("/api/v1/files", filesRoutes);
  app.route("/api/v1", growthRoutes);

  return app;
}
