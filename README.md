# Last 2 Lines

A collaborative poetry platform where the public contributes two-line couplets to themed campaigns, building a shared poem one verse at a time. Submissions are screened by AI auto-moderation and managed through an admin dashboard.

Built with [Next.js](https://nextjs.org) and [v0](https://v0.app), deployed on [Vercel](https://vercel.com) with an [AWS](https://aws.amazon.com) data layer.

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below — start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` automatically deploys.

[Continue working on v0 →](https://v0.app/chat/projects/prj_momYygRFatvYncyFUR9WEJ8Bg2kU)

## Features

- **Public campaigns** — Browse active campaigns and read the evolving shared poem on each campaign page.
- **Two-line submissions** — Anyone can contribute a couplet with client- and server-side validation (character limits, required fields, consent).
- **AI auto-moderation** — Submissions are classified `approve` / `reject` / `review` by Amazon Nova Micro (AWS Bedrock) via the Vercel AI Gateway, with per-campaign moderation levels.
- **Admin dashboard** — Authenticated admins manage campaigns, moderate the contribution queue, edit couplets, and ban authors.
- **Light/dark mode** — Theme-aware UI throughout, powered by `next-themes`.

## Tech Stack

| Layer            | Technology                                              |
| ---------------- | ------------------------------------------------------- |
| Framework        | Next.js 16 (App Router, React 19, Server Actions)       |
| Styling          | Tailwind CSS v4, shadcn/ui, lucide-react icons          |
| Hosting          | Vercel (Fluid compute, edge middleware, Analytics)      |
| Database         | AWS RDS PostgreSQL via `pg`, IAM auth (RDS Signer)      |
| Auth             | Supabase Auth (admin sessions, SSR cookies)             |
| AI               | AWS Bedrock (Amazon Nova Micro) via Vercel AI Gateway   |
| Validation       | Zod                                                     |

For a deeper explanation of how these pieces fit together, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Getting Started

Install dependencies and run the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

The app expects the following variables (managed automatically in v0/Vercel):

| Variable                        | Purpose                                         |
| ------------------------------- | ----------------------------------------------- |
| `PGHOST`                        | AWS RDS PostgreSQL host                          |
| `PGDATABASE`                    | Database name (defaults to `postgres`)           |
| `PGUSER`                        | Database user (defaults to `postgres`)           |
| `AWS_ROLE_ARN`                  | IAM role assumed via Vercel OIDC for DB + Bedrock|
| `AWS_REGION`                    | AWS region for RDS and Bedrock                   |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL (admin auth)                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (admin auth)                   |

Database access uses short-lived IAM auth tokens rather than a static password — no DB password is stored.

## Project Structure

```
app/                  Next.js App Router routes
  page.tsx            Public home / campaign directory
  about/              About page
  campaign/[slug]/    Public campaign + shared poem
  dashboard/          Admin dashboard (campaigns, contributions, authors, settings)
  auth/               Supabase login, callback, error routes
components/           UI components (admin/, ui/, site-level)
lib/
  db.ts               AWS RDS Postgres pool with IAM auth
  queries.ts          Read queries (server-only)
  actions.ts          Server Actions (mutations + auth)
  ai-moderation.ts    AWS Bedrock couplet moderation
  supabase/           Supabase SSR client + session proxy
middleware.ts         Refreshes Supabase sessions on each request
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [v0 Documentation](https://v0.app/docs)
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system architecture (Vercel + AWS)
