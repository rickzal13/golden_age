import type { User } from "@golden-age/shared";
import { apiClient } from "../../lib/api-client";
import { encryptCredential } from "../../lib/encryption";

interface LoginResponse {
  data: {
    accessToken: string;
    user: User;
  };
}

interface RegisterResponse {
  data: {
    user: User;
  };
}

interface ProfileResponse {
  data: User;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const credential = await encryptCredential(password);
  return apiClient.post("api/v1/auth/login", { json: { email, credential } }).json<LoginResponse>();
}

export async function registerApi(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<RegisterResponse> {
  const credential = await encryptCredential(input.password);
  return apiClient
    .post("api/v1/auth/register", {
      json: { email: input.email, credential, fullName: input.fullName },
    })
    .json<RegisterResponse>();
}

export async function logoutApi(): Promise<void> {
  await apiClient.post("api/v1/auth/logout").catch(() => {});
}

export async function getProfileApi(): Promise<ProfileResponse> {
  return apiClient.get("api/v1/auth/me").json<ProfileResponse>();
}

export async function updateProfileApi(input: Record<string, unknown>): Promise<ProfileResponse> {
  return apiClient.patch("api/v1/users/me", { json: input }).json<ProfileResponse>();
}

export async function changePasswordApi(
  currentPassword: string,
  newPassword: string,
): Promise<{ data: { message: string } }> {
  const currentCredential = await encryptCredential(currentPassword);
  const newCredential = await encryptCredential(newPassword);
  return apiClient
    .patch("api/v1/users/me/password", {
      json: { currentCredential, newCredential },
    })
    .json();
}
