import { SYSTEM_CONFIG, systemLabelFor } from "./systems";
import type {
  Credentials,
  EmailInfo,
  HireInfo,
  OnboardingRun,
  RunError,
  RunStatus,
  RunSummary,
  Step,
  StepStatus,
  SystemGroup,
} from "./types";

// ---------------------------------------------------------------------------
// Raw n8n execution shapes (only the parts we read).
// ---------------------------------------------------------------------------

interface RawTaskData {
  startTime?: number;
  executionTime?: number;
  executionStatus?: string;
  error?: any;
  data?: {
    main?: Array<Array<{ json?: Record<string, any> }>>;
  };
}

type RawRunData = Record<string, RawTaskData[]>;

export interface RawExecution {
  id: number | string;
  status?: string;
  finished?: boolean;
  mode?: string;
  startedAt?: string;
  stoppedAt?: string;
  workflowId?: string;
  data?: {
    resultData?: {
      runData?: RawRunData;
      lastNodeExecuted?: string;
      error?: any;
    };
  };
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function getRunData(exec: RawExecution): RawRunData {
  return exec?.data?.resultData?.runData ?? {};
}

/** First JSON output of a node's last run, if it produced any. */
function nodeOutput(runData: RawRunData, node: string): Record<string, any> | undefined {
  const runs = runData[node];
  if (!runs || runs.length === 0) return undefined;
  const last = runs[runs.length - 1];
  return last?.data?.main?.[0]?.[0]?.json;
}

/** Did the node run at all? */
function nodeRan(runData: RawRunData, node: string): boolean {
  return Array.isArray(runData[node]) && runData[node].length > 0;
}

/** The error object from a node's last run, if it failed. */
function nodeError(runData: RawRunData, node: string): any | undefined {
  const runs = runData[node];
  if (!runs || runs.length === 0) return undefined;
  const last = runs[runs.length - 1];
  if (last?.error) return last.error;
  if (last?.executionStatus === "error") return { message: "Node reported an error." };
  return undefined;
}

/** Pull a readable message + http code out of an n8n error object. */
function describeError(err: any): { message: string; httpCode?: number | string; detail?: string } {
  if (!err) return { message: "Unknown error" };
  if (typeof err === "string") return { message: err };

  const httpCode =
    err?.httpCode ??
    err?.context?.httpCode ??
    err?.cause?.response?.status ??
    err?.context?.statusCode;

  let message: string =
    err?.message ||
    err?.description ||
    err?.cause?.message ||
    err?.context?.message ||
    "Workflow step failed";

  // n8n HTTP node often nests the upstream API response body here.
  let detail: string | undefined;
  const responseBody =
    err?.context?.data ??
    err?.cause?.response?.data ??
    err?.cause?.error ??
    err?.context?.response?.body;
  if (responseBody) {
    detail = typeof responseBody === "string" ? responseBody : safeJson(responseBody);
  }
  if (err?.description && err.description !== message) {
    detail = detail ? `${err.description}\n${detail}` : err.description;
  }

  return { message: String(message), httpCode, detail };
}

function safeJson(value: any): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

// ---------------------------------------------------------------------------
// Status rollups
// ---------------------------------------------------------------------------

function stepStatus(runData: RawRunData, nodes: string[]): { status: StepStatus; error?: any } {
  let anyRan = false;
  let firstError: any;
  for (const node of nodes) {
    if (!nodeRan(runData, node)) continue;
    anyRan = true;
    const err = nodeError(runData, node);
    if (err && !firstError) firstError = err;
  }
  if (firstError) return { status: "failed", error: firstError };
  if (anyRan) return { status: "success" };
  return { status: "skipped" };
}

function rollupSystemStatus(steps: Step[]): StepStatus {
  if (steps.some((s) => s.status === "failed")) return "failed";
  if (steps.some((s) => s.status === "success")) return "success";
  if (steps.some((s) => s.status === "running")) return "running";
  return "skipped";
}

function mapRunStatus(exec: RawExecution): RunStatus {
  const s = (exec.status || "").toLowerCase();
  if (s === "success" || s === "error" || s === "waiting" || s === "running") return s as RunStatus;
  if (exec.data?.resultData?.error) return "error";
  if (exec.finished) return "success";
  return "unknown";
}

// ---------------------------------------------------------------------------
// Extraction of hire info / credentials
// ---------------------------------------------------------------------------

function buildHire(runData: RawRunData): HireInfo {
  const u = nodeOutput(runData, "Build User Object") ?? {};
  const firstName = u.firstName ?? "";
  const lastName = u.lastName ?? "";
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || "Unknown hire",
    jobTitle: u.jobTitle ?? "",
    department: u.department ?? "",
    manager: u.manager ?? "",
    location: u.location ?? "",
    locationAddress: u.locationAddress ?? "",
    startDate: u.startDate ?? "",
    salesTeam: u.salesTeam ?? "",
    teamLeader: u.teamLeader ?? "",
  };
}

