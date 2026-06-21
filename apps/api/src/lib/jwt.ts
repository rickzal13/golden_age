import type { UserRole } from "@golden-age/shared";
import * as jose from "jose";
import type { Env } from "../env";

let privateKey: jose.KeyLike | null = null;
let publicKey: jose.KeyLike | null = null;
let rawPrivateKeyPem: string | null = null;
let rawPublicKeyPem: string | null = null;

export interface JwtPayload {
  sub: string;
  role: UserRole;
  email: string;
}

export async function initJwt(env: Env) {
  if (!env.JWT_PRIVATE_KEY || !env.JWT_PUBLIC_KEY) {
    throw new Error("JWT_PRIVATE_KEY and JWT_PUBLIC_KEY must be set in environment variables");
  }

  const privateKeyPem = Buffer.from(env.JWT_PRIVATE_KEY, "base64").toString("utf-8");
  const publicKeyPem = Buffer.from(env.JWT_PUBLIC_KEY, "base64").toString("utf-8");

  rawPrivateKeyPem = privateKeyPem;
  rawPublicKeyPem = publicKeyPem;

  privateKey = await jose.importPKCS8(privateKeyPem, "RS256");
  publicKey = await jose.importSPKI(publicKeyPem, "RS256");
}

export function getPrivateKeyPem(): string {
  if (!rawPrivateKeyPem) throw new Error("JWT not initialized. Call initJwt() first.");
  return rawPrivateKeyPem;
}

export function getPublicKeyPem(): string {
  if (!rawPublicKeyPem) throw new Error("JWT not initialized. Call initJwt() first.");
  return rawPublicKeyPem;
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  if (!privateKey) throw new Error("JWT not initialized. Call initJwt() first.");

  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt()
    .setExpirationTime("15 minutes")
    .setJti(crypto.randomUUID())
    .sign(privateKey);
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  if (!publicKey) throw new Error("JWT not initialized. Call initJwt() first.");

  const { payload } = await jose.jwtVerify(token, publicKey, {
    algorithms: ["RS256"],
  });

  return {
    sub: payload.sub as string,
    role: payload.role as UserRole,
    email: payload.email as string,
  };
}
