import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onboarding Helpdesk — Big Think Capital",
  description: "View New Hire Onboarding workflow results: logins, passwords, errors, and per-system status.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        </header>
        {children}
      </body>
    </html>
  );
}
