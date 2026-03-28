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
- `POST /battles/:battleId/advance`
- Background auto-advance loop for active battles
- Rolling sentiment snapshot history per battle

Useful commands from repo root:

- `npm run dev:api`
- `npm run typecheck:api`
- `npm run build:api`

Persistence notes:

- Default file: `apps/api/data/runtime-store.json`
- Override with `BATTLE_STORE_FILE=/absolute/or/relative/path.json`

Runtime notes:

- Auto-advance is enabled by default
- Tune with `AUTO_ADVANCE_ENABLED` and `AUTO_ADVANCE_INTERVAL_MS`
