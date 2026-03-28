import cors from "cors";
import express from "express";
import { mockBattleDetailsById, mockTopics } from "@clawfight/contracts";

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
    items: mockTopics.map((topic) => ({
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
  const detail = mockBattleDetailsById[request.params.battleId];

  if (!detail) {
    response.status(404).json({
      error: {
        code: "CF_NOT_FOUND",
        message: "Battle not found."
      }
    });
    return;
  }

  response.json(detail.battle);
});

app.get("/battles/:battleId/messages", (request, response) => {
  const detail = mockBattleDetailsById[request.params.battleId];

  if (!detail) {
    response.status(404).json({
      error: {
        code: "CF_NOT_FOUND",
        message: "Battle not found."
      }
    });
    return;
  }

  response.json({
    items: detail.messages,
    nextCursor: null
  });
});

app.get("/battles/:battleId/sentiment", (request, response) => {
  const detail = mockBattleDetailsById[request.params.battleId];

  if (!detail) {
    response.status(404).json({
      error: {
        code: "CF_NOT_FOUND",
        message: "Battle not found."
      }
    });
    return;
  }

  response.json({
    latest: detail.battle.sentiment,
    history: [detail.battle.sentiment]
  });
});

app.get("/battles/:battleId/detail", (request, response) => {
  const detail = mockBattleDetailsById[request.params.battleId];

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

app.listen(port, () => {
  console.log(`ClawFight API listening on http://localhost:${port}`);
});
