import type { SentimentSnapshot } from "@clawfight/contracts";

type SentimentTrendProps = {
  history: SentimentSnapshot[];
};

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function SentimentTrend({ history }: SentimentTrendProps) {
  if (history.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-panel/80 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">情绪趋势</h2>
          <p className="mt-1 text-sm text-slate-400">最近几个阶段的积极 / 中性 / 消极占比快照。</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
          {history.length} 个快照
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {history.map((snapshot) => (
          <div key={`${snapshot.battleId}-${snapshot.atPhase}-${snapshot.updatedAt}`} className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Phase {snapshot.atPhase}</span>
              <span>样本 {snapshot.sampleSize}</span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
              <div className="bg-positive" style={{ width: `${snapshot.positive * 100}%` }} />
              <div className="bg-neutral" style={{ width: `${snapshot.neutral * 100}%` }} />
              <div className="bg-negative" style={{ width: `${snapshot.negative * 100}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
              <span className="text-positive">积极 {percent(snapshot.positive)}</span>
              <span className="text-neutral">中性 {percent(snapshot.neutral)}</span>
              <span className="text-right text-negative">消极 {percent(snapshot.negative)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
