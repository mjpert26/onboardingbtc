import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

// Only these people may sign in. Anyone else (even with a valid Microsoft
// account in the tenant) is rejected at sign-in and never receives a session.
// Override with the ALLOWED_EMAILS env var (comma-separated) if needed.
const DEFAULT_ALLOWED = [
  "evan.scarpello@bigthinkcapital.com",
  "anthony.scarpello@bigthinkcapital.com",
  "brian@bigthinkcapital.com",
  "mike.perticone@bigthinkcapital.com",
  "jared.faux@bigthinkcapital.com",
];

export const ALLOWED_EMAILS: string[] = (
  process.env.ALLOWED_EMAILS
    ? process.env.ALLOWED_EMAILS.split(",")
    : DEFAULT_ALLOWED
)
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function emailFrom(user: any, profile: any): string {
  return (
    user?.email ||
    profile?.email ||
    profile?.preferred_username ||
    profile?.upn ||
    ""
  )
    .toString()
    .toLowerCase();
}

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: { params: { scope: "openid profile email" } },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    // Enforce the allowlist. Returning false aborts the sign-in.
    async signIn({ user, profile }) {
      const email = emailFrom(user, profile);
      return ALLOWED_EMAILS.includes(email);
    },
    async jwt({ token, profile }) {
      if (profile) {
        token.email = emailFrom(token, profile) || token.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.email = (token.email as string) || session.user.email;
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
};
