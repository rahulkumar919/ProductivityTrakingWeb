import { NextResponse } from "next/server";
import { auth } from "@/lib/next-auth";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import { createToken, COOKIE_NAME } from "@/lib/auth";

/**
 * GET /api/auth/google-complete
 *
 * NextAuth redirects here after a successful Google OAuth callback
 * (when callbackUrl is set to this route in the signIn() call).
 *
 * We read the NextAuth session, find the user in MongoDB, issue our
 * custom devtrack_token JWT cookie (which the middleware checks), then
 * redirect the user to /dashboard.
 */
export async function GET(request: Request) {
    const redirectBase = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

    try {
        const session = await auth();

        if (!session?.user?.email) {
            // No NextAuth session — something went wrong, send back to login
            return NextResponse.redirect(new URL("/login?error=OAuthFailed", redirectBase));
        }

        await connectToDatabase();

        // Find by email or googleId stored in session
        const userId = (session.user as { id?: string }).id;
        const user = userId
            ? await User.findById(userId).lean()
            : await User.findOne({ email: session.user.email }).lean();

        if (!user) {
            return NextResponse.redirect(new URL("/login?error=UserNotFound", redirectBase));
        }

        const token = await createToken({
            userId: String(user._id),
            name: user.name ?? session.user.name ?? "User",
            mobileNumber: user.mobileNumber ?? "",
        });

        const cookieValue = `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}${process.env.NODE_ENV === "production" ? "; Secure" : ""
            }`;

        const res = NextResponse.redirect(new URL("/dashboard", redirectBase));
        res.headers.set("Set-Cookie", cookieValue);
        return res;
    } catch (error) {
        console.error("[google-complete] error:", error);
        return NextResponse.redirect(new URL("/login?error=OAuthFailed", redirectBase));
    }
}
