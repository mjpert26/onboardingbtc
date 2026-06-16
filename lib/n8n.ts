import { parseExecution, summarize, type RawExecution } from "./parse";
import { MOCK_EXECUTIONS, mockById } from "./mock";
import type { OnboardingRun, RunSummary } from "./types";

const BASE_URL = (process.env.N8N_BASE_URL || "https://api.bigthinkcapital.com").replace(/\/$/, "");
const API_KEY = process.env.N8N_API_KEY || "";
const WORKFLOW_ID = process.env.N8N_WORKFLOW_ID || "VACEvv12ZYIaAzZi";
const USE_MOCK = process.env.USE_MOCK === "true" || !API_KEY;

export function isMockMode(): boolean {
  return USE_MOCK;
}

async function n8nFetch(path: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/v1${path}`, {
    headers: { "X-N8N-API-KEY": API_KEY, Accept: "application/json" },
    // Always pull fresh data for a helpdesk view.
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`n8n API ${res.status} ${res.statusText} for ${path}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

/** List recent onboarding runs as lightweight summaries (most recent first). */
export async function listRuns(limit = 30): Promise<RunSummary[]> {
  if (USE_MOCK) {
    return MOCK_EXECUTIONS.map((e) => summarize(parseExecution(e)));
  }
  const qs = new URLSearchParams({
    workflowId: WORKFLOW_ID,
    limit: String(limit),
    includeData: "true",
  });
  const json = await n8nFetch(`/executions?${qs.toString()}`);
  const data: RawExecution[] = json?.data ?? [];
  return data.map((e) => summarize(parseExecution(e)));
}

/** Full detail for one run. */
export async function getRun(id: string): Promise<OnboardingRun | null> {
  if (USE_MOCK) {
    const exec = mockById(id);
    return exec ? parseExecution(exec) : null;
  }
  try {
    const json = await n8nFetch(`/executions/${encodeURIComponent(id)}?includeData=true`);
    if (!json || !json.id) return null;
    return parseExecution(json as RawExecution);
  } catch (err: any) {
    if (String(err?.message || "").includes("404")) return null;
    throw err;
  }
}
