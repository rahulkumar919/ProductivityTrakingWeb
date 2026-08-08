import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { createToken, hashPassword, COOKIE_NAME } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { User } from "@/models";

/** Strip +, spaces, dashes so stored and submitted numbers always match */
function normalizeMobile(num: string) {
  return num.replace(/[\s\-+]/g, "");
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const raw = contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries(await request.formData());
    const parsed = registerSchema.parse(raw);
    const normalizedMobile = normalizeMobile(parsed.mobileNumber);
    await connectToDatabase();
    const existing = await User.findOne({ mobileNumber: normalizedMobile });
    if (existing) return NextResponse.json({ error: "Mobile number already registered." }, { status: 409 });
    const user = await User.create({ name: parsed.name, mobileNumber: normalizedMobile, passwordHash: await hashPassword(parsed.password) });
    const token = await createToken({ userId: String(user._id), name: user.name, mobileNumber: user.mobileNumber });
    const isJson = (request.headers.get("content-type") ?? "").includes("application/json");
    const cookieValue = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;

    if (isJson) {
      const res = NextResponse.json({ ok: true });
      res.headers.set("Set-Cookie", cookieValue);
      return res;
    }
    const redirectBase = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = NextResponse.redirect(new URL("/dashboard", redirectBase), 303);
    res.headers.set("Set-Cookie", cookieValue);
    return res;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Registration failed." }, { status: 400 });
  }
}
