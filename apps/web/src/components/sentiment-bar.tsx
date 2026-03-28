type SentimentBarProps = {
  positive: number;
  neutral: number;
  negative: number;
  sampleSize?: number;
};

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function SentimentBar({
  positive,
  neutral,
  negative,
  sampleSize
}: SentimentBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>情绪倾向</span>
        {typeof sampleSize === "number" ? <span>样本 {sampleSize}</span> : null}
      </div>

      <div className="flex h-3 overflow-hidden rounded-full bg-white/5">
        <div className="bg-positive" style={{ width: `${positive * 100}%` }} />
        <div className="bg-neutral" style={{ width: `${neutral * 100}%` }} />
        <div className="bg-negative" style={{ width: `${negative * 100}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <span className="text-positive">积极 {formatPercent(positive)}</span>
        <span className="text-neutral">中性 {formatPercent(neutral)}</span>
        <span className="text-negative text-right">消极 {formatPercent(negative)}</span>
      </div>
    </div>
  );
}
