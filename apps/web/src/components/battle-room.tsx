"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { BattleResult, MockBattleDetail } from "@clawfight/contracts";
import { io, type Socket } from "socket.io-client";
import { ActionDock } from "./action-dock";
import { BattleHeader } from "./battle-header";
import { BattleTimeline } from "./battle-timeline";

type BattleRoomProps = {
  initialDetail: MockBattleDetail;
};

type EnterBattlePayload = {
  side: "A" | "B" | "NEUTRAL";
  slots: string[];
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.API_BASE_URL ?? "http://localhost:3001";
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? API_BASE_URL;

export function BattleRoom({ initialDetail }: BattleRoomProps) {
  const [detail, setDetail] = useState(initialDetail);
  const [status, setStatus] = useState<string>("已连接到战局");
  const [busy, setBusy] = useState(false);

  const currentUserId = "user_demo";
  const selectedInstanceId = detail.loadout[0]?.id;

  const availableDefaultSlots = useMemo(
    () => detail.availableCharacters.slice(0, 3).map((item) => item.id),
    [detail.availableCharacters]
  );

  useEffect(() => {
    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
      socket.emit("battle:join", initialDetail.battle.id);
    });

    socket.on("battle:detail", (payload: MockBattleDetail) => {
      setDetail(payload);
      setStatus((current) =>
        current.startsWith("正在") ? "已收到实时战局更新" : current
      );
    });

    socket.on("battle:result", (payload: BattleResult) => {
      setDetail((current) => ({
        ...current,
        battle: {
          ...current.battle,
          status: "ENDED"
        },
        result: payload
      }));
      setStatus("战局已封盘，可以查看结果页");
    });

    socket.on("connect_error", () => {
      setStatus("实时连接失败，当前使用请求刷新回退");
    });

    return () => {
      socket.emit("battle:leave", initialDetail.battle.id);
      socket.close();
    };
  }, [initialDetail.battle.id]);

  async function refreshBattleDetail() {
    const response = await fetch(`${API_BASE_URL}/battles/${detail.battle.id}/detail`, {
      method: "GET"
    });

    if (!response.ok) {
      throw new Error("刷新战局失败");
    }

    const payload = (await response.json()) as MockBattleDetail;
    setDetail(payload);
  }

  async function handleEnterBattle(payload?: EnterBattlePayload) {
    setBusy(true);
    setStatus("正在提交入场编队...");

    try {
      const response = await fetch(`${API_BASE_URL}/battles/${detail.battle.id}/openclaw/enter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: currentUserId,
          side: payload?.side ?? "A",
          slots: (payload?.slots ?? availableDefaultSlots).map((characterId) => ({ characterId }))
        })
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: { message?: string } };
        throw new Error(error.error?.message ?? "入场失败");
      }

      await refreshBattleDetail();
      setStatus("入场成功，编队已更新");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "入场失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleActionSubmit(action: string, instruction: string) {
    if (!selectedInstanceId) {
      setStatus("当前没有可操作的龙虾");
      return;
    }

    setBusy(true);
    setStatus("正在触发动作...");

    try {
      const response = await fetch(`${API_BASE_URL}/battles/${detail.battle.id}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: currentUserId,
          usingInstanceId: selectedInstanceId,
          action,
          instruction
        })
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: { message?: string } };
        throw new Error(error.error?.message ?? "动作失败");
      }

      await refreshBattleDetail();
      setStatus("动作已触发，战局数据已刷新");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "动作失败");
    } finally {
      setBusy(false);
    }
  }

  async function handleFinalize() {
    setBusy(true);
    setStatus("正在封盘结算...");

    try {
      const response = await fetch(`${API_BASE_URL}/battles/${detail.battle.id}/finalize`, {
        method: "POST"
      });

      if (!response.ok) {
        const error = (await response.json()) as { error?: { message?: string } };
        throw new Error(error.error?.message ?? "封盘失败");
      }

      await refreshBattleDetail();
      setStatus("战局已经封盘，可以查看结果页");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "封盘失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <BattleHeader detail={detail} />

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <span>{status}</span>
          <span className="text-xs text-slate-500">系统会自动推进战局，新的系统发言会实时插入时间线。</span>
        </div>
        {detail.result ? (
          <Link
            href={`/battles/${detail.battle.id}/result`}
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
          >
            查看结果页
          </Link>
        ) : null}
      </div>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_360px]">
        <BattleTimeline detail={detail} />
        <ActionDock
          detail={detail}
          busy={busy}
          onEnterBattle={handleEnterBattle}
          onActionSubmit={handleActionSubmit}
          onFinalize={handleFinalize}
        />
      </section>
    </>
  );
}
