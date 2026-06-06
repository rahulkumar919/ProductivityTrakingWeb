import { env } from "@/lib/env";
import type { AuthPayload } from "@/lib/jwt";

function base64UrlToBytes(input: string) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

function base64UrlToJson<T>(input: string) {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(input))) as T;
}

export async function verifyTokenEdge(token?: string) {
  if (!token) return null;
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.jwtSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const valid = await crypto.subtle.verify("HMAC", key, base64UrlToBytes(signature), new TextEncoder().encode(`${header}.${payload}`));
  if (!valid) return null;

  const decoded = base64UrlToJson<AuthPayload & { exp?: number }>(payload);
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
  return decoded;
}
