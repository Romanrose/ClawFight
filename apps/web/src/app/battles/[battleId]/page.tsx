import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionDock } from "@/components/action-dock";
import { BattleHeader } from "@/components/battle-header";
import { BattleTimeline } from "@/components/battle-timeline";
import { mockBattleDetailsById } from "@/lib/mock-data";

type BattlePageProps = {
  params: Promise<{
    battleId: string;
  }>;
};

export default async function BattlePage({ params }: BattlePageProps) {
  const { battleId } = await params;
  const detail = mockBattleDetailsById[battleId];

  if (!detail) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="text-sm text-slate-400 transition hover:text-white">
            ← 返回议题大厅
          </Link>
          <h1 className="mt-2 text-3xl font-semibold text-white">{detail.topic.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            {detail.topic.description}
          </p>
        </div>
      </div>

      <BattleHeader detail={detail} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <BattleTimeline detail={detail} />
        <ActionDock detail={detail} />
      </section>
    </main>
  );
}
