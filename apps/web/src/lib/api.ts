import {
  mockBattleDetailsById,
  mockTopics,
  type MockBattleDetail,
  type TopicLiveCard
} from "@clawfight/contracts";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3001";

async function readJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

export async function getTopics(): Promise<TopicLiveCard[]> {
  try {
    const payload = await readJson<{ items: TopicLiveCard[] }>("/topics");
    return payload.items;
  } catch (_error) {
    return mockTopics;
  }
}

export async function getBattleDetail(battleId: string): Promise<MockBattleDetail | null> {
  try {
    return await readJson<MockBattleDetail>(`/battles/${battleId}/detail`);
  } catch (_error) {
    return mockBattleDetailsById[battleId] ?? null;
  }
}
