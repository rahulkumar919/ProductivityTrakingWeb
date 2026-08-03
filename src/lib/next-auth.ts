import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/models";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    secret: process.env.NEXTAUTH_SECRET ?? process.env.JWT_SECRET ?? "devtrack-secret",
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                mobileNumber: { label: "Mobile", type: "tel" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.mobileNumber || !credentials?.password) return null;
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
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            // Google sign-in: upsert user in DB
            if (account?.provider === "google" && profile?.sub) {
                await connectToDatabase();
                const existing = await User.findOne({ googleId: profile.sub });
                if (!existing) {
                    // Also check by email
                    const byEmail = await User.findOne({ email: profile.email });
                    if (byEmail) {
                        // Link Google account to existing user
                        await User.updateOne(
                            { _id: byEmail._id },
                            {
                                googleId: profile.sub,
                                avatarUrl: profile.picture ?? byEmail.avatarUrl,
                            }
                        );
                        user.id = String(byEmail._id);
                    } else {
                        // Create new user from Google
                        const created = await User.create({
                            name: profile.name ?? user.name ?? "Google User",
                            email: profile.email ?? "",
                            googleId: profile.sub,
                            avatarUrl: profile.picture ?? "",
                            passwordHash: "", // No password for Google users
                            mobileNumber: "",
                        });
                        user.id = String(created._id);
                    }
                } else {
                    user.id = String(existing._id);
                    // Update avatar if changed
                    if (profile.picture && existing.avatarUrl !== profile.picture) {
                        await User.updateOne({ _id: existing._id }, { avatarUrl: profile.picture });
                    }
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
