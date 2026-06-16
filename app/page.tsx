import Link from "next/link";
import { listRuns, isMockMode } from "@/lib/n8n";
import type { RunSummary } from "@/lib/types";

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function HomePage() {
  let runs: RunSummary[] = [];
  let error: string | null = null;
  try {
    runs = await listRuns(30);
  } catch (err: any) {
    error = err?.message || "Failed to load runs from n8n.";
  }

  return (
    <main className="container">
      {isMockMode() ? (
        <div className="mock-banner">
          Showing <strong>sample data</strong>. Set <code>N8N_API_KEY</code> (and{" "}
          <code>N8N_BASE_URL</code>) in the environment to read live onboarding runs.
        </div>
      ) : null}

      {error ? (
        <div className="card">
          <h2>Could not load runs</h2>
          <p className="mono" style={{ color: "var(--red)" }}>
            {error}
          </p>
          <p className="empty">
            Check that <code>N8N_API_KEY</code> is valid and has permission to read executions.
          </p>
        </div>
      ) : runs.length === 0 ? (
        <div className="card">
          <div className="empty">
            No onboarding runs found yet. New runs will appear here automatically once the workflow
            executes.
          </div>
        </div>
      ) : (
        <div className="run-list">
          {runs.map((r) => (
            <Link key={r.id} href={`/run/${r.id}`} className="run-row">
              <div>
                <div className="who">{r.fullName}</div>
                <div className="meta">
                  {r.jobTitle || "—"}
                  {r.location ? ` · ${r.location}` : ""} · {r.email || "no email"}
                </div>
              </div>
              <div className="right">
                <span className={`badge ${r.status}`}>{r.status}</span>
                {r.errorCount > 0 ? (
                  <div className="meta" style={{ color: "var(--red)" }}>
                    {r.errorCount} issue{r.errorCount > 1 ? "s" : ""}
                  </div>
                ) : null}
                <div className="meta">{fmtDate(r.startedAt)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
