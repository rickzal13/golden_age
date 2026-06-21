import type { Child } from "@golden-age/shared";
import { apiClient } from "../../lib/api-client";

interface ChildListResponse {
  data: Child[];
}

interface ChildResponse {
  data: Child;
}

export async function getChildrenApi(): Promise<ChildListResponse> {
  return apiClient.get("api/v1/children").json<ChildListResponse>();
}

export async function getChildApi(childId: string): Promise<ChildResponse> {
  return apiClient.get(`api/v1/children/${childId}`).json<ChildResponse>();
}

export async function createChildApi(input: {
  name: string;
  dateOfBirth: string;
  gender: "male" | "female";
  birthWeightG?: number | null;
  birthLengthCm?: number | null;
  birthBloodType?: string | null;
  birthNotes?: string | null;
}): Promise<ChildResponse> {
  return apiClient.post("api/v1/children", { json: input }).json<ChildResponse>();
}

export async function updateChildApi(
  childId: string,
  input: {
    name?: string;
    dateOfBirth?: string;
    gender?: "male" | "female";
    photoUrl?: string | null;
    birthWeightG?: number | null;
    birthLengthCm?: number | null;
    birthBloodType?: string | null;
    birthNotes?: string | null;
  },
): Promise<ChildResponse> {
  return apiClient.patch(`api/v1/children/${childId}`, { json: input }).json<ChildResponse>();
}

export async function archiveChildApi(childId: string): Promise<void> {
  await apiClient.post(`api/v1/children/${childId}/archive`);
}

export async function uploadPhotoApi(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await apiClient
    .post("api/v1/files/upload", { body: form })
    .json<{ data: { url: string } }>();
  return { url: res.data.url };
}
