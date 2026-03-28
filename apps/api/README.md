# API App

Current scaffold:

- Express server with JSON and CORS enabled
- File-backed runtime persistence for battle state
- `GET /health`
- `GET /topics`
- `GET /battles/:battleId`
- `GET /battles/:battleId/messages`
- `GET /battles/:battleId/sentiment`
- `GET /battles/:battleId/detail`

Useful commands from repo root:

- `npm run dev:api`
- `npm run typecheck:api`
- `npm run build:api`

Persistence notes:

- Default file: `apps/api/data/runtime-store.json`
- Override with `BATTLE_STORE_FILE=/absolute/or/relative/path.json`
