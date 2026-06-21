import { changePasswordSchema, updateProfileSchema } from "@golden-age/shared/schemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAuth } from "../../middleware/auth";
import { changePassword, updateProfile } from "./users.service";

export const usersRoutes = new Hono()
  .patch("/me", requireAuth, zValidator("json", updateProfileSchema), async (c) => {
    const user = c.get("user");
    const input = c.req.valid("json");
    const updated = await updateProfile(user.sub, input);
    return c.json({ data: updated });
  })

  .patch("/me/password", requireAuth, zValidator("json", changePasswordSchema), async (c) => {
    const user = c.get("user");
    const input = c.req.valid("json");
    const result = await changePassword(user.sub, input);
    return c.json({ data: result });
  });
