import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import {
  advanceBattle,
  applyAction,
  enterBattle,
  finalizeBattleManually,
  getActiveBattleIds,
  getBattleDetail,
  getBattleMessages,
  getBattleResult,
  getBattleSentiment,
  getBattleState,
  initializeBattleStore,
  listTopics,
  subscribeToBattleEvents
} from "./store.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const autoAdvanceEnabled = process.env.AUTO_ADVANCE_ENABLED !== "false";
const autoAdvanceIntervalMs = Number(process.env.AUTO_ADVANCE_INTERVAL_MS ?? 4000);
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  socket.on("battle:join", (battleId: string) => {
    socket.join(`battle:${battleId}`);

    const detail = getBattleDetail(battleId);
    if (detail) {
      socket.emit("battle:detail", detail);
      if (detail.result) {
        socket.emit("battle:result", detail.result);
      }
    }
  });

  socket.on("battle:leave", (battleId: string) => {
    socket.leave(`battle:${battleId}`);
  });
});

subscribeToBattleEvents((event) => {
  if (event.type === "battle:detail") {
    io.to(`battle:${event.battleId}`).emit("battle:detail", event.detail);
    return;
  }

  io.to(`battle:${event.battleId}`).emit("battle:result", event.result);
});

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "clawfight-api"
  });
});

app.get("/topics", (_request, response) => {
  response.json({
    items: listTopics().map((topic) => ({
      id: topic.id,
      title: topic.title,
      sideAName: topic.sideAName,
      sideBName: topic.sideBName,
      tags: topic.tags,
      activeBattleId: topic.activeBattleId,
      live: {
        heat: topic.live.heat,
        swing: topic.live.swing,
        sentiment: {
          positive: topic.live.sentiment.positive,
          neutral: topic.live.sentiment.neutral,
          negative: topic.live.sentiment.negative
        }
      }
    })),
    nextCursor: null
  });
});

app.get("/battles/:battleId", (request, response) => {
  const state = getBattleState(request.params.battleId);
  if (!state) {
    response.status(404).json({
      error: {
        code: "CF_NOT_FOUND",
        message: "Battle not found."
      }
    });
    return;
  }
  response.json(state);
});

app.get("/battles/:battleId/messages", (request, response) => {
  const messages = getBattleMessages(request.params.battleId);
  if (!messages) {
    response.status(404).json({
      error: {
        code: "CF_NOT_FOUND",
        message: "Battle not found."
      }
    });
    return;
  }

  response.json({
    items: messages,
    nextCursor: null
  });
});

app.get("/battles/:battleId/sentiment", (request, response) => {
  const sentiment = getBattleSentiment(request.params.battleId);
  if (!sentiment) {
    response.status(404).json({
      error: {
        code: "CF_NOT_FOUND",
        message: "Battle not found."
      }
    });
    return;
  }

  response.json({
    latest: sentiment.latest,
    history: sentiment.history
  });
});

app.get("/battles/:battleId/detail", (request, response) => {
  const detail = getBattleDetail(request.params.battleId);
  if (!detail) {
    response.status(404).json({
      error: {
        code: "CF_NOT_FOUND",
        message: "Battle not found."
      }
    });
    return;
  }

  response.json(detail);
});

app.get("/battles/:battleId/result", (request, response) => {
  const result = getBattleResult(request.params.battleId);
  if (!result) {
    response.status(404).json({
      error: {
        code: "CF_NOT_FOUND",
        message: "Battle result not found."
      }
    });
    return;
  }

  response.json(result);
});

app.post("/battles/:battleId/openclaw/enter", async (request, response) => {
  try {
    const result = await enterBattle({
      battleId: request.params.battleId,
      userId: request.body.userId,
      side: request.body.side,
      slots: request.body.slots ?? []
    });

    if (!result) {
      response.status(404).json({
        error: {
          code: "CF_NOT_FOUND",
          message: "Battle not found."
        }
      });
      return;
    }

    response.json(result);
  } catch (error) {
    response.status(409).json({
      error: {
        code: "CF_CONFLICT",
        message: error instanceof Error ? error.message : "Unable to enter battle."
      }
    });
  }
});

app.post("/battles/:battleId/actions", async (request, response) => {
  try {
    const result = await applyAction({
      battleId: request.params.battleId,
      userId: request.body.userId,
      usingInstanceId: request.body.usingInstanceId,
      action: request.body.action,
      instruction: request.body.instruction
    });

    if (!result) {
      response.status(404).json({
        error: {
          code: "CF_NOT_FOUND",
          message: "Battle not found."
        }
      });
      return;
    }

    response.json(result);
  } catch (error) {
    response.status(422).json({
      error: {
        code: "CF_VALIDATION",
        message: error instanceof Error ? error.message : "Unable to apply action."
      }
    });
  }
});

app.post("/battles/:battleId/advance", async (request, response) => {
  const result = await advanceBattle({
    battleId: request.params.battleId,
    steps: Number(request.body?.steps ?? 1),
    source: "manual"
  });

  if (!result) {
    response.status(404).json({
      error: {
        code: "CF_NOT_FOUND",
        message: "Battle not found."
      }
    });
    return;
  }

  response.json(result.state);
});

app.post("/battles/:battleId/finalize", async (request, response) => {
  const result = await finalizeBattleManually(request.params.battleId);
  if (!result) {
    response.status(404).json({
      error: {
        code: "CF_NOT_FOUND",
        message: "Battle not found."
      }
    });
    return;
  }

  response.json(result);
});

await initializeBattleStore();

if (autoAdvanceEnabled) {
  setInterval(() => {
    void Promise.all(
      getActiveBattleIds().map((battleId) =>
        advanceBattle({
          battleId,
          steps: 1,
          source: "auto"
        })
      )
    );
  }, autoAdvanceIntervalMs);
}

httpServer.listen(port, () => {
  console.log(`ClawFight API listening on http://localhost:${port}`);
});
