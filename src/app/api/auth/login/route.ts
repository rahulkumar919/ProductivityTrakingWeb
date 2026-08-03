import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { User } from "@/models";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const raw = contentType.includes("application/json")
      ? await request.json()
      : Object.fromEntries(await request.formData());
    const parsed = loginSchema.parse(raw);
    await connectToDatabase();
    const user = await User.findOne({ mobileNumber: parsed.mobileNumber });
    if (!user || !(await verifyPassword(parsed.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid mobile number or password." }, { status: 401 });
    }
    await setAuthCookie(await createToken({ userId: String(user._id), name: user.name, mobileNumber: user.mobileNumber }));
    // JSON clients handle redirect themselves; form submits get a 303
    const isJson = (request.headers.get("content-type") ?? "").includes("application/json");
    if (isJson) return NextResponse.json({ ok: true });
    return NextResponse.redirect(new URL("/dashboard", request.url), 303);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Login failed." }, { status: 400 });
  }
}
