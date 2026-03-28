"use client";

import { useMemo, useState } from "react";
import { actionLabels, type ActionType, type MockBattleDetail } from "@clawfight/contracts";

type ActionDockProps = {
  detail: MockBattleDetail;
  busy?: boolean;
  onEnterBattle?: (payload?: { side: "A" | "B" | "NEUTRAL"; slots: string[] }) => Promise<void>;
  onActionSubmit?: (action: ActionType, instruction: string) => Promise<void>;
};

const defaultActionOrder: ActionType[] = [
  "FOLLOW_UP",
  "SARCASM",
  "EXPOSE",
  "WHITEWASH",
  "ANALYZE",
  "SUMMARIZE"
];

export function ActionDock({ detail, busy = false, onEnterBattle, onActionSubmit }: ActionDockProps) {
  const [instruction, setInstruction] = useState("抓住对面逻辑漏洞，别太脏");

  const suggestedSlots = useMemo(
    () => detail.availableCharacters.slice(0, 3).map((item) => item.id),
    [detail.availableCharacters]
  );

  return (
    <aside className="flex flex-col gap-4">
      <section className="rounded-3xl border border-white/10 bg-panel/80 p-5">
        <h2 className="text-lg font-semibold text-white">用户操作面板</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          这一版已经接上 demo API，可以直接重新编队并触发动作。
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => onEnterBattle?.({ side: "A", slots: suggestedSlots })}
          className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "处理中..." : "用推荐编队重新入场"}
        </button>
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
              disabled={busy}
              onClick={() => onActionSubmit?.(action, instruction)}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left text-sm text-slate-200 transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              {actionLabels[action]}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4">
          <p className="text-xs text-slate-400">指令输入占位</p>
          <textarea
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            className="mt-2 min-h-24 w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-slate-200 outline-none transition focus:border-white/20"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-slate-400">可选角色</p>
          <div className="mt-3 space-y-2">
            {detail.availableCharacters.map((character) => (
              <div key={character.id} className="rounded-xl border border-white/10 px-3 py-2">
                <p className="text-sm font-medium text-white">{character.name}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{character.persona}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
}
