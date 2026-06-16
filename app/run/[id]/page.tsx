import Link from "next/link";
import { notFound } from "next/navigation";
import { getRun, isMockMode } from "@/lib/n8n";
import CopyField from "@/app/components/CopyField";

export const dynamic = "force-dynamic";

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

const STEP_ICON: Record<string, string> = {
  success: "✓",
  failed: "✕",
  skipped: "•",
  running: "…",
};

export default async function RunPage({ params }: { params: { id: string } }) {
  const run = await getRun(params.id);
  if (!run) notFound();

  return (
    <main className="container">
      <Link href="/" className="back-link">
        ← All onboarding runs
      </Link>

      {isMockMode() ? (
        <div className="mock-banner">
          Sample data — connect <code>N8N_API_KEY</code> to view live runs.
        </div>
      ) : null}

      {/* Header */}
      <div className="card">
        <div className="detail-head">
          <div>
            <div className="name">{run.hire.fullName}</div>
            <div className="role">
              {run.hire.jobTitle || "—"}
              {run.hire.department ? ` · ${run.hire.department}` : ""}
            </div>
          </div>
          <span className={`badge ${run.status}`}>{run.status}</span>
        </div>
        <div className="counts">
          <span className="count-pill ok">{run.stepCounts.success} completed</span>
          {run.stepCounts.failed > 0 ? (
            <span className="count-pill bad">{run.stepCounts.failed} failed</span>
          ) : null}
          <span className="count-pill">{run.stepCounts.skipped} not run</span>
          <span className="count-pill">Run #{run.id}</span>
        </div>
      </div>

      {/* What went wrong */}
      {run.errors.length > 0 ? (
        <div className="card">
          <h2>What went wrong</h2>
          {run.errors.map((e, i) => (
            <div className="error-item" key={i}>
              <div className="head">
                {e.system} — {e.node}
                {e.httpCode ? ` (HTTP ${e.httpCode})` : ""}
              </div>
              <div className="msg">{e.message}</div>
              {e.detail ? <pre>{e.detail}</pre> : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* Credentials & logins */}
      <div className="card">
        <h2>Logins & Credentials</h2>
        <div className="kv">
          <div className="k">Work Email</div>
          <div className="v">
            <CopyField value={run.credentials.email} />
          </div>
          <div className="k">Temp Password</div>
          <div className="v">
            <CopyField value={run.credentials.temporaryPassword} />
          </div>
          <div className="k">DocuSign Link</div>
          <div className="v">
            <CopyField value={run.credentials.docusignLink} mono={false} />
          </div>
          <div className="k">Personal Email</div>
          <div className="v">
            <CopyField value={run.credentials.personalEmail} />
          </div>
        </div>
      </div>

      {/* Hire details */}
      <div className="card">
        <h2>Hire Details</h2>
        <div className="kv">
          <div className="k">Manager</div>
          <div className="v">{run.hire.manager || "—"}</div>
          <div className="k">Sales Team</div>
          <div className="v">{run.hire.salesTeam || "—"}</div>
          <div className="k">Location</div>
          <div className="v">{run.hire.locationAddress || run.hire.location || "—"}</div>
          <div className="k">Start Date</div>
          <div className="v">{run.hire.startDate || "—"}</div>
          <div className="k">Started</div>
          <div className="v">{fmtDate(run.startedAt)}</div>
          <div className="k">Finished</div>
          <div className="v">{fmtDate(run.stoppedAt)}</div>
        </div>
      </div>

      {/* Emails */}
      <div className="card">
        <h2>Emails Sent</h2>
        {run.emails.map((em, i) => (
          <div className="email-row" key={i}>
            <div>
              <div>{em.label}</div>
              <div className="e-to">
                to {em.to}
                {em.cc ? ` · cc ${em.cc}` : ""}
              </div>
            </div>
            <span className={`badge ${em.status}`}>
              {em.status === "success" ? "sent" : em.status === "skipped" ? "not sent" : em.status}
            </span>
          </div>
        ))}
      </div>

      {/* Per-system breakdown */}
      <div className="card">
        <h2>System-by-system</h2>
        {run.systems.map((sys) => (
          <div className="system" key={sys.system}>
            <div className="system-head">
              <span className="title">{sys.label}</span>
              <span className={`badge ${sys.status}`}>
                {sys.status === "skipped" ? "not run" : sys.status}
              </span>
            </div>
            {sys.steps.map((step) => (
              <div className="step" key={step.key}>
                <span className={`icon ${step.status}`}>{STEP_ICON[step.status] || "•"}</span>
                <div className="label">
                  {step.label}
                  {step.error ? <div className="err">{step.error}</div> : null}
                </div>
                <span className={`badge ${step.status}`}>
                  {step.status === "skipped" ? "not run" : step.status}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
