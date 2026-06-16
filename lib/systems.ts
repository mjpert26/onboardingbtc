// Maps the n8n New Hire Onboarding workflow nodes into helpdesk-friendly
// systems and steps. The node names here must match the workflow exactly
// (see workflow VACEvv12ZYIaAzZi).

export interface StepConfig {
  key: string;
  label: string;
  nodes: string[];
}

export interface SystemConfig {
  system: string;
  label: string;
  steps: StepConfig[];
}

export const SYSTEM_CONFIG: SystemConfig[] = [
  {
    system: "microsoft365",
    label: "Microsoft 365 (Email & Login)",
    steps: [
      { key: "m365_create", label: "Create mailbox / account", nodes: ["Create User"] },
      { key: "m365_update", label: "Set name, title & location", nodes: ["Update User"] },
      { key: "m365_license", label: "Assign license", nodes: ["Assign License"] },
      {
        key: "m365_mailcfg",
        label: "Restrict mail to OWA / mobile",
        nodes: ["Enable mail only for desktop and mobile"],
      },
      {
        key: "m365_folders",
        label: "Create Heron mail folders",
        nodes: [
          "Create Approvals Folder",
          "Create Competing Notices Folder",
          "Create Pending Items Folder",
          "Create Signed Folder",
        ],
      },
      {
        key: "m365_rules",
        label: "Create inbox routing rules",
        nodes: [
          "Create Approvals Rule",
          "Create Competing Notices Rule",
          "Create Pending Items Rule",
          "Create Signed Rule",
          "Create Approvals Rule 2",
          "Create Competing Notices Rule 2",
          "Create Pending Items Rule 2",
        ],
      },
    ],
  },
  {
    system: "salesforce",
    label: "Salesforce",
    steps: [
      { key: "sf_create", label: "Create Salesforce user", nodes: ["Salesforce - Create User1"] },
      {
        key: "sf_permsets",
        label: "Assign permission sets",
        nodes: ["Salesforce - Update User"],
      },
      { key: "sf_role", label: "Set role (Sales)", nodes: ["Salesforce - Update User1"] },
      {
        key: "sf_callcenter",
        label: "Set call center & hire details",
        nodes: ["Salesforce - Update User2"],
      },
      { key: "sf_license", label: "Assign package license", nodes: ["Salesforce - Update User3"] },
      {
        key: "sf_group",
        label: "Add to sales public group",
        nodes: ["Salesforce - Add to Public Group"],
      },
      {
        key: "sf_slackid",
        label: "Save Slack ID to Salesforce",
        nodes: ["Salesforce - Update User add slack ID"],
      },
    ],
  },
  {
    system: "box",
    label: "Box",
    steps: [
      { key: "box_create", label: "Create Box user", nodes: ["Box - Create User"] },
      {
        key: "box_group",
        label: "Add to sales group",
        nodes: ["Box - Add user to sales group"],
      },
      {
        key: "box_folder",
        label: 'Create user folder in "Agents"',
        nodes: ['Box - Create User Folder in "Agents"'],
      },
      { key: "box_template", label: "Copy template files", nodes: ["Box - Create Template"] },
    ],
  },
  {
    system: "ringcentral",
    label: "RingCentral",
    steps: [
      { key: "rc_create", label: "Create extension / user", nodes: ["RingCentral - Create User"] },
      {
        key: "rc_recording",
        label: "Turn on call recording",
        nodes: ["RingCentral - Turn on Call Recording"],
      },
      { key: "rc_number", label: "Assign phone number", nodes: ["Assign Number"] },
      {
        key: "rc_welcome",
        label: "Send welcome email",
        nodes: ["RingCentral - Send Welcome Email"],
      },
      {
        key: "rc_sms",
        label: "Subscribe to SMS task system",
        nodes: ["Add to sms  task system", "Add to sms  task system1"],
      },
    ],
  },
  {
    system: "slack",
    label: "Slack",
    steps: [
      { key: "slack_invite", label: "Invite to workspace", nodes: ["Slack - Invite User1"] },
      { key: "slack_lookup", label: "Look up Slack user", nodes: ["Slack - Get User"] },
      { key: "slack_welcome", label: "Send welcome DM", nodes: ["Send a message"] },
      {
        key: "slack_nhgroup",
        label: "Add to New Hire user group",
        nodes: ["Slack - Add to NH Group"],
      },
      {
        key: "slack_channels",
        label: "Add to team channels",
        nodes: ["Invite a user to a channel"],
      },
    ],
  },
  {
    system: "calendly",
    label: "Calendly",
    steps: [{ key: "cal_invite", label: "Invite to organization", nodes: ["Calendly - Invite User"] }],
  },
  {
    system: "trainual",
    label: "Trainual",
    steps: [{ key: "trainual_invite", label: "Create Trainual user", nodes: ["Invite to Trainual"] }],
  },
  {
    system: "shortlink",
    label: "DocuSign Short Link",
    steps: [
      { key: "kutt_link", label: "Create biglinkcapital short link", nodes: ["Kutt - Create Short Link"] },
    ],
  },
  {
    system: "jira",
    label: "Jira / IT Service Desk",
    steps: [
      { key: "jira_search", label: "Find onboarding ticket", nodes: ["Jira Issue Search by Name1"] },
      { key: "jira_comment", label: "Post credentials to ticket", nodes: ["Add a comment"] },
    ],
  },
  {
    system: "approvals",
    label: "Manual Approvals (Azure / Proofpoint)",
    steps: [
      {
        key: "slack_approval",
        label: "Slack approval (import Azure + Proofpoint)",
        nodes: ["Send message and wait for response"],
      },
    ],
  },
];

/** Friendly system label lookup, including a fallback for unmapped nodes. */
export function systemLabelFor(systemKey: string): string {
  const found = SYSTEM_CONFIG.find((s) => s.system === systemKey);
  return found ? found.label : systemKey;
}
