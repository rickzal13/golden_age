import { S3Client } from "@aws-sdk/client-s3";
import type { Env } from "../env";

let s3: S3Client | null = null;

export function createS3(env: Env): S3Client {
  if (s3) return s3;

  s3 = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY,
    },
    forcePathStyle: true,
  });

  return s3;
}

export function getS3(): S3Client {
  if (!s3) throw new Error("S3 client not initialized. Call createS3() first.");
  return s3;
}
