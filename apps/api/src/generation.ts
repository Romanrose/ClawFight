import { actionLabels, type ActionType, type OutcomeType } from "@clawfight/contracts";

type TopicContext = {
  title: string;
  sideAName: string;
  sideBName: string;
};

type UserMessageInput = {
  speakerName: string;
  speakerPersona: string;
  action: ActionType;
  instruction?: string;
};

type SystemMessageInput = {
  speakerName: string;
  speakerPersona: string;
  side: "A" | "B";
  action: ActionType;
  topic: TopicContext;
  source: "manual" | "auto";
};

type SummaryInput = {
  topic: TopicContext;
  winnerSide: "A" | "B" | "NONE";
  outcomeType: OutcomeType;
  heat: number;
  swing: number;
  scoreA: number;
  scoreB: number;
};

export interface BattleMessageGenerator {
  readonly name: string;
  generateUserMessage(input: UserMessageInput): Promise<string>;
  generateSystemMessage(input: SystemMessageInput): Promise<string>;
  generateSummary(input: SummaryInput): Promise<string>;
}

class TemplateMessageGenerator implements BattleMessageGenerator {
  readonly name: string = "template";

  async generateUserMessage(input: UserMessageInput) {
    const prefix = `${input.speakerName}${actionLabels[input.action]}：${input.speakerPersona}`;
    if (input.instruction?.trim()) {
      return `${prefix} 本轮策略是“${input.instruction.trim()}”。`;
    }

    return `${prefix} 继续把节奏往自己这边拉。`;
  }

  async generateSystemMessage(input: SystemMessageInput) {
    const sideName = input.side === "A" ? input.topic.sideAName : input.topic.sideBName;
    const prefix = `${input.speakerName}${actionLabels[input.action]}：${input.speakerPersona}`;

    if (input.source === "manual") {
      return `${prefix} 系统补一手，继续替 ${sideName} 扩大当下优势。`;
    }
    if (input.action === "EXPOSE") {
      return `${prefix} ${sideName} 这边抛出新节点，试图把风向往自己这里继续拉。`;
    }
    if (input.action === "SARCASM") {
      return `${prefix} ${sideName} 抓住对面的缝继续阴阳，观众情绪明显被带起来了。`;
    }
    if (input.action === "ANALYZE") {
      return `${prefix} ${sideName} 试着把吵架节奏变成论点节奏。`;
    }
    if (input.action === "SUMMARIZE") {
      return `${prefix} ${sideName} 开始收口，试图把这一回合定性。`;
    }

    return `${prefix} ${sideName} 继续追打当前最有效的论点。`;
  }

  async generateSummary(input: SummaryInput) {
    const sideName =
      input.winnerSide === "A"
        ? input.topic.sideAName
        : input.winnerSide === "B"
          ? input.topic.sideBName
          : "双方";
    const lead =
      input.winnerSide === "NONE"
        ? "双方打到最后仍然没有形成绝对胜负。"
        : `${sideName} 在关键节点建立了更稳定的优势。`;

    return `${lead} 结局类型 ${input.outcomeType}，最终热度 ${input.heat}，风向 ${input.swing}，比分 ${input.scoreA}:${input.scoreB}。`;
  }
}

class MockLlmMessageGenerator extends TemplateMessageGenerator {
  override readonly name: string = "mock-llm";

  override async generateUserMessage(input: UserMessageInput) {
    const base = await super.generateUserMessage(input);
    return `${base} 这句会更像角色在现场临场发挥。`;
  }

  override async generateSystemMessage(input: SystemMessageInput) {
    const base = await super.generateSystemMessage(input);
    return `${base} 语气上会更像多角色群聊，而不是固定模板。`;
  }

  override async generateSummary(input: SummaryInput) {
    const base = await super.generateSummary(input);
    return `${base} 这是通过可插拔生成器产生的总结占位文本。`;
  }
}

export function createBattleMessageGenerator(): BattleMessageGenerator {
  const provider = process.env.GENERATION_PROVIDER ?? "template";

  if (provider === "mock-llm") {
    return new MockLlmMessageGenerator();
  }

  return new TemplateMessageGenerator();
}
