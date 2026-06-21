import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { requireAuth } from "../../middleware/auth";
import { createGrowthSchema, updateGrowthSchema } from "./growth.schema";
import {
  createGrowthRecord,
  deleteGrowthRecord,
  getChartData,
  getGrowthSummary,
  listGrowthRecords,
  updateGrowthRecord,
} from "./growth.service";

export const growthRoutes = new Hono()
  .get("/children/:childId/growth-summary", requireAuth, async (c) => {
    const user = c.get("user");
    const summary = await getGrowthSummary(c.req.param("childId") ?? "", user.sub);
    return c.json({ data: summary });
  })

  .get("/children/:childId/growth", requireAuth, async (c) => {
    const user = c.get("user");
    const records = await listGrowthRecords(c.req.param("childId") ?? "", user.sub);
    return c.json({ data: records });
  })

  .post(
    "/children/:childId/growth",
    requireAuth,
    zValidator("json", createGrowthSchema),
    async (c) => {
      const user = c.get("user");
      const input = c.req.valid("json");
      const record = await createGrowthRecord(user.sub, {
        ...input,
        childId: c.req.param("childId") ?? "",
      });
      return c.json({ data: record }, 201);
    },
  )

  .patch(
    "/children/:childId/growth/:recordId",
    requireAuth,
    zValidator("json", updateGrowthSchema),
    async (c) => {
      const user = c.get("user");
      const record = await updateGrowthRecord(
        c.req.param("recordId") ?? "",
        user.sub,
        c.req.param("childId") ?? "",
        c.req.valid("json"),
      );
      return c.json({ data: record });
    },
  )

  .get("/children/:childId/growth/chart/:chartType", requireAuth, async (c) => {
    const user = c.get("user");
    const data = await getChartData(
      c.req.param("childId") ?? "",
      user.sub,
      c.req.param("chartType") ?? "wfa",
    );
    return c.json({ data });
  })

  .delete("/children/:childId/growth/:recordId", requireAuth, async (c) => {
    const user = c.get("user");
    await deleteGrowthRecord(c.req.param("recordId") ?? "", c.req.param("childId") ?? "", user.sub);
    return c.json({ data: { message: "Record deleted" } }, 200);
  });
