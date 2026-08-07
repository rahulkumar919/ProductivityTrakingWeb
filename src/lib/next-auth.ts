import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import bcrypt from "bcryptjs";

const providers = [];

// Only add Google provider if credentials are set
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    );
}

providers.push(
    Credentials({
        name: "credentials",
        credentials: {
            mobileNumber: { label: "Mobile", type: "tel" },
            password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
            if (!credentials?.mobileNumber || !credentials?.password) return null;
            try {
                await connectToDatabase();
                const user = await User.findOne({
                    mobileNumber: String(credentials.mobileNumber),
                }).lean();
                if (!user || !user.passwordHash) return null;
                const valid = await bcrypt.compare(
                    String(credentials.password),
                    user.passwordHash
                );
                if (!valid) return null;
                return {
                    id: String(user._id),
                    name: user.name,
                    email: user.email ?? "",
                    image: user.avatarUrl ?? "",
                };
            } catch (e) {
                console.error("[NextAuth] credentials authorize error:", e);
                return null;
            }
        },
    })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET ?? "devtrack-secret-fallback",
    providers,
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider === "google" && profile?.sub) {
                try {
                    await connectToDatabase();
                    const existing = await User.findOne({ googleId: profile.sub });
                    if (!existing) {
                        const byEmail = await User.findOne({ email: profile.email });
                        if (byEmail) {
                            await User.updateOne(
                                { _id: byEmail._id },
                                { googleId: profile.sub, avatarUrl: profile.picture ?? byEmail.avatarUrl }
                            );
                            user.id = String(byEmail._id);
                        } else {
                            const created = await User.create({
                                name: profile.name ?? user.name ?? "Google User",
                                email: profile.email ?? "",
                                googleId: profile.sub,
                                avatarUrl: profile.picture ?? "",
                                passwordHash: "",
                                mobileNumber: "",
                            });
                            user.id = String(created._id);
                        }
                    } else {
                        user.id = String(existing._id);
                        if (profile.picture && existing.avatarUrl !== profile.picture) {
                            await User.updateOne({ _id: existing._id }, { avatarUrl: profile.picture });
                        }
                    }
                } catch (e) {
                    console.error("[NextAuth] Google signIn error:", e);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user?.id) token.userId = user.id;
            if (account?.provider) token.provider = account.provider;
            return token;
        },
        async session({ session, token }) {
            if (token.userId) {
                (session.user as { id?: string }).id = token.userId as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: { strategy: "jwt" },
});
