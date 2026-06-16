// Shared types for the onboarding helpdesk dashboard.

export type RunStatus = "success" | "error" | "waiting" | "running" | "unknown";

export type StepStatus = "success" | "failed" | "skipped" | "running";

/** A single logical step within a system (may map to one or more n8n nodes). */
export interface Step {
  key: string;
  label: string;
  status: StepStatus;
  /** The n8n node names that back this step. */
  nodes: string[];
  /** Human-readable error message when status is "failed". */
  error?: string;
  /** Extra context worth surfacing (created IDs, links, etc.). */
  detail?: string;
}

/** A group of steps belonging to one external system (Salesforce, Box, ...). */
export interface SystemGroup {
  system: string;
  label: string;
  status: StepStatus;
  steps: Step[];
}

/** A single failure pulled out of the run for the "what went wrong" panel. */
export interface RunError {
  node: string;
  system: string;
  message: string;
  httpCode?: number | string;
  detail?: string;
}

export interface EmailInfo {
  label: string;
  to: string;
  cc?: string;
  subject?: string;
  status: StepStatus;
}

export interface HireInfo {
  firstName: string;
  lastName: string;
  fullName: string;
  jobTitle: string;
  department: string;
  manager: string;
  location: string;
  locationAddress: string;
  startDate: string;
  salesTeam: string;
  teamLeader: string;
}

export interface Credentials {
  email: string;
  temporaryPassword: string;
  customLink: string;
  docusignLink: string;
  personalEmail: string;
}

export interface OnboardingRun {
  id: string;
  status: RunStatus;
  startedAt: string;
  stoppedAt: string;
  mode: string;
  hire: HireInfo;
  credentials: Credentials;
  systems: SystemGroup[];
  errors: RunError[];
  emails: EmailInfo[];
  /** Total / succeeded step counts for the header summary. */
  stepCounts: { total: number; success: number; failed: number; skipped: number };
}

export interface RunSummary {
  id: string;
  status: RunStatus;
  startedAt: string;
  stoppedAt: string;
  fullName: string;
  email: string;
  jobTitle: string;
  location: string;
  errorCount: number;
}
