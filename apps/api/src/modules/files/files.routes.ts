import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Hono } from "hono";
import { getS3 } from "../../lib/s3";
import { requireAuth } from "../../middleware/auth";

export const filesRoutes = new Hono().post("/upload", requireAuth, async (c) => {
  const form = await c.req.formData();
  const file = form.get("file");

  if (!file || !(file instanceof File)) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "File is required" } }, 400);
  }

  if (!file.type.startsWith("image/")) {
    return c.json(
      { error: { code: "VALIDATION_ERROR", message: "Only image files allowed" } },
      400,
    );
  }

  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: { code: "VALIDATION_ERROR", message: "File must be under 5 MB" } }, 400);
  }

  const s3 = getS3();
  const ext = file.name.split(".").pop() || "jpg";
  const key = `children/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET || "golden-age-dev",
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  const url = `${process.env.S3_ENDPOINT || "http://localhost:9000"}/${process.env.S3_BUCKET || "golden-age-dev"}/${key}`;

  return c.json({ data: { url } }, 201);
});
