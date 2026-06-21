import {
  type LoginInput,
  type RegisterInput,
  loginSchema,
  registerSchema,
} from "@golden-age/shared/schemas";
import { z } from "zod";

export const authRegisterSchema = registerSchema;

export const authLoginSchema = loginSchema;

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

export type AuthRegisterInput = RegisterInput;
export type AuthLoginInput = LoginInput;
