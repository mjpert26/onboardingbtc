"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInInner() {
  const params = useSearchParams();
  const error = params.get("error");
  // NextAuth sends "AccessDenied" when our signIn callback rejects the user.
  const denied = error === "AccessDenied";

  return (
    <div className="signin-wrap">
      <div className="signin-card">
        <h1>Onboarding Helpdesk</h1>
        <p className="signin-sub">Big Think Capital · Level 1 support</p>

        {error ? (
          <div className="signin-error">
            {denied
              ? "That account isn't authorized to view this dashboard. Contact IT if you think this is a mistake."
              : "Sign-in failed. Please try again."}
          </div>
        ) : null}

        <button className="ms-btn" onClick={() => signIn("azure-ad", { callbackUrl: "/" })}>
          <span className="ms-logo" aria-hidden="true">
            <span style={{ background: "#f25022" }} />
            <span style={{ background: "#7fba00" }} />
            <span style={{ background: "#00a4ef" }} />
            <span style={{ background: "#ffb900" }} />
          </span>
          Sign in with Microsoft
        </button>

        <p className="signin-note">Access is limited to approved Big Think Capital staff.</p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}
