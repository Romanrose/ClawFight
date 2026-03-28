import cors from "cors";
import express from "express";
import {
  applyAction,
  enterBattle,
  finalizeBattleManually,
  getBattleDetail,
  getBattleMessages,
  getBattleResult,
  getBattleSentiment,
  getBattleState,
  listTopics
} from "./store.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

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
  const latest = getBattleSentiment(request.params.battleId);
  if (!latest) {
    response.status(404).json({
      error: {
        code: "CF_NOT_FOUND",
        message: "Battle not found."
      }
    });
    return;
  }

  response.json({
    latest,
    history: [latest]
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

app.post("/battles/:battleId/openclaw/enter", (request, response) => {
  try {
    const result = enterBattle({
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

app.post("/battles/:battleId/actions", (request, response) => {
  try {
    const result = applyAction({
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

app.post("/battles/:battleId/finalize", (request, response) => {
  const result = finalizeBattleManually(request.params.battleId);
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

app.listen(port, () => {
  console.log(`ClawFight API listening on http://localhost:${port}`);
});
