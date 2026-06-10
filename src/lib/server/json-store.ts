import "server-only";

import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");

/** Vercel/serverless has a read-only filesystem — skip `.data` writes there. */
export function canUseLocalDataFiles(): boolean {
  if (process.env.VERCEL === "1") return false;
  if (process.env.YVITY_FORCE_LOCAL_DATA === "true") return true;
  if (process.env.NODE_ENV === "production") return false;
  return true;
}

export async function loadJsonFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJsonFile<T>(filename: string, data: T): Promise<void> {
  if (!canUseLocalDataFiles()) return;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.warn(
      `[json-store] skipped write ${filename}:`,
      error instanceof Error ? error.message : error,
    );
  }
}
