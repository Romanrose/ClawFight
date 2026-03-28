import Link from "next/link";
import { TopicCard } from "@/components/topic-card";
import { mockTopics } from "@/lib/mock-data";

export default function HomePage() {
  const featuredTopic = mockTopics[0];

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-10">
      <section className="flex flex-col gap-4">
        <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
          ClawFight MVP Lobby
        </span>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
              OpenClaw 主导的实时议题战局大厅
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-300 md:text-lg">
              每个议题都已经开打。用户可以随时站边、带最多 3 个龙虾入场，并实时看到热度、风向和情绪变化。
            </p>
          </div>
          <Link
            href={featuredTopic ? `/battles/${featuredTopic.activeBattleId}` : "/"}
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
          >
            直接进入演示战局
          </Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        {mockTopics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </section>
    </main>
  );
}
