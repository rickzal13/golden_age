import type { ChangePasswordInput, UpdateProfileInput } from "@golden-age/shared/schemas";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "../../lib/db";
import { users } from "../../lib/db/schema";
import { decryptCredential } from "../../lib/decryption";
import { NotFoundError, UnauthorizedError } from "../../lib/errors";
import { hashPassword, verifyPassword } from "../../lib/hash";

function decrypt(input: string): string {
  try {
    return decryptCredential(input);
  } catch {
    throw new UnauthorizedError("Invalid credentials");
  }
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const db = getDb();

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) throw new NotFoundError("User not found");

  const [updated] = await db
    .update(users)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
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
      updatedAt: users.updatedAt,
    });

  return updated;
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const db = getDb();

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
    })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)))
    .limit(1);

  if (!user) throw new NotFoundError("User not found");

  if (!user.passwordHash) {
    throw new UnauthorizedError("Account uses social login — no password to change");
  }

  const currentPassword = decrypt(input.currentCredential);
  const newPassword = decrypt(input.newCredential);

  if (newPassword.length < 8) {
    throw new UnauthorizedError("New password must be at least 8 characters");
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  const newHash = await hashPassword(newPassword);

  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return { message: "Password changed successfully" };
}
