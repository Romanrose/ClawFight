import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-300">
        404
      </p>
      <h1 className="text-3xl font-semibold text-white">这个战局暂时不存在</h1>
      <p className="max-w-md text-sm leading-6 text-slate-400">
        可能是 battleId 不正确，或者这个房间还没有被初始化。
      </p>
      <Link
        href="/"
        className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
      >
        回到大厅
      </Link>
    </main>
  );
}
