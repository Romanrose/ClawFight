import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const defaultStoreFile = resolve(currentDir, "../data/runtime-store.json");

export type PersistedState<TStore> = {
  runtimeStore: TStore;
  instanceCounter: number;
  messageCounter: number;
};

export function getStoreFilePath() {
  return resolve(process.cwd(), process.env.BATTLE_STORE_FILE ?? defaultStoreFile);
}

export async function loadPersistedState<TStore>() {
  const storeFile = getStoreFilePath();

  try {
    const raw = await readFile(storeFile, "utf8");
    return JSON.parse(raw) as PersistedState<TStore>;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

export async function savePersistedState<TStore>(state: PersistedState<TStore>) {
  const storeFile = getStoreFilePath();
  await mkdir(dirname(storeFile), { recursive: true });

  const tempFile = `${storeFile}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`;
  await writeFile(tempFile, JSON.stringify(state, null, 2), "utf8");
  await rename(tempFile, storeFile);
}
