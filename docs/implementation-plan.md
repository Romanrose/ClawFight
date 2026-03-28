# ClawFight Implementation Plan

This document narrows the research report into a buildable MVP.

## Product slice

The first release only needs one loop:

1. Topic lobby shows live battle cards.
2. User enters a battle already in progress.
3. User picks a side and brings up to 3 OpenClaw characters.
4. System and user-triggered messages update heat, swing, score, and sentiment.
5. Battle ends automatically and exposes a result page.

## Finalized technical direction

- Frontend: Next.js App Router + Tailwind
- API: Express + Socket.IO
- Persistence: PostgreSQL + Prisma
- Cache/queue: Redis + BullMQ
- Async jobs: LLM message generation, sentiment classification, result summary

## Bounded contexts

### Topic

- Maintains the debate prompt, sides, tags, and active battle id.
- Lobby reads live summary from topic plus battle snapshot.

### Battle

- Owns battle state, phase progression, heat, swing, and scores.
- Applies automatic turns and user-triggered actions.
- Decides whether the battle ends.

### Character

- Defines persona, side bias, speaking style, and action pool.
- User-selected characters become battle instances.

### Sentiment

- Stores per-message classification and aggregate snapshots.
- Only influences pacing and scheduler weights in MVP.

### Result

- Stores outcome type, winner, MVP, highlights, and summary text.

## Delivery order

### Phase 1: foundation

- Scaffold `apps/api` and `apps/web`
- Create Prisma schema and shared contracts
- Publish OpenAPI draft for frontend/backend parallel work

### Phase 2: battle loop

- Implement topic listing and battle read endpoints
- Implement `advanceBattle`
- Persist messages and battle state

### Phase 3: player intervention

- Implement `openclaw/enter`
- Enforce max 3 slots per user per battle
- Implement `actions` with cooldown and rate limit hooks

### Phase 4: sentiment and results

- Add `SentimentRecord` and `SentimentSnapshot`
- Surface battle sentiment endpoint and UI bar
- Implement finalize flow and result endpoint

### Phase 5: hardening

- Add auth hooks, audit logging, and observability
- Add background workers and queue retries

## Immediate implementation target

The next code step should be:

1. Install runtime dependencies.
2. Scaffold Express and Next.js apps.
3. Generate Prisma client and create the first migration.
4. Build the first vertical slice: `GET /topics` -> battle lobby card.
