# Onboarding Helpdesk Dashboard

A read-only web dashboard that lets **Level 1 helpdesk agents** see the results of
the Big Think Capital **New Hire Onboarding** n8n workflow
(`VACEvv12ZYIaAzZi`) — at a glance, per new hire:

- **Logins & credentials** — work email, temporary password, DocuSign short link, personal email (one-click copy)
- **What went wrong** — every failed step with the API error message + HTTP status + the raw upstream response body
- **Emails sent** — welcome email + RingCentral welcome, and whether they went out
- **System-by-system** — Microsoft 365, Salesforce, Box, RingCentral, Slack, Calendly, Trainual, Jira, DocuSign short link, and manual approvals — each step marked completed / failed / not run
- **Hire details** — manager, sales team, location, start date

It reads directly from the n8n **executions API**, so there is nothing extra to
maintain — when the workflow runs, the run shows up here.

## How it works

```
n8n executions API  ──►  /lib/n8n.ts (fetch + key)  ──►  /lib/parse.ts (map nodes → systems/steps)  ──►  pages + /api/runs
```

- `lib/systems.ts` — maps each workflow node name to a friendly system + step.
- `lib/parse.ts` — turns a raw n8n execution into the helpdesk model (credentials, per-step status, errors, emails).
- `lib/n8n.ts` — calls `GET /api/v1/executions` / `GET /api/v1/executions/:id?includeData=true`. Falls back to built-in sample data when no API key is set.
- `app/` — Next.js App Router pages (list + detail) and JSON API routes.

## Configuration

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
| --- | --- |
| `N8N_BASE_URL` | n8n base URL, e.g. `https://api.bigthinkcapital.com` |
| `N8N_API_KEY` | n8n public API key (Settings → API). Needs permission to read executions. |
| `N8N_WORKFLOW_ID` | Defaults to `VACEvv12ZYIaAzZi` (New Hire Onboarding). |
| `USE_MOCK` | `true` forces sample data even with a key set. |

> **No key yet?** The app runs with realistic **sample data** so you can see the
> full UI immediately. A yellow banner indicates sample mode.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000  (sample data until a key is set)
```

## Deploy to Vercel

1. Push this repo and import it in Vercel (it auto-detects Next.js).
2. In **Project → Settings → Environment Variables**, add `N8N_BASE_URL`,
   `N8N_API_KEY`, and `N8N_WORKFLOW_ID`.
3. Deploy. The dashboard reads live runs with no further setup.

## JSON API

- `GET /api/runs?limit=30` — list of run summaries.
- `GET /api/runs/:id` — full parsed detail for one run.

## Notes & next steps

- **No auth yet** (by request). Since this surfaces temporary passwords, add
  access control (e.g. Vercel password protection or SSO) before sharing broadly.
- If the n8n executions API returns empty, confirm the workflow has
  **"Save successful/failed executions"** enabled and that the API key has
  execution read permission.
