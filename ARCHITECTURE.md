# Architecture

This document describes the architecture of **Last 2 Lines**, a collaborative
poetry platform. The application runs on **Vercel** (compute, hosting, AI
gateway) and uses **AWS** for its data and AI-inference layers. Admin
authentication is handled by **Supabase Auth**.

## High-Level Overview

```
                       ┌──────────────────────────────────────────────┐
                       │                   VERCEL                       │
                       │                                                │
   Browser  ───────►   │  Edge Middleware (Supabase session refresh)    │
   (visitors           │            │                                   │
    & admins)          │            ▼                                   │
                       │  Next.js 16 App Router (React 19)              │
                       │   • Server Components (read via lib/queries)   │
                       │   • Server Actions   (write via lib/actions)   │
                       │   • Fluid compute functions                    │
                       │            │                 │                 │
                       │            │                 │ Vercel AI       │
                       └────────────┼─────────────────┼─Gateway─────────┘
                                    │                  │
                   IAM auth (OIDC)  │                  │  OIDC
                                    ▼                  ▼
                       ┌────────────────────┐  ┌────────────────────┐
                       │   AWS RDS Postgres │  │    AWS Bedrock      │
                       │  (campaigns, etc.) │  │ (Amazon Nova Micro) │
                       └────────────────────┘  └────────────────────┘

                       ┌────────────────────┐
   admin login  ─────► │   Supabase Auth     │  (sessions via SSR cookies)
                       └────────────────────┘
```

The platform has two audiences:

- **Public visitors** browse campaigns and submit two-line couplets. No login
  required; submissions are validated and run through AI moderation.
- **Admins** sign in (Supabase Auth) to manage campaigns, moderate the
  contribution queue, edit couplets, and ban authors.

## Vercel Layer

Vercel hosts the entire Next.js application and provides three runtime
concerns: compute, session middleware, and the AI Gateway.

### Next.js App Router (compute)

- **Server Components** render pages and fetch data directly through
  `lib/queries.ts`. These read functions are marked `server-only`, so query
  code never ships to the browser.
- **Server Actions** in `lib/actions.ts` handle every mutation (submit a
  couplet, moderate, create/update/delete campaigns, ban authors, sign out).
  Actions validate input server-side and call `revalidatePath` to keep cached
  pages fresh.
- **Fluid compute** is used; database clients are created per-invocation (never
  stored in module globals) and the connection pool is registered with
  `attachDatabasePool` so connections are managed correctly across invocations.

### Edge Middleware

`middleware.ts` runs on every non-static request and calls
`lib/supabase/proxy.ts` to refresh the admin Supabase session cookie. This
keeps admin sessions alive without per-page boilerplate. Static assets and
images are excluded via the matcher config.

### Vercel AI Gateway

AI moderation calls (`lib/ai-moderation.ts`) go through the Vercel AI Gateway
using the AI SDK. The gateway is **zero-config** in this environment: the
Vercel OIDC token authenticates the downstream AWS Bedrock provider
automatically, so no provider SDK or API key is wired into the app.

## AWS Layer

AWS provides both the system of record (PostgreSQL) and AI inference (Bedrock).
Crucially, **both are accessed without long-lived secrets** — Vercel's OIDC
token is exchanged for short-lived AWS credentials via an IAM role
(`AWS_ROLE_ARN`).

### AWS RDS for PostgreSQL (database)

- Defined in `lib/db.ts` using the `pg` connection pool.
- Authentication uses **IAM database authentication**: `@aws-sdk/rds-signer`
  generates a short-lived auth token on each connection (`password: () =>
  signer.getAuthToken()`) instead of a static password.
- Credentials are obtained through `awsCredentialsProvider` from
  `@vercel/functions/oidc`, which assumes the configured IAM role using the
  Vercel OIDC identity. No AWS access keys are stored in the project.
- Connections use TLS and the pool is capped (`max: 20`).

**Data model (core tables):**

- `campaigns` — campaign metadata, status, AI-moderation settings, dates.
- `contributions` — submitted couplets (`line_one`, `line_two`), their status
  (`pending` / `approved` / `rejected`), and `sequence_number` for poem order.
- `authors` — contributors keyed by email, with `active` / `banned` status.
- `moderation_settings` — per-campaign moderation configuration.

Approved contributions are assigned the next `sequence_number` within a
campaign so the shared poem stays correctly ordered. Deleting a campaign
cascades to its contributions and settings.

### AWS Bedrock (AI moderation)

- Uses **Amazon Nova Micro** (`amazon/nova-micro`), the cheapest Bedrock text
  model, reached through the Vercel AI Gateway.
- `moderateCouplet` (in `lib/ai-moderation.ts`) sends the couplet plus campaign
  context and a level-specific system prompt (`lenient` / `standard` /
  `strict`), and uses a Zod schema to get a structured
  `{ decision, confidence, reason }` result.
- The function **never throws**: on any error it returns a safe `review`
  fallback so submissions are queued for a human rather than lost.

## Authentication: Supabase

Admin authentication is handled by **Supabase Auth**, separate from the AWS
data layer:

- `lib/supabase/server.ts` creates a per-request SSR client (cookie-based
  sessions). A new client is created within each function — never stored in a
  global — which matters under Fluid compute.
- `lib/supabase/client.ts` provides the browser client for the login flow.
- `middleware.ts` + `lib/supabase/proxy.ts` refresh sessions on each request.
- Admin-only Server Actions call `requireAdmin()`, which verifies a Supabase
  user before performing any privileged mutation.

Public contribution submission requires no authentication — it relies entirely
on server-side validation and AI/human moderation.

## Request Flows

### Public submission

1. Visitor submits a couplet from a campaign page (client-side validation
   first: character limits, required fields, consent).
2. The `submitContribution` Server Action re-validates server-side and confirms
   the campaign is open.
3. If AI moderation is enabled, the couplet is sent to AWS Bedrock; an
   `approve` result is published immediately (with a sequence number), `reject`
   is stored as rejected, and anything else stays `pending`.
4. The author is upserted in RDS by email (banned authors are blocked) and the
   contribution is written. Affected pages are revalidated.

### Admin moderation

1. Admin signs in via Supabase Auth; the session cookie is refreshed by edge
   middleware on subsequent requests.
2. Dashboard Server Components read pending contributions and aggregates from
   RDS via `lib/queries.ts`.
3. Admin actions (`moderateContribution`, `editContribution`,
   `setAuthorStatus`, campaign CRUD) run through `requireAdmin()` and mutate
   RDS, then revalidate the dashboard and public pages.

## Security Notes

- **No static cloud secrets**: AWS RDS and Bedrock are both accessed using
  short-lived credentials derived from Vercel OIDC + an IAM role.
- **Parameterized SQL** everywhere to prevent injection.
- **Server-side validation** on all mutations; the client is never trusted.
- **Privileged actions gated** behind `requireAdmin()` (Supabase session).
- **Fail-safe moderation**: AI errors fall back to human review rather than
  auto-approving.
