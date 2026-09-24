import "server-only";

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticateCredentials } from "@/server/auth/credentials";
import { allowRequest } from "@/server/security/rate-limit";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Staff credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!(await allowRequest("login"))) return null;
          return await authenticateCredentials(credentials);
        } catch {
          // Auth.js includes thrown messages in the credentials callback URL.
          console.error("Staff sign-in could not complete due to an internal error.");
          return null;
        }
      },
    }),
  ],
  pages: { signIn: "/admin/login", error: "/admin/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub ?? "",
        name: token.name ?? "",
        email: token.email ?? "",
        role: token.role,
      };
      return session;
    },
  },
} satisfies NextAuthOptions;
