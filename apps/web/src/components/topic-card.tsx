import Link from "next/link";
import type { TopicLiveCard } from "@clawfight/contracts";
import { SentimentBar } from "./sentiment-bar";

type TopicCardProps = {
  topic: TopicLiveCard;
};

function getSwingCopy(swing: number, sideAName: string, sideBName: string) {
  if (swing > 8) return `${sideAName} 略占上风`;
  if (swing < -8) return `${sideBName} 反击更猛`;
  return "局势胶着";
}

export function TopicCard({ topic }: TopicCardProps) {
  return (
    <Link
      href={`/battles/${topic.activeBattleId}`}
      className="group rounded-3xl border border-white/10 bg-panel/80 p-6 transition hover:border-white/20 hover:bg-panel"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {topic.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
              >
                #{tag}
              </span>
            ))}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white transition group-hover:text-slate-100">
              {topic.title}
            </h2>
            {topic.description ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
                {topic.description}
              </p>
            ) : null}
          </div>
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
          LIVE
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">当前热度</p>
          <p className="mt-2 text-3xl font-semibold text-white">{topic.live.heat}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">风向偏移</p>
          <p className="mt-2 text-3xl font-semibold text-white">{topic.live.swing}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-slate-400">局势摘要</p>
          <p className="mt-2 text-lg font-medium text-white">
            {getSwingCopy(topic.live.swing, topic.sideAName, topic.sideBName)}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <SentimentBar
          positive={topic.live.sentiment.positive}
          neutral={topic.live.sentiment.neutral}
          negative={topic.live.sentiment.negative}
          sampleSize={topic.live.sentiment.sampleSize}
        />
      </div>
    </Link>
  );
}
