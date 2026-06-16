import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions, isAdmin } from "@/lib/auth";
import { workflowUrl } from "@/lib/n8n";
import SignOutButton from "./components/SignOutButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onboarding Helpdesk — Big Think Capital",
  description: "View New Hire Onboarding workflow results: logins, passwords, errors, and per-system status.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div>
            <Link href="/" style={{ color: "#fff", textDecoration: "none" }}>
              <h1>New Hire Onboarding — Helpdesk</h1>
            </Link>
            <div className="sub">Big Think Capital · Level 1 support view</div>
          </div>
          {session?.user ? (
            <div className="topbar-right">
              {isAdmin(session.user.email) ? (
                <a className="wf-link" href={workflowUrl()} target="_blank" rel="noreferrer">
                  Open n8n workflow ↗
                </a>
              ) : null}
              <SignOutButton email={session.user.email} />
            </div>
          ) : null}
        </header>
        {children}
      </body>
    </html>
  );
}
