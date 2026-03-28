import Link from "next/link";
import { notFound } from "next/navigation";
import { BattleRoom } from "@/components/battle-room";
import { getBattleDetail } from "@/lib/api";

type BattlePageProps = {
  params: Promise<{
    battleId: string;
  }>;
};

export default async function BattlePage({ params }: BattlePageProps) {
  const { battleId } = await params;
  const detail = await getBattleDetail(battleId);

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

      <BattleRoom initialDetail={detail} />
    </main>
  );
}
