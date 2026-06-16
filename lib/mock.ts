import type { RawExecution } from "./parse";

// Realistic sample executions used when no N8N_API_KEY is configured (or when
// USE_MOCK=true). Shaped exactly like the n8n REST API response for
// GET /executions/:id?includeData=true so the parser exercises real code paths.

function ok(json: Record<string, any>) {
  return [
    {
      startTime: Date.now(),
      executionTime: 120,
      executionStatus: "success",
      data: { main: [[{ json }]] },
    },
  ];
}

function failed(message: string, httpCode: number, body: any) {
  return [
    {
      startTime: Date.now(),
      executionTime: 90,
      executionStatus: "error",
      error: {
        message,
        name: "NodeApiError",
        httpCode: String(httpCode),
        context: { httpCode: String(httpCode), data: body },
      },
      data: { main: [[]] },
    },
  ];
}

const larryUser = {
  firstName: "Larry",
  lastName: "Nicastro",
  jobTitle: "Funding Expert",
  department: "Sales",
  manager: "Zachary Santangelo",
  location: "Melville",
  locationAddress: "201 Old Country Road, Suite 302, Melville, NY 11747",
  startDate: "2026-06-15",
  email: "larry.nicastro@bigthinkcapital.com",
  customLink: "larry-n",
  temporaryPassword: "HarborObsidian47#",
  teamLeader: "005Hp00000jGsVHIA0",
  salesTeam: "Team Zach",
};

const larryForm = {
  "First Name": "Larry",
  "Last Name": "Nicastro",
  "Job Title": "Funding Expert",
  Department: "Sales",
  Manager: "Zachary Santangelo",
  Location: "Melville",
  "Start Date": "2026-06-15",
  "New Hire Personal E-Mail": "padebella14@aol.com",
};

// Run 1: mostly successful, but RingCentral failed (demonstrates error panel).
const larryRun: RawExecution = {
  id: 482311,
  status: "error",
  finished: true,
  mode: "trigger",
  startedAt: "2026-06-15T13:02:11.000Z",
  stoppedAt: "2026-06-15T13:05:48.000Z",
  workflowId: "VACEvv12ZYIaAzZi",
  data: {
    resultData: {
      lastNodeExecuted: "RingCentral - Create User",
      runData: {
        "New Hire Form1": ok(larryForm),
        "Build User Object": ok(larryUser),
        "Kutt - Create Short Link": ok({ address: "biglinkcapital.com/larry-n" }),
        "Salesforce - Create User1": ok({ id: "005Hp00000abcdEFGHI", success: true }),
        "Salesforce - Update User": ok({ success: true }),
        "Salesforce - Update User1": ok({ success: true }),
        "Salesforce - Update User2": ok({ success: true }),
        "Salesforce - Update User3": ok({ success: true }),
        "Salesforce - Add to Public Group": ok({ success: true }),
        "Salesforce - Update User add slack ID": ok({ success: true }),
        "Generate JWT3": ok({ token: "jwt..." }),
        "Exchange JWT for Token3": ok({ access_token: "box..." }),
        "Box - Create User": ok({ id: "39211882211", name: "Larry Nicastro" }),
        "Box - Add user to sales group": ok({ id: "membership-1" }),
        'Box - Create User Folder in "Agents"': ok({ id: "folder-99812" }),
        "Calendly - Invite User": ok({ resource: { status: "pending" } }),
        "Invite to Trainual": ok({ id: "trainual-7781" }),
        "Slack - Invite User1": ok({ ok: true }),
        "Slack - Get User": ok({ user: { id: "U09ABCXYZ" } }),
        "Send a message": ok({ ok: true, ts: "1718456531.001" }),
        "Slack - Add to NH Group": ok({ ok: true }),
        "Get Token2": ok({ access_token: "graph..." }),
        "Create User": ok({ id: "aad-77ac-1122", userPrincipalName: "larry.nicastro@bigthinkcapital.com" }),
        "Update User": ok({}),
        "Assign License": ok({ id: "license-ok" }),
        "Enable mail only for desktop and mobile": ok({}),
        "Create Approvals Folder": ok({ id: "fldr-1" }),
        "Create Competing Notices Folder": ok({ id: "fldr-2" }),
        "Create Pending Items Folder": ok({ id: "fldr-3" }),
        "Create Signed Folder": ok({ id: "fldr-4" }),
        "Create Approvals Rule": ok({ id: "rule-1" }),
        "Jira Issue Search by Name1": ok({ issues: [{ key: "IS-4821" }] }),
        "Add a comment": ok({ id: "comment-1" }),
        "RingCentral - Create User": failed(
          "The resource you are trying to create already exists.",
          409,
          { errorCode: "CMN-405", message: "Extension with this email already exists" }
        ),
      },
      error: {
        message: "The resource you are trying to create already exists.",
        name: "NodeApiError",
        httpCode: "409",
        node: { name: "RingCentral - Create User" },
      },
    },
  },
};

