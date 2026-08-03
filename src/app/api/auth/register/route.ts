import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { createToken, hashPassword, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";
import { User } from "@/models";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const raw = contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries(await request.formData());
    const parsed = registerSchema.parse(raw);
    await connectToDatabase();
    const existing = await User.findOne({ mobileNumber: parsed.mobileNumber });
    if (existing) return NextResponse.json({ error: "Mobile number already registered." }, { status: 409 });
    const user = await User.create({ name: parsed.name, mobileNumber: parsed.mobileNumber, passwordHash: await hashPassword(parsed.password) });
    await setAuthCookie(await createToken({ userId: String(user._id), name: user.name, mobileNumber: user.mobileNumber }));
    const isJson = (request.headers.get("content-type") ?? "").includes("application/json");
    if (isJson) return NextResponse.json({ ok: true });
    return NextResponse.redirect(new URL("/dashboard", request.url), 303);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Registration failed." }, { status: 400 });
  }
}
