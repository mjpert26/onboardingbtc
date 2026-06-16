import { withAuth } from "next-auth/middleware";

// Require a valid session for every page and API route. The allowlist itself is
// enforced in the signIn callback (lib/auth.ts), so only approved users ever get
// a token in the first place.
export default withAuth({
  pages: { signIn: "/signin" },
});

export const config = {
  // Protect everything except the auth endpoints, the sign-in page, and static assets.
  matcher: ["/((?!api/auth|signin|_next/static|_next/image|favicon.ico).*)"],
};
