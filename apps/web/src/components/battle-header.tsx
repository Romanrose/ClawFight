import type { MockBattleDetail } from "@clawfight/contracts";
import { SentimentBar } from "./sentiment-bar";

type BattleHeaderProps = {
  detail: MockBattleDetail;
};

function formatSigned(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

export function BattleHeader({ detail }: BattleHeaderProps) {
  const { battle, topic } = detail;

  return (
    <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <div className="rounded-3xl border border-white/10 bg-panel/80 p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">战局阶段</p>
            <p className="mt-2 text-3xl font-semibold text-white">Phase {battle.phase}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">热度</p>
            <p className="mt-2 text-3xl font-semibold text-white">{battle.heat}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">风向</p>
            <p className="mt-2 text-3xl font-semibold text-white">{formatSigned(battle.swing)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">比分</p>
            <p className="mt-2 text-xl font-semibold text-white">
              {topic.sideAName} {battle.scoreA} : {battle.scoreB} {topic.sideBName}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-panel/80 p-6">
        <SentimentBar
          positive={battle.sentiment.positive}
          neutral={battle.sentiment.neutral}
          negative={battle.sentiment.negative}
          sampleSize={battle.sentiment.sampleSize}
        />
      </div>
    </section>
  );
}