function buildCredentials(runData: RawRunData): Credentials {
  const u = nodeOutput(runData, "Build User Object") ?? {};
  const form = nodeOutput(runData, "New Hire Form1") ?? {};
  return {
    email: u.email ?? "",
    temporaryPassword: u.temporaryPassword ?? "",
    customLink: u.customLink ?? "",
    docusignLink: u.customLink ? `https://biglinkcapital.com/${u.customLink}` : "",
    personalEmail: form["New Hire Personal E-Mail"] ?? "",
  };
}

// ---------------------------------------------------------------------------
// Public: build a full run + a lightweight summary
// ---------------------------------------------------------------------------

export function parseExecution(exec: RawExecution): OnboardingRun {
  const runData = getRunData(exec);
  const hire = buildHire(runData);
  const credentials = buildCredentials(runData);

  const systems: SystemGroup[] = SYSTEM_CONFIG.map((sys) => {
    const steps: Step[] = sys.steps.map((stepCfg) => {
      const { status, error } = stepStatus(runData, stepCfg.nodes);
      const step: Step = { key: stepCfg.key, label: stepCfg.label, status, nodes: stepCfg.nodes };
      if (error) {
        const d = describeError(error);
        step.error = d.message;
        step.detail = d.detail;
      }
      return step;
    });
    return {
      system: sys.system,
      label: sys.label,
      status: rollupSystemStatus(steps),
      steps,
    };
  });

  // Collect every failing node into the "what went wrong" list.
  const errors: RunError[] = [];
  for (const sys of systems) {
    for (const step of sys.steps) {
      if (step.status === "failed") {
        const node = step.nodes.find((n) => nodeError(runData, n)) ?? step.nodes[0];
        const d = describeError(nodeError(runData, node));
        errors.push({
          node,
          system: systemLabelFor(sys.system),
          message: step.error ?? d.message,
          httpCode: d.httpCode,
          detail: step.detail ?? d.detail,
        });
      }
    }
  }
  // Top-level workflow error not covered by a mapped node.
  const topError = exec.data?.resultData?.error;
  if (topError && errors.length === 0) {
    const d = describeError(topError);
    errors.push({
      node: exec.data?.resultData?.lastNodeExecuted ?? "Workflow",
      system: "Workflow",
      message: d.message,
      httpCode: d.httpCode,
      detail: d.detail,
    });
  }

  const emails = buildEmails(runData, credentials);

  const allSteps = systems.flatMap((s) => s.steps);
  const stepCounts = {
    total: allSteps.length,
    success: allSteps.filter((s) => s.status === "success").length,
    failed: allSteps.filter((s) => s.status === "failed").length,
    skipped: allSteps.filter((s) => s.status === "skipped").length,
  };

  return {
    id: String(exec.id),
    status: mapRunStatus(exec),
    startedAt: exec.startedAt ?? "",
    stoppedAt: exec.stoppedAt ?? "",
    mode: exec.mode ?? "",
    hire,
    credentials,
    systems,
    errors,
    emails,
    stepCounts,
  };
}

function buildEmails(runData: RawRunData, credentials: Credentials): EmailInfo[] {
  const emails: EmailInfo[] = [];

  const welcome = stepStatus(runData, ["Send a message1"]);
  emails.push({
    label: "Welcome email (Outlook)",
    to: credentials.personalEmail || "(personal email)",
    cc: "onboarding@bigthinkcapital.com",
    subject: "Welcome to Big Think Capital",
    status: welcome.status,
  });

  const rcWelcome = stepStatus(runData, ["RingCentral - Send Welcome Email"]);
  emails.push({
    label: "RingCentral welcome email",
    to: credentials.email || "(work email)",
    status: rcWelcome.status,
  });

  return emails;
}

export function summarize(run: OnboardingRun): RunSummary {
  return {
    id: run.id,
    status: run.status,
    startedAt: run.startedAt,
    stoppedAt: run.stoppedAt,
    fullName: run.hire.fullName,
    email: run.credentials.email,
    jobTitle: run.hire.jobTitle,
    location: run.hire.location,
    errorCount: run.errors.length,
  };
}
