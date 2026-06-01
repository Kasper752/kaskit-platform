import bcrypt from "bcryptjs";
import { config } from "../config.js";

export function assertPasswordPolicy(password: string) {
  if (password.length < config.passwordMinLength) {
    throw new Error(`Password must be at least ${config.passwordMinLength} characters.`);
  }
}

export async function hashPassword(password: string) {
  assertPasswordPolicy(password);
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
