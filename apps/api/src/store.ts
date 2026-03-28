import {
  actionLabels,
  type ActionType,
  type BattleResult,
  type OutcomeType,
  type Side
} from "@clawfight/contracts";
import {
  mockBattleDetailsById,
  mockCharacterCatalog,
  mockTopics,
  type LoadoutCard,
  type MockBattleDetail
} from "@clawfight/contracts";

type EnterBattleInput = {
  battleId: string;
  userId: string;
  side: Side;
  slots: Array<{ characterId: string }>;
};

type CreateActionInput = {
  battleId: string;
  userId: string;
  usingInstanceId: string;
  action: ActionType;
  instruction?: string;
};

type RuntimeInstance = {
  id: string;
  userId: string;
  battleId: string;
  side: Side;
  nickname: string;
  persona: string;
  characterId: string;
  cooldownTurns: number;
};

type RuntimeBattleDetail = MockBattleDetail & {
  instances: RuntimeInstance[];
  currentUserId: string;
};

const currentUserId = "user_demo";
let instanceCounter = 100;
let messageCounter = 2000;

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function deriveSideFromBattle(detail: MockBattleDetail): Side {
  return detail.battle.swing >= 0 ? "A" : "B";
}

function cooldownLabel(turns: number) {
  if (turns <= 0) return "可出手";
  if (turns === 1) return "冷却 1 turn";
  return `冷却 ${turns} turns`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeSentiment(positive: number, neutral: number, negative: number) {
  const total = positive + neutral + negative;
  return {
    positive: Number((positive / total).toFixed(2)),
    neutral: Number((neutral / total).toFixed(2)),
    negative: Number((negative / total).toFixed(2))
  };
}

function buildRuntimeStore() {
  const entries = Object.entries(mockBattleDetailsById).map(([battleId, detail]) => {
    const cloned = deepClone(detail);
    const side = deriveSideFromBattle(cloned);
    const instances: RuntimeInstance[] = cloned.loadout.map((item, index) => ({
      id: item.id,
      battleId,
      userId: currentUserId,
      side,
      nickname: item.nickname ?? `龙虾 ${index + 1}`,
      persona: item.persona,
      characterId: mockCharacterCatalog[index]?.id ?? `character_${index + 1}`,
      cooldownTurns: item.cooldown === "可出手" ? 0 : 1
    }));

    return [
      battleId,
      {
        ...cloned,
        availableCharacters: deepClone(mockCharacterCatalog),
        instances,
        currentUserId
      }
    ] as const;
  });

  return Object.fromEntries(entries) as Record<string, RuntimeBattleDetail>;
}

const runtimeStore = buildRuntimeStore();

const actionImpactTable: Record<ActionType, { heat: number; swing: number; score: number }> = {
  SPRAY: { heat: 8, swing: 4, score: 2 },
  SARCASM: { heat: 6, swing: 6, score: 3 },
  FOLLOW_UP: { heat: 4, swing: 5, score: 3 },
  WHITEWASH: { heat: 3, swing: 7, score: 4 },
  EXPOSE: { heat: 10, swing: 9, score: 5 },
  ANALYZE: { heat: 1, swing: 3, score: 2 },
  SUMMARIZE: { heat: -1, swing: 2, score: 1 },
  AMPLIFY: { heat: 5, swing: 4, score: 2 },
  DE_ESCALATE: { heat: -4, swing: 0, score: 0 }
};

function buildLoadoutCards(detail: RuntimeBattleDetail): LoadoutCard[] {
  return detail.instances.map((instance) => ({
    id: instance.id,
    nickname: instance.nickname,
    persona: instance.persona,
    cooldown: cooldownLabel(instance.cooldownTurns)
  }));
}

function toPublicDetail(detail: RuntimeBattleDetail): MockBattleDetail {
  return {
    topic: detail.topic,
    battle: detail.battle,
    messages: detail.messages,
    loadout: buildLoadoutCards(detail),
    availableCharacters: detail.availableCharacters,
    ...(detail.result ? { result: detail.result } : {})
  };
}

export function listTopics() {
  return Object.values(runtimeStore).map((detail) => ({
    ...detail.topic,
    live: {
      heat: detail.battle.heat,
      swing: detail.battle.swing,
      sentiment: detail.battle.sentiment
    }
  }));
}

export function getBattleDetail(battleId: string) {
  const detail = runtimeStore[battleId];
  return detail ? toPublicDetail(detail) : null;
}

export function getBattleState(battleId: string) {
  return runtimeStore[battleId]?.battle ?? null;
}

export function getBattleMessages(battleId: string) {
  return runtimeStore[battleId]?.messages ?? null;
}

export function getBattleSentiment(battleId: string) {
  return runtimeStore[battleId]?.battle.sentiment ?? null;
}

export function getBattleResult(battleId: string) {
  return runtimeStore[battleId]?.result ?? null;
}

export function enterBattle(input: EnterBattleInput) {
  const detail = runtimeStore[input.battleId];
  if (!detail) return null;
  if (detail.battle.status === "ENDED") {
    throw new Error("Battle already ended.");
  }

  if (input.slots.length < 1 || input.slots.length > 3) {
    throw new Error("Role limit exceeded: max 3 instances per user per battle.");
  }

  const instances = input.slots.map((slot) => {
    const character = mockCharacterCatalog.find((item) => item.id === slot.characterId);
    if (!character) {
      throw new Error(`Unknown character: ${slot.characterId}`);
    }

    instanceCounter += 1;

    return {
      id: `inst_user_${instanceCounter}`,
      userId: input.userId,
      battleId: input.battleId,
      side: input.side,
      nickname: character.name,
      persona: character.persona,
      characterId: character.id,
      cooldownTurns: 0
    } satisfies RuntimeInstance;
  });

  detail.instances = instances;
  detail.loadout = buildLoadoutCards(detail);

  return {
    loadout: detail.loadout,
    instances: detail.instances
  };
}

function buildMessageContent(instance: RuntimeInstance, action: ActionType, instruction?: string) {
  const base = `${instance.nickname}${actionLabels[action]}：${instance.persona}`;
  if (instruction?.trim()) {
    return `${base} 本轮策略是“${instruction.trim()}”。`;
  }
  return `${base} 继续把节奏往自己这边拉。`;
}

function updateSentiment(detail: RuntimeBattleDetail, action: ActionType) {
  const current = detail.battle.sentiment;
  let positive = current.positive;
  let neutral = current.neutral;
  let negative = current.negative;

  if (action === "WHITEWASH") positive += 0.03;
  if (action === "ANALYZE" || action === "SUMMARIZE" || action === "DE_ESCALATE") neutral += 0.03;
  if (action === "SPRAY" || action === "SARCASM" || action === "EXPOSE" || action === "FOLLOW_UP") negative += 0.04;

  const normalized = normalizeSentiment(positive, neutral, negative);

  detail.battle.sentiment = {
    ...current,
    ...normalized,
    sampleSize: current.sampleSize + 1,
    atPhase: detail.battle.phase,
    updatedAt: new Date().toISOString()
  };
}

function buildOutcome(detail: RuntimeBattleDetail): {
  ended: boolean;
  outcomeType?: OutcomeType;
  winnerSide?: "A" | "B" | "NONE";
} {
  const scoreDiff = Math.abs(detail.battle.scoreA - detail.battle.scoreB);
  if (detail.battle.heat >= 85 || scoreDiff >= 10 || Math.abs(detail.battle.swing) >= 20) {
    return {
      ended: true,
      outcomeType: scoreDiff >= 10 || Math.abs(detail.battle.swing) >= 20 ? "LANDSLIDE" : "REVERSAL",
      winnerSide:
        detail.battle.scoreA === detail.battle.scoreB
          ? "NONE"
          : detail.battle.scoreA > detail.battle.scoreB
            ? "A"
            : "B"
    };
  }

  if (detail.battle.phase >= 10) {
    return {
      ended: true,
      outcomeType: "COOLDOWN",
      winnerSide:
        detail.battle.scoreA === detail.battle.scoreB
          ? "NONE"
          : detail.battle.scoreA > detail.battle.scoreB
            ? "A"
            : "B"
    };
  }

  return { ended: false };
}

function finalizeBattle(
  detail: RuntimeBattleDetail,
  outcome: { outcomeType: OutcomeType; winnerSide: "A" | "B" | "NONE" }
) {
  const highlights = [...detail.messages]
    .sort((left, right) => {
      const leftImpact =
        Math.abs(left.impact.deltaHeat) +
        Math.abs(left.impact.deltaSwing) +
        Math.abs(left.impact.deltaScoreA) +
        Math.abs(left.impact.deltaScoreB);
      const rightImpact =
        Math.abs(right.impact.deltaHeat) +
        Math.abs(right.impact.deltaSwing) +
        Math.abs(right.impact.deltaScoreA) +
        Math.abs(right.impact.deltaScoreB);
      return rightImpact - leftImpact;
    })
    .slice(0, 3)
    .map((message) => message.id);

  const contributionByInstance = new Map<string, number>();
  for (const message of detail.messages) {
    const current = contributionByInstance.get(message.speakerInstanceId) ?? 0;
    contributionByInstance.set(
      message.speakerInstanceId,
      current +
        Math.abs(message.impact.deltaHeat) +
        Math.abs(message.impact.deltaSwing) +
        Math.abs(message.impact.deltaScoreA) +
        Math.abs(message.impact.deltaScoreB)
    );
  }

  const [mvpInstanceId] =
    [...contributionByInstance.entries()].sort((left, right) => right[1] - left[1])[0] ?? [];

  const summaryLead =
    outcome.winnerSide === "NONE"
      ? "双方打到最后仍然没有形成绝对胜负。"
      : `${outcome.winnerSide} 方在关键节点建立了更稳定的优势。`;

  const result: BattleResult = {
    battleId: detail.battle.id,
    topicId: detail.topic.id,
    outcomeType: outcome.outcomeType,
    winnerSide: outcome.winnerSide,
    final: {
      heat: detail.battle.heat,
      swing: detail.battle.swing,
      scoreA: detail.battle.scoreA,
      scoreB: detail.battle.scoreB,
      phase: detail.battle.phase
    },
    highlightMessageIds: highlights,
    summaryText: `${summaryLead} 最终热度 ${detail.battle.heat}，风向 ${detail.battle.swing}，比分 ${detail.battle.scoreA}:${detail.battle.scoreB}。`,
    createdAt: new Date().toISOString(),
    ...(mvpInstanceId ? { mvpInstanceId } : {})
  };

  detail.result = result;
  detail.battle.status = "ENDED";
  detail.battle.updatedAt = result.createdAt;
  return result;
}

export function finalizeBattleManually(battleId: string) {
  const detail = runtimeStore[battleId];
  if (!detail) return null;
  if (detail.result) return detail.result;

  const scoreDiff = Math.abs(detail.battle.scoreA - detail.battle.scoreB);
  return finalizeBattle(detail, {
    outcomeType: scoreDiff >= 8 ? "LANDSLIDE" : "COOLDOWN",
    winnerSide:
      detail.battle.scoreA === detail.battle.scoreB
        ? "NONE"
        : detail.battle.scoreA > detail.battle.scoreB
          ? "A"
          : "B"
  });
}

export function applyAction(input: CreateActionInput) {
  const detail = runtimeStore[input.battleId];
  if (!detail) return null;
  if (detail.battle.status === "ENDED") {
    throw new Error("Battle already ended.");
  }

  const instance = detail.instances.find((item) => item.id === input.usingInstanceId);
  if (!instance || instance.userId !== input.userId) {
    throw new Error("Not your instance.");
  }
  if (instance.cooldownTurns > 0) {
    throw new Error("Instance in cooldown.");
  }

  detail.instances = detail.instances.map((item) => ({
    ...item,
    cooldownTurns: Math.max(0, item.cooldownTurns - 1)
  }));

  const refreshedInstance = detail.instances.find((item) => item.id === input.usingInstanceId)!;
  const impact = actionImpactTable[input.action];
  const direction = refreshedInstance.side === "A" ? 1 : -1;

  detail.battle.phase += 1;
  detail.battle.heat = clamp(detail.battle.heat + impact.heat, 0, 100);
  detail.battle.swing = clamp(detail.battle.swing + direction * impact.swing, -100, 100);
  if (refreshedInstance.side === "A") {
    detail.battle.scoreA += impact.score;
  } else if (refreshedInstance.side === "B") {
    detail.battle.scoreB += impact.score;
  }
  detail.battle.updatedAt = new Date().toISOString();
  detail.battle.lastMessageAt = detail.battle.updatedAt;

  messageCounter += 1;
  const messageId = `msg_${messageCounter}`;
  detail.messages = [
    ...detail.messages,
    {
      id: messageId,
      battleId: input.battleId,
      topicId: detail.topic.id,
      speakerInstanceId: refreshedInstance.id,
      speakerName: refreshedInstance.nickname,
      side: refreshedInstance.side,
      action: input.action,
      content: buildMessageContent(refreshedInstance, input.action, input.instruction),
      createdAt: detail.battle.updatedAt,
      impact: {
        deltaHeat: impact.heat,
        deltaSwing: direction * impact.swing,
        deltaScoreA: refreshedInstance.side === "A" ? impact.score : 0,
        deltaScoreB: refreshedInstance.side === "B" ? impact.score : 0
      },
      userTriggered: true
    }
  ];

  refreshedInstance.cooldownTurns = 1;
  detail.loadout = buildLoadoutCards(detail);
  updateSentiment(detail, input.action);

  const liveTopic = mockTopics.find((topic) => topic.id === detail.topic.id);
  if (liveTopic) {
    liveTopic.live = {
      heat: detail.battle.heat,
      swing: detail.battle.swing,
      sentiment: detail.battle.sentiment
    };
  }

  const outcome = buildOutcome(detail);
  if (outcome.ended && outcome.outcomeType && outcome.winnerSide) {
    finalizeBattle(detail, {
      outcomeType: outcome.outcomeType,
      winnerSide: outcome.winnerSide
    });
  }

  return {
    producedMessageId: messageId,
    state: detail.battle,
    result: detail.result
  };
}
