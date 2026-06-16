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
| `AZURE_AD_CLIENT_ID` | Entra ID app registration (client) ID. |
| `AZURE_AD_CLIENT_SECRET` | Entra ID client secret value. |
| `AZURE_AD_TENANT_ID` | Tenant ID (`91e22286-3995-43b2-9197-481a21962994`). |
| `NEXTAUTH_SECRET` | Cookie encryption secret. Generate: `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | Full base URL of the deployment (no trailing slash). |
| `ALLOWED_EMAILS` | Optional. Comma-separated allowlist override; blank uses the built-in 5. |

## Authentication (Microsoft SSO)

Sign-in uses **Microsoft Entra ID (Azure AD)**. Access is restricted to an
allowlist — only these accounts can sign in (defined in `lib/auth.ts`, overridable
via `ALLOWED_EMAILS`):

- evan.scarpello@bigthinkcapital.com
- anthony.scarpello@bigthinkcapital.com
- brian@bigthinkcapital.com
- mike.perticone@bigthinkcapital.com
- jared.faux@bigthinkcapital.com

The allowlist is enforced in the sign-in callback, so a rejected user never
receives a session. Every page and API route is gated by `middleware.ts`.

### One-time Entra ID app registration

1. [Entra admin center](https://entra.microsoft.com) → **Applications → App registrations → New registration**.
2. Name it e.g. `Onboarding Helpdesk`. Supported account types: **single tenant**.
3. **Redirect URI** → platform **Web** →
   `https://YOUR-APP.vercel.app/api/auth/callback/azure-ad`
   (add `http://localhost:3000/api/auth/callback/azure-ad` too for local dev).
4. Copy the **Application (client) ID** and **Directory (tenant) ID**.
5. **Certificates & secrets → New client secret** → copy the secret **Value**.
6. **API permissions** → Microsoft Graph → delegated `openid`, `profile`, `email`
   (added by default). No admin consent needed.

> **No key yet?** The app runs with realistic **sample data** so you can see the
> full UI immediately. A yellow banner indicates sample mode.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000  (sample data until a key is set)
```

## Deploy to Vercel

1. Push this repo and import it in Vercel (it auto-detects Next.js).
2. In **Project → Settings → Environment Variables**, add the variables below
   (set each for **Production** — and Preview if you use preview deploys):

   ```
   N8N_BASE_URL            = https://api.bigthinkcapital.com
   N8N_API_KEY             = <n8n public API key>
   N8N_WORKFLOW_ID         = VACEvv12ZYIaAzZi
   AZURE_AD_CLIENT_ID      = <from app registration>
   AZURE_AD_CLIENT_SECRET  = <client secret value>
   AZURE_AD_TENANT_ID      = 91e22286-3995-43b2-9197-481a21962994
   NEXTAUTH_SECRET         = <output of: openssl rand -base64 32>
   NEXTAUTH_URL            = https://YOUR-APP.vercel.app
   ```

3. Make sure the Entra ID redirect URI matches your Vercel domain
   (`https://YOUR-APP.vercel.app/api/auth/callback/azure-ad`).
4. **Redeploy** after adding/changing env vars (Vercel only applies them on a new build).

> Adding a variable in Vercel: **Settings → Environment Variables → Key/Value →
> pick environments → Save**. Secrets are encrypted and never exposed to the browser.

## JSON API

- `GET /api/runs?limit=30` — list of run summaries.
- `GET /api/runs/:id` — full parsed detail for one run.

## Notes & next steps

- **No auth yet** (by request). Since this surfaces temporary passwords, add
  access control (e.g. Vercel password protection or SSO) before sharing broadly.
- If the n8n executions API returns empty, confirm the workflow has
  **"Save successful/failed executions"** enabled and that the API key has
  execution read permission.
