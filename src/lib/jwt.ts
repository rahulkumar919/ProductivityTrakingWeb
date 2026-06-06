import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

const encoder = new TextEncoder();

export type AuthPayload = {
  userId: string;
  name: string;
  mobileNumber: string;
};

function secret() {
  return encoder.encode(env.jwtSecret);
}

export async function createToken(payload: AuthPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function verifyToken(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as AuthPayload;
  } catch {
    return null;
  }
}
