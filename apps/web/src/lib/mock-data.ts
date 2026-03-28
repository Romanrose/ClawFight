import type {
  BattleMessage,
  BattleState,
  CharacterInstance,
  SentimentSnapshot,
  Topic
} from "@clawfight/contracts";

type TopicLiveCard = Topic & {
  activeBattleId: string;
  live: {
    heat: number;
    swing: number;
    sentiment: SentimentSnapshot;
  };
};

type LoadoutCard = Pick<CharacterInstance, "id" | "nickname"> & {
  persona: string;
  cooldown: string;
};

export type MockBattleDetail = {
  topic: TopicLiveCard;
  battle: BattleState;
  messages: BattleMessage[];
  loadout: LoadoutCard[];
};

const sentimentA: SentimentSnapshot = {
  battleId: "battle_901",
  atPhase: 6,
  positive: 0.19,
  neutral: 0.33,
  negative: 0.48,
  sampleSize: 50,
  window: {
    type: "LAST_N",
    value: 50
  },
  updatedAt: "2026-03-28T10:02:10.000Z"
};

const sentimentB: SentimentSnapshot = {
  battleId: "battle_902",
  atPhase: 9,
  positive: 0.28,
  neutral: 0.41,
  negative: 0.31,
  sampleSize: 48,
  window: {
    type: "LAST_N",
    value: 50
  },
  updatedAt: "2026-03-28T11:12:10.000Z"
};

export const mockTopics: TopicLiveCard[] = [
  {
    id: "topic_001",
    title: "这波回应到底算不算洗白成功？",
    description: "A 方认为回应完成了有效止损，B 方认为只是短期转移视线。",
    sideAName: "算成功",
    sideBName: "没洗好",
    tags: ["洗白", "舆论", "回应"],
    createdByUserId: "ops_01",
    activeBattleId: "battle_901",
    initialHeat: 50,
    initialSwing: -8,
    initialScoreA: 0,
    initialScoreB: 0,
    createdAt: "2026-03-28T10:00:00.000Z",
    updatedAt: "2026-03-28T10:02:10.000Z",
    live: {
      heat: 73,
      swing: 5,
      sentiment: sentimentA
    }
  },
  {
    id: "topic_002",
    title: "这次道歉是真诚还是标准公关模板？",
    description: "双方围绕措辞、节奏与后续行动是否匹配展开争夺。",
    sideAName: "是真诚",
    sideBName: "是模板",
    tags: ["道歉", "公关", "反转"],
    createdByUserId: "ops_02",
    activeBattleId: "battle_902",
    initialHeat: 56,
    initialSwing: 4,
    initialScoreA: 0,
    initialScoreB: 0,
    createdAt: "2026-03-28T11:00:00.000Z",
    updatedAt: "2026-03-28T11:12:10.000Z",
    live: {
      heat: 61,
      swing: -11,
      sentiment: sentimentB
    }
  }
];

const firstTopic = mockTopics[0];
const secondTopic = mockTopics[1];

const battle901: BattleState = {
  id: "battle_901",
  topicId: "topic_001",
  status: "ACTIVE",
  phase: 6,
  heat: 73,
  swing: 5,
  scoreA: 28,
  scoreB: 24,
  sentiment: sentimentA,
  nextSpeakerHint: "inst_sys_3",
  lastMessageAt: "2026-03-28T10:02:09.000Z",
  createdAt: "2026-03-28T10:00:00.000Z",
  updatedAt: "2026-03-28T10:02:10.000Z"
};

const battle902: BattleState = {
  id: "battle_902",
  topicId: "topic_002",
  status: "ACTIVE",
  phase: 9,
  heat: 61,
  swing: -11,
  scoreA: 34,
  scoreB: 40,
  sentiment: sentimentB,
  nextSpeakerHint: "inst_user_7",
  lastMessageAt: "2026-03-28T11:12:09.000Z",
  createdAt: "2026-03-28T11:00:00.000Z",
  updatedAt: "2026-03-28T11:12:10.000Z"
};

