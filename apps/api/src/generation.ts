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

type OpenAICompatibleConfig = {
  baseUrl: string;
  model: string;
  apiKey: string;
};

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

class OpenAICompatibleMessageGenerator implements BattleMessageGenerator {
  readonly name = "openai-compatible";

  constructor(private readonly config: OpenAICompatibleConfig) {}

  async generateUserMessage(input: UserMessageInput) {
    return await this.complete({
      system:
        "你在为一个娱乐化、多角色实时对战平台生成中文短消息。输出一句自然、像角色在现场说的话，不要解释规则。",
      user: [
        `角色名：${input.speakerName}`,
        `角色人设：${input.speakerPersona}`,
        `动作：${actionLabels[input.action]}`,
        input.instruction?.trim() ? `用户指令：${input.instruction.trim()}` : "用户指令：无",
        "要求：20-45字，中文，保留角色风格，不要使用引号包裹整句。"
      ].join("\n")
    });
  }

  async generateSystemMessage(input: SystemMessageInput) {
    return await this.complete({
      system:
        "你在为一个娱乐化、多角色实时对战平台生成系统自动发言。输出一句中文短消息，要像观众正在围观的实时对线内容。",
      user: [
        `议题：${input.topic.title}`,
        `A方：${input.topic.sideAName}`,
        `B方：${input.topic.sideBName}`,
        `角色名：${input.speakerName}`,
        `角色人设：${input.speakerPersona}`,
        `角色阵营：${input.side}`,
        `动作：${actionLabels[input.action]}`,
        `触发来源：${input.source}`,
        "要求：20-50字，像角色发言，不要解释规则，不要使用 Markdown。"
      ].join("\n")
    });
  }

  async generateSummary(input: SummaryInput) {
    return await this.complete({
      system:
        "你在为一个娱乐化议题战局生成中文结案摘要。输出一段简短总结，适合直接展示在结果页。",
      user: [
        `议题：${input.topic.title}`,
        `A方：${input.topic.sideAName}`,
        `B方：${input.topic.sideBName}`,
        `结局类型：${input.outcomeType}`,
        `胜方：${input.winnerSide}`,
        `最终热度：${input.heat}`,
        `最终风向：${input.swing}`,
        `最终比分：${input.scoreA}:${input.scoreB}`,
        "要求：40-90字，中文，自然、总结性强，不要列表。"
      ].join("\n")
    });
  }

  private async complete(input: { system: string; user: string }) {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content: input.system
          },
          {
            role: "user",
            content: input.user
          }
        ]
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Generation request failed: ${response.status} ${body}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{
        message?: {
          content?: string | Array<{ type?: string; text?: string }>;
        };
      }>;
    };

    const content = payload.choices?.[0]?.message?.content;
    if (typeof content === "string" && content.trim()) {
      return content.trim();
    }

    if (Array.isArray(content)) {
      const text = content
        .map((part) => (typeof part?.text === "string" ? part.text : ""))
        .join("")
        .trim();
      if (text) {
        return text;
      }
    }

    throw new Error("Generation response did not include message content.");
  }
}

export function createBattleMessageGenerator(): BattleMessageGenerator {
  const provider = process.env.GENERATION_PROVIDER ?? "template";

  if (provider === "mock-llm") {
    return new MockLlmMessageGenerator();
  }

  if (provider === "openai-compatible") {
    const baseUrl = process.env.GENERATION_BASE_URL ?? process.env.OPENAI_BASE_URL;
    const model = process.env.GENERATION_MODEL ?? process.env.OPENAI_MODEL;
    const apiKey = process.env.GENERATION_API_KEY ?? process.env.OPENAI_API_KEY;

    if (!baseUrl || !model || !apiKey) {
      console.warn(
        "[generation] Missing GENERATION_BASE_URL / GENERATION_MODEL / GENERATION_API_KEY, falling back to template provider."
      );
      return new TemplateMessageGenerator();
    }

    return new OpenAICompatibleMessageGenerator({
      baseUrl: baseUrl.replace(/\/$/, ""),
      model,
      apiKey
    });
  }

  return new TemplateMessageGenerator();
}
