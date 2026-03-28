export type Side = "A" | "B" | "NEUTRAL";

export type BattleStatus = "ACTIVE" | "ENDED" | "PAUSED";

export type SentimentLabel = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export type OutcomeType = "LANDSLIDE" | "REVERSAL" | "STALEMATE" | "COOLDOWN";

export type SpeakingStyle = "AGGRESSIVE" | "BALANCED" | "SUBTLE";

export type CharacterInstanceStatus = "ACTIVE" | "LEFT" | "MUTED";

export type ActionType =
  | "SPRAY"
  | "SARCASM"
  | "FOLLOW_UP"
  | "WHITEWASH"
  | "EXPOSE"
  | "ANALYZE"
  | "SUMMARIZE"
  | "AMPLIFY"
  | "DE_ESCALATE";

export const actionLabels: Record<ActionType, string> = {
  SPRAY: "开喷",
  SARCASM: "阴阳",
  FOLLOW_UP: "补刀",
  WHITEWASH: "洗白",
  EXPOSE: "爆料",
  ANALYZE: "理中客分析",
  SUMMARIZE: "总结",
  AMPLIFY: "带节奏",
  DE_ESCALATE: "呼吁冷静"
};

export interface Topic {
  id: string;
  title: string;
  description?: string;
  sideAName: string;
  sideBName: string;
  tags: string[];
  createdByUserId?: string;
  activeBattleId?: string;
  initialHeat: number;
  initialSwing: number;
  initialScoreA: number;
  initialScoreB: number;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  name: string;
  persona: string;
  defaultSide: Side;
  speakingStyle: SpeakingStyle;
  actionPool: ActionType[];
  baseInfluence: number;
  sentimentBias?: Partial<Record<SentimentLabel, number>>;
  createdAt: string;
  updatedAt: string;
}

export interface CharacterInstance {
  id: string;
  battleId: string;
  characterId: string;
  ownerUserId?: string;
  side: Side;
  nickname?: string;
  status: CharacterInstanceStatus;
  cooldownUntil?: string;
  contributionScore: number;
  joinedAt: string;
}

export interface SentimentSnapshot {
  battleId: string;
  atPhase: number;
  positive: number;
  neutral: number;
  negative: number;
  sampleSize: number;
  window: {
    type: "ALL" | "LAST_N" | "LAST_MINUTES";
    value: number;
  };
  updatedAt: string;
}

export interface BattleState {
  id: string;
  topicId: string;
  status: BattleStatus;
  phase: number;
  heat: number;
  swing: number;
  scoreA: number;
  scoreB: number;
  nextSpeakerHint?: string;
  lastMessageAt?: string;
  sentiment: SentimentSnapshot;
  createdAt: string;
  updatedAt: string;
}

export interface BattleMessageImpact {
  deltaHeat: number;
  deltaSwing: number;
  deltaScoreA: number;
  deltaScoreB: number;
}

export interface BattleMessage {
  id: string;
  battleId: string;
  topicId: string;
  speakerInstanceId: string;
  speakerName: string;
  side: Side;
  action: ActionType;
  content: string;
  targetInstanceId?: string;
  createdAt: string;
  impact: BattleMessageImpact;
  userTriggered: boolean;
}

export interface UserBattleLoadout {
  id: string;
  battleId: string;
  userId: string;
  slot1CharacterId?: string;
  slot2CharacterId?: string;
  slot3CharacterId?: string;
  side: Side;
  lockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserAction {
  id: string;
  battleId: string;
  userId: string;
  usingInstanceId: string;
  action: ActionType;
  instruction?: string;
  producedMessageId?: string;
  createdAt: string;
}

export interface SentimentRecord {
  messageId: string;
  battleId: string;
  label: SentimentLabel;
  confidence: number;
  model: string;
  createdAt: string;
}

export interface BattleResult {
  battleId: string;
  topicId: string;
  outcomeType: OutcomeType;
  winnerSide: "A" | "B" | "NONE";
  final: {
    heat: number;
    swing: number;
    scoreA: number;
    scoreB: number;
    phase: number;
  };
  mvpInstanceId?: string;
  highlightMessageIds: string[];
  summaryText: string;
  createdAt: string;
}