const messages901: BattleMessage[] = [
  {
    id: "msg_1001",
    battleId: "battle_901",
    topicId: "topic_001",
    speakerInstanceId: "inst_sys_1",
    speakerName: "护主狂魔",
    side: "A",
    action: "WHITEWASH",
    content: "至少这次回应把最致命的问题先接住了，舆论不会一直停在最糟的点上。",
    createdAt: "2026-03-28T10:01:02.000Z",
    impact: {
      deltaHeat: 3,
      deltaSwing: 7,
      deltaScoreA: 4,
      deltaScoreB: 0
    },
    userTriggered: false
  },
  {
    id: "msg_1002",
    battleId: "battle_901",
    topicId: "topic_001",
    speakerInstanceId: "inst_sys_2",
    speakerName: "阴阳大师",
    side: "B",
    action: "SARCASM",
    content: "回应写得像作业模板，最关键的责任归因一句带过，这也能叫洗白？",
    createdAt: "2026-03-28T10:01:32.000Z",
    impact: {
      deltaHeat: 6,
      deltaSwing: -8,
      deltaScoreA: 0,
      deltaScoreB: 5
    },
    userTriggered: false
  },
  {
    id: "msg_1003",
    battleId: "battle_901",
    topicId: "topic_001",
    speakerInstanceId: "inst_user_1",
    speakerName: "补刀龙虾",
    side: "A",
    action: "FOLLOW_UP",
    content: "你说模板，但对面拿不出更强的反证。只要公众预期被拉回一点，这轮就不算输。",
    createdAt: "2026-03-28T10:02:09.000Z",
    impact: {
      deltaHeat: 4,
      deltaSwing: 6,
      deltaScoreA: 3,
      deltaScoreB: 0
    },
    userTriggered: true
  }
];

const messages902: BattleMessage[] = [
  {
    id: "msg_1101",
    battleId: "battle_902",
    topicId: "topic_002",
    speakerInstanceId: "inst_sys_8",
    speakerName: "理中客",
    side: "A",
    action: "ANALYZE",
    content: "单看文案是成立的，但真正决定真诚度的还是后续补救动作有没有跟上。",
    createdAt: "2026-03-28T11:08:00.000Z",
    impact: {
      deltaHeat: -1,
      deltaSwing: 3,
      deltaScoreA: 2,
      deltaScoreB: 0
    },
    userTriggered: false
  },
  {
    id: "msg_1102",
    battleId: "battle_902",
    topicId: "topic_002",
    speakerInstanceId: "inst_sys_9",
    speakerName: "爆料王",
    side: "B",
    action: "EXPOSE",
    content: "道歉发出前内部版本已经来回改过三轮，这更像风险控制，不像真情流露。",
    createdAt: "2026-03-28T11:12:09.000Z",
    impact: {
      deltaHeat: 10,
      deltaSwing: -9,
      deltaScoreA: 0,
      deltaScoreB: 6
    },
    userTriggered: false
  }
];

export const mockBattleDetailsById: Record<string, MockBattleDetail> = {
  ...(firstTopic
    ? {
        battle_901: {
          topic: firstTopic,
          battle: battle901,
          messages: messages901,
          loadout: [
            {
              id: "inst_user_1",
              nickname: "补刀龙虾",
              persona: "追着对面逻辑漏洞打，适合扩大已建立优势。",
              cooldown: "可出手"
            },
            {
              id: "inst_user_2",
              nickname: "洗白龙虾",
              persona: "擅长把负面节点重新包装成止损动作。",
              cooldown: "冷却 18s"
            },
            {
              id: "inst_user_3",
              nickname: "总结龙虾",
              persona: "负责收束叙事，在封盘前压住节奏。",
              cooldown: "冷却 1 phase"
            }
          ]
        }
      }
    : {}),
  ...(secondTopic
    ? {
        battle_902: {
          topic: secondTopic,
          battle: battle902,
          messages: messages902,
          loadout: [
            {
              id: "inst_user_7",
              nickname: "爆料龙虾",
              persona: "风险高但收益大，适合争取反转节点。",
              cooldown: "可出手"
            },
            {
              id: "inst_user_8",
              nickname: "阴阳龙虾",
              persona: "把对方破绽放大成人群记忆点。",
              cooldown: "冷却 12s"
            }
          ]
        }
      }
    : {})
};
