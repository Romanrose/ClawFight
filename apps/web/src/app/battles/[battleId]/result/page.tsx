import Link from "next/link";
import { notFound } from "next/navigation";
import { getBattleDetail, getBattleResult } from "@/lib/api";

type BattleResultPageProps = {
  params: Promise<{
    battleId: string;
  }>;
};

function winnerCopy(winnerSide: "A" | "B" | "NONE", sideAName: string, sideBName: string) {
  if (winnerSide === "A") return `${sideAName} 胜出`;
  if (winnerSide === "B") return `${sideBName} 胜出`;
  return "双方打平";
}

export default async function BattleResultPage({ params }: BattleResultPageProps) {
  const { battleId } = await params;
  const [detail, result] = await Promise.all([getBattleDetail(battleId), getBattleResult(battleId)]);

  if (!detail || !result) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <div>
        <Link href={`/battles/${battleId}`} className="text-sm text-slate-400 transition hover:text-white">
          ← 返回战局
        </Link>
        <h1 className="mt-3 text-4xl font-semibold text-white">{detail.topic.title}</h1>
        <p className="mt-2 text-lg text-slate-300">
          {result.outcomeType} · {winnerCopy(result.winnerSide, detail.topic.sideAName, detail.topic.sideBName)}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-panel/80 p-5">
          <p className="text-xs text-slate-400">Final Heat</p>
          <p className="mt-2 text-3xl font-semibold text-white">{result.final.heat}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-panel/80 p-5">
          <p className="text-xs text-slate-400">Final Swing</p>
          <p className="mt-2 text-3xl font-semibold text-white">{result.final.swing}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-panel/80 p-5">
          <p className="text-xs text-slate-400">Final Phase</p>
          <p className="mt-2 text-3xl font-semibold text-white">{result.final.phase}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-panel/80 p-5">
          <p className="text-xs text-slate-400">Final Score</p>
          <p className="mt-2 text-xl font-semibold text-white">
            {result.final.scoreA} : {result.final.scoreB}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-panel/80 p-6">
        <h2 className="text-xl font-semibold text-white">结案总结</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">{result.summaryText}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-panel/80 p-6">
          <h2 className="text-xl font-semibold text-white">MVP</h2>
          <p className="mt-3 text-sm text-slate-300">
            {result.mvpInstanceId ? `本局最有存在感的角色是 ${result.mvpInstanceId}` : "本局没有明显 MVP。"}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-panel/80 p-6">
          <h2 className="text-xl font-semibold text-white">Top 3 高光</h2>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            {result.highlightMessageIds.map((messageId) => (
              <div key={messageId} className="rounded-2xl border border-white/10 px-3 py-2">
                {messageId}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
