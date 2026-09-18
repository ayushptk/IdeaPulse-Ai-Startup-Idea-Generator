import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { SERVER_API_URL } from "@/lib/api-config";

// Use server-only API_URL — not NEXT_PUBLIC — so it is never bundled into the browser
const API_URL = SERVER_API_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
            headers: { "Content-Type": "application/json" }
          });
          const data = await res.json();
          if (res.ok && data.user) {
            return {
              id: data.user.id.toString(),
              email: data.user.email,
              name: data.user.name,
              image: data.user.picture,
            };
          }
          return null;
        } catch {
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const res = await fetch(`${API_URL}/auth/verify`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Server-side call — safe to include internal key here
              "X-API-Key": INTERNAL_API_KEY,
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              picture: user.image,
              provider: "google",
              provider_id: account.providerAccountId,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            user.id = data.user?.id?.toString() || user.id;
            return true;
          }
          return false;
        } catch {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = (user as { picture?: string; image?: string }).picture || user.image;
      }

      if (trigger === "update" && session) {
        token.name = session.name || token.name;
        token.picture = session.picture || token.picture;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; name?: string | null; email?: string | null; image?: string | null }).id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    // Reduce session lifetime from the default 30 days to 7 days
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

