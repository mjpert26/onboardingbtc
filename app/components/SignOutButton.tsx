"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton({ email }: { email?: string | null }) {
  return (
    <div className="user-box">
      {email ? <span className="user-email">{email}</span> : null}
      <button className="signout-btn" onClick={() => signOut({ callbackUrl: "/signin" })}>
        Sign out
      </button>
    </div>
  );
}
