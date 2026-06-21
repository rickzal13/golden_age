import { cors as honoCors } from "hono/cors";
import type { Env } from "../env";

export function cors(env: Env) {
  return honoCors({
    origin: env.APP_URL,
    credentials: true,
    allowMethods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Request-Id", "Idempotency-Key"],
    maxAge: 86400,
  });
}
