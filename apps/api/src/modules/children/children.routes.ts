import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ValidationError } from "../../lib/errors";
import { requireAuth } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { createChildSchema, updateChildSchema } from "./children.schema";
import { archiveChild, createChild, getChild, listChildren, updateChild } from "./children.service";

export const childrenRoutes = new Hono()
  .get("/", requireAuth, async (c) => {
    const user = c.get("user");
    const result = await listChildren(user.sub);
    return c.json({ data: result });
  })

  .get("/:childId", requireAuth, async (c) => {
    const user = c.get("user");
    const childId = c.req.param("childId") ?? "";
    if (!childId) throw new ValidationError("Child ID is required");
    const child = await getChild(childId, user.sub);
    return c.json({ data: child });
  })

  .post(
    "/",
    requireAuth,
    requireRole("parent"),
    zValidator("json", createChildSchema),
    async (c) => {
      const user = c.get("user");
      const input = c.req.valid("json");
      const child = await createChild(user.sub, input);
      return c.json({ data: child }, 201);
    },
  )

  .patch("/:childId", requireAuth, zValidator("json", updateChildSchema), async (c) => {
    const user = c.get("user");
    const childId = c.req.param("childId") ?? "";
    if (!childId) throw new ValidationError("Child ID is required");
    const child = await updateChild(childId, user.sub, c.req.valid("json"));
    return c.json({ data: child });
  })

  .post("/:childId/archive", requireAuth, async (c) => {
    const user = c.get("user");
    const childId = c.req.param("childId") ?? "";
    if (!childId) throw new ValidationError("Child ID is required");
    await archiveChild(childId, user.sub);
    return c.json({ data: { message: "Child archived" } }, 200);
  });
