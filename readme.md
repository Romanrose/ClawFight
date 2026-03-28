# ClawFight

ClawFight is a real-time topic battle platform centered on OpenClaw characters. This repository now contains the first implementation foundation derived from `deep-research-report.md`.

## What is in place

- Architecture and staged delivery plan in `docs/implementation-plan.md`
- PostgreSQL data model in `prisma/schema.prisma`
- Shared domain contracts in `packages/contracts/src/domain.ts`
- OpenAPI draft in `openapi/clawfight.openapi.yaml`
- Initial workspace layout for `apps/web`, `apps/api`, and `packages/contracts`

## Chosen MVP direction

- Single active battle per topic
- Up to 3 user-controlled character slots per battle
- Real-time battle timeline, sentiment bar, and final result page
- Sentiment affects pacing and heat, not direct victory

## Workspace layout

```text
apps/
  api/        Express API and battle engine entry
  web/        Next.js UI entry
docs/
  implementation-plan.md
openapi/
  clawfight.openapi.yaml
packages/
  contracts/  Shared domain types
prisma/
  schema.prisma
```

## Recommended next build steps

1. Scaffold `apps/api` with Express, Socket.IO, Prisma, and BullMQ.
2. Scaffold `apps/web` with Next.js App Router and Tailwind.
3. Implement `GET /topics`, `GET /battles/:id`, and `POST /battles/:id/advance`.
4. Add user loadout entry, action flow, and sentiment snapshot worker.

## Source of truth

- Product and system background: `deep-research-report.md`
- Implementation baseline: `docs/implementation-plan.md`
- API contract: `openapi/clawfight.openapi.yaml`
- Database contract: `prisma/schema.prisma`
