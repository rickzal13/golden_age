import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ValidationError } from "../../lib/errors";
import { getPublicKeyPem } from "../../lib/jwt";
import { requireAuth } from "../../middleware/auth";
import { authLoginSchema, authRegisterSchema } from "./auth.schema";
import { getProfile, login, logout, refresh, register } from "./auth.service";

export const authRoutes = new Hono()
  .get("/public-key", (c) => {
    const pem = getPublicKeyPem();
    const der = pem
      .replace("-----BEGIN PUBLIC KEY-----", "")
      .replace("-----END PUBLIC KEY-----", "")
      .replace(/\s/g, "");
    return c.json({ data: { publicKey: der } });
  })

  .post("/register", zValidator("json", authRegisterSchema), async (c) => {
    const input = c.req.valid("json");
    const result = await register(input);
    return c.json({ data: result }, 201);
  })

  .post("/login", zValidator("json", authLoginSchema), async (c) => {
    const input = c.req.valid("json");
    const result = await login(input);

    // Set refresh token in httpOnly cookie
    c.header(
      "Set-Cookie",
      `refreshToken=${result.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=${30 * 24 * 60 * 60}`,
    );

    return c.json({
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  })

  .post("/refresh", async (c) => {
    const cookie = c.req.header("Cookie") || "";
    const match = cookie.match(/refreshToken=([^;]+)/);
    const token = match?.[1];

    if (!token) {
      // Try JSON body fallback
      const body = await c.req.json().catch(() => ({}));
      const bodyToken = body?.refreshToken;
      if (!bodyToken) throw new ValidationError("Refresh token is required");

      const result = await refresh(bodyToken);
      return c.json({ data: { accessToken: result.accessToken } });
    }

    const result = await refresh(token);

    c.header(
      "Set-Cookie",
      `refreshToken=${result.refreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=${30 * 24 * 60 * 60}`,
    );

    return c.json({ data: { accessToken: result.accessToken } });
  })

  .post("/logout", async (c) => {
    const cookie = c.req.header("Cookie") || "";
    const match = cookie.match(/refreshToken=([^;]+)/);
    const token = match?.[1];

    if (token) {
      await logout(token);
    }

    // Clear cookie
    c.header(
      "Set-Cookie",
      "refreshToken=; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=0",
    );

    return c.json({ data: { message: "Logged out" } });
  })

  .get("/me", requireAuth, async (c) => {
    const user = c.get("user");
    const profile = await getProfile(user.sub);
    return c.json({ data: profile });
  });
