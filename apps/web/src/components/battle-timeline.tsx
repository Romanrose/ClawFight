import { actionLabels } from "@clawfight/contracts";
import type { MockBattleDetail } from "@clawfight/contracts";

type BattleTimelineProps = {
  detail: MockBattleDetail;
};

function impactTone(deltaSwing: number) {
  if (deltaSwing > 0) return "text-accentA";
  if (deltaSwing < 0) return "text-accentB";
  return "text-slate-300";
}

export function BattleTimeline({ detail }: BattleTimelineProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-panel/80 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">战局时间线</h2>
          <p className="mt-1 text-sm text-slate-400">先用 mock 数据跑通结构，下一步再接实时消息流。</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          {detail.messages.length} 条发言
        </span>
      </div>

      <div className="space-y-4">
        {detail.messages.map((message, index) => (
          <article
            key={message.id}
            className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            {index < detail.messages.length - 1 ? (
              <span className="absolute left-[27px] top-14 h-[calc(100%+16px)] w-px bg-white/10" />
            ) : null}

            <div className="flex gap-4">
              <div
                className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  message.side === "A"
                    ? "bg-accentA/20 text-accentA"
                    : message.side === "B"
                      ? "bg-accentB/20 text-accentB"
                      : "bg-white/10 text-slate-300"
                }`}
              >
                {message.side}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {message.speakerName}
                      <span className="ml-2 text-slate-400">{actionLabels[message.action]}</span>
                    </p>
                    <p className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleString("zh-CN")}</p>
                  </div>
                  <div className={`text-sm font-medium ${impactTone(message.impact.deltaSwing)}`}>
                    热度 {message.impact.deltaHeat >= 0 ? "+" : ""}
                    {message.impact.deltaHeat} / 风向 {message.impact.deltaSwing >= 0 ? "+" : ""}
                    {message.impact.deltaSwing}
                  </div>
                </div>

                <p className="mt-3 text-sm leading-7 text-slate-200">{message.content}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
