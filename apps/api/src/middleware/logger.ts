import type { Context, Next } from "hono";

export function logger() {
  return async (c: Context, next: Next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;

    console.log(
      JSON.stringify({
        requestId: c.get("requestId"),
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        durationMs: duration,
      }),
    );
  };
}