// Run 2: clean successful onboarding for a different hire.
const ramonaUser = {
  firstName: "Ramona",
  lastName: "Petrov",
  jobTitle: "Renewals Specialist",
  department: "Sales",
  manager: "Mike Santos",
  location: "Miami",
  locationAddress: "21500 Biscayne Blvd, Suite 1430, Aventura, FL 33180",
  startDate: "2026-06-16",
  email: "ramona.petrov@bigthinkcapital.com",
  customLink: "ramona-p",
  temporaryPassword: "CedarLagoon82!",
  teamLeader: "005Hp00000jGsUSIA0",
  salesTeam: "Renewals",
};

const ramonaForm = {
  "First Name": "Ramona",
  "Last Name": "Petrov",
  "Job Title": "Renewals Specialist",
  Department: "Sales",
  Manager: "Mike Santos",
  Location: "Miami",
  "Start Date": "2026-06-16",
  "New Hire Personal E-Mail": "ramona.petrov@gmail.com",
};

const ramonaRun: RawExecution = {
  id: 482350,
  status: "success",
  finished: true,
  mode: "trigger",
  startedAt: "2026-06-16T09:14:02.000Z",
  stoppedAt: "2026-06-16T09:18:20.000Z",
  workflowId: "VACEvv12ZYIaAzZi",
  data: {
    resultData: {
      lastNodeExecuted: "Add a comment",
      runData: {
        "New Hire Form1": ok(ramonaForm),
        "Build User Object": ok(ramonaUser),
        "Kutt - Create Short Link": ok({ address: "biglinkcapital.com/ramona-p" }),
        "Salesforce - Create User1": ok({ id: "005Hp00000zzzzEFGHI", success: true }),
        "Salesforce - Update User": ok({ success: true }),
        "Salesforce - Update User1": ok({ success: true }),
        "Salesforce - Update User2": ok({ success: true }),
        "Salesforce - Update User3": ok({ success: true }),
        "Salesforce - Add to Public Group": ok({ success: true }),
        "Salesforce - Update User add slack ID": ok({ success: true }),
        "Box - Create User": ok({ id: "39211999000" }),
        "Box - Add user to sales group": ok({ id: "membership-2" }),
        'Box - Create User Folder in "Agents"': ok({ id: "folder-99999" }),
        "Calendly - Invite User": ok({ resource: { status: "pending" } }),
        "Invite to Trainual": ok({ id: "trainual-8000" }),
        "Slack - Invite User1": ok({ ok: true }),
        "Slack - Get User": ok({ user: { id: "U09ZZZ111" } }),
        "Send a message": ok({ ok: true }),
        "Slack - Add to NH Group": ok({ ok: true }),
        "Create User": ok({ id: "aad-99ff-3344", userPrincipalName: "ramona.petrov@bigthinkcapital.com" }),
        "Update User": ok({}),
        "Assign License": ok({ id: "license-ok" }),
        "Enable mail only for desktop and mobile": ok({}),
        "Create Approvals Folder": ok({ id: "fldr-a" }),
        "Create Competing Notices Folder": ok({ id: "fldr-b" }),
        "Create Pending Items Folder": ok({ id: "fldr-c" }),
        "Create Signed Folder": ok({ id: "fldr-d" }),
        "RingCentral - Create User": ok({ id: "rc-55221" }),
        "RingCentral - Turn on Call Recording": ok({}),
        "Jira Issue Search by Name1": ok({ issues: [{ key: "IS-4855" }] }),
        "Add a comment": ok({ id: "comment-2" }),
      },
    },
  },
};

export const MOCK_EXECUTIONS: RawExecution[] = [ramonaRun, larryRun];

export function mockById(id: string): RawExecution | undefined {
  return MOCK_EXECUTIONS.find((e) => String(e.id) === String(id));
}
