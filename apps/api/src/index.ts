import { createApp } from "./app";
import { loadEnv } from "./env";
import { createDb } from "./lib/db";
import { setDecryptionKey } from "./lib/decryption";
import { getPrivateKeyPem, initJwt } from "./lib/jwt";
import { createRedis } from "./lib/redis";
import { createS3 } from "./lib/s3";

const env = loadEnv();

// Initialize infrastructure
createDb(env);
createRedis(env);
createS3(env);
await initJwt(env);
setDecryptionKey(getPrivateKeyPem());

const app = createApp(env);

export default {
  port: env.PORT,
  fetch: app.fetch,
};

console.log(`Golden Age API running on http://localhost:${env.PORT}`);
