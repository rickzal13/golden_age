import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "../../lib/db";
import { refreshTokens, users } from "../../lib/db/schema";
import { decryptCredential } from "../../lib/decryption";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../lib/errors";
import { generateToken, hashPassword, hashToken, verifyPassword } from "../../lib/hash";
import { signAccessToken } from "../../lib/jwt";
import type { AuthLoginInput, AuthRegisterInput } from "./auth.schema";

function decryptAndValidate(encrypted: string, minLength: number): string {
  let plaintext: string;
  try {
    plaintext = decryptCredential(encrypted);
  } catch {
    throw new UnauthorizedError("Invalid credentials");
  }

  if (plaintext.length < minLength) {
    throw new UnauthorizedError("Invalid credentials");
  }

  return plaintext;
}

export async function register(input: AuthRegisterInput) {
  const db = getDb();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.email, input.email), isNull(users.deletedAt)))
    .limit(1);

  if (existing.length > 0) {
    throw new ConflictError("Email already registered");
  }

  const password = decryptAndValidate(input.credential, 8);

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      role: "parent",
      languagePreference: input.languagePreference,
      countryCode: input.countryCode,
    })
    .returning({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      createdAt: users.createdAt,
    });

  if (!user) throw new Error("Failed to create user");

  return { user };
}

export async function login(input: AuthLoginInput) {
  const db = getDb();

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      passwordHash: users.passwordHash,
      fullName: users.fullName,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.email, input.email), isNull(users.deletedAt)))
    .limit(1);

  if (!user || !user.passwordHash) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const password = decryptAndValidate(input.credential, 1);

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const accessToken = await signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });

  const refreshToken = generateToken();
  const tokenHash = hashToken(refreshToken);

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
}

export async function refresh(refreshTokenValue: string) {
  const db = getDb();
  const tokenHash = hashToken(refreshTokenValue);

  const [token] = await db
    .select({
      id: refreshTokens.id,
      userId: refreshTokens.userId,
      expiresAt: refreshTokens.expiresAt,
      revokedAt: refreshTokens.revokedAt,
    })
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
    .limit(1);

  if (!token) {
    throw new UnauthorizedError("Invalid refresh token");
  }

  if (token.revokedAt) {
    await db
      .update(refreshTokens)
      .set({ revokedAt: new Date(), revokedBy: "breach_detection" })
      .where(and(eq(refreshTokens.userId, token.userId), isNull(refreshTokens.revokedAt)));
    throw new UnauthorizedError("Token revoked — all sessions terminated");
  }

  if (new Date() > token.expiresAt) {
    throw new UnauthorizedError("Refresh token expired");
  }

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date(), revokedBy: "rotation" })
    .where(eq(refreshTokens.id, token.id));

  const [user] = await db
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(and(eq(users.id, token.userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) throw new UnauthorizedError("User not found");

  const accessToken = await signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });

  const newRefreshToken = generateToken();
  const newTokenHash = hashToken(newRefreshToken);

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash: newTokenHash,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshTokenValue: string) {
  const db = getDb();
  const tokenHash = hashToken(refreshTokenValue);

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date(), revokedBy: "user_logout" })
    .where(eq(refreshTokens.tokenHash, tokenHash));
}

export async function getProfile(userId: string) {
  const db = getDb();

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      phone: users.phone,
      fullName: users.fullName,
      role: users.role,
      avatarUrl: users.avatarUrl,
      languagePreference: users.languagePreference,
      countryCode: users.countryCode,
      timezone: users.timezone,
      notificationPreferences: users.notificationPreferences,
      subscriptionTier: users.subscriptionTier,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) throw new NotFoundError("User not found");

  return user;
}
