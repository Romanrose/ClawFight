import { PrismaClient } from "@prisma/client";

const runtimeStoreStateKey = "runtime-store";
const globalForPrisma = globalThis as typeof globalThis & {
  clawFightPrisma?: PrismaClient;
};
const prisma =
  globalForPrisma.clawFightPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.clawFightPrisma = prisma;
}

export type PersistedState<TStore> = {
  runtimeStore: TStore;
  instanceCounter: number;
  messageCounter: number;
};

export async function loadPersistedState<TStore>() {
  const record = await prisma.appState.findUnique({
    where: {
      key: runtimeStoreStateKey
    }
  });

  if (!record) {
    return null;
  }

  return JSON.parse(record.value) as PersistedState<TStore>;
}

export async function savePersistedState<TStore>(state: PersistedState<TStore>) {
  const serializedState = JSON.stringify(state);

  await prisma.appState.upsert({
    where: {
      key: runtimeStoreStateKey
    },
    create: {
      key: runtimeStoreStateKey,
      value: serializedState
    },
    update: {
      value: serializedState
    }
  });
}

export async function closePersistence() {
  await prisma.$disconnect();
}
