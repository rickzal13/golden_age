import type { Context, Next } from "hono";

declare module "hono" {
  interface ContextVariableMap {
    requestId: string;
  }
}

export async function requestId(c: Context, next: Next) {
  const id = c.req.header("X-Request-Id") || crypto.randomUUID();
  c.set("requestId", id);
  c.header("X-Request-Id", id);
  await next();
}
