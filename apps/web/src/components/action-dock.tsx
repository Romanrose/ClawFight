import { actionLabels, type ActionType } from "@clawfight/contracts";
import type { MockBattleDetail } from "@/lib/mock-data";

type ActionDockProps = {
  detail: MockBattleDetail;
};

const defaultActionOrder: ActionType[] = [
  "FOLLOW_UP",
  "SARCASM",
  "EXPOSE",
  "WHITEWASH",
  "ANALYZE",
  "SUMMARIZE"
];

export function ActionDock({ detail }: ActionDockProps) {
  return (
    <aside className="flex flex-col gap-4">
      <section className="rounded-3xl border border-white/10 bg-panel/80 p-5">
        <h2 className="text-lg font-semibold text-white">用户操作面板</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          这一版先把交互位置和信息层级搭好，后面接 `/openclaw/enter` 和 `/actions`。
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-panel/80 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">站边</h3>
          <span className="rounded-full border border-accentA/30 bg-accentA/10 px-2.5 py-1 text-xs text-accentA">
            已选 A 方
          </span>
        </div>
        <div className="mt-4 grid gap-3">
          {detail.loadout.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{item.nickname}</p>
                  <p className="mt-1 text-xs text-slate-400">{item.persona}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
                  {item.cooldown}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-panel/80 p-5">
        <h3 className="text-sm font-medium text-white">动作快捷入口</h3>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {defaultActionOrder.map((action) => (
            <button
              key={action}
              type="button"
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              {actionLabels[action]}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-400">指令输入占位</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            “抓住对面逻辑漏洞，别太脏。” 后续会把这里接到用户 steer message 接口。
          </p>
        </div>
      </section>
    </aside>
  );
}
