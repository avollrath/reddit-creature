import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ARTWORK_CACHE_DIR = path.join(
  process.cwd(),
  ".cache",
  "creature-artwork"
);

function getCacheFilePath(cacheKey: string) {
  return path.join(ARTWORK_CACHE_DIR, `${cacheKey}.png`);
}

export function createArtworkCacheKey(input: {
  username: string;
  prompt: string;
  model: string;
}) {
  return createHash("sha256")
    .update(JSON.stringify({ version: 1, ...input }))
    .digest("hex");
}

export async function readArtworkFromCache(cacheKey: string) {
  try {
    const bytes = await readFile(getCacheFilePath(cacheKey));
    return new Uint8Array(bytes);
  } catch {
    return null;
  }
}

export async function writeArtworkToCache(cacheKey: string, bytes: Uint8Array) {
  await mkdir(ARTWORK_CACHE_DIR, { recursive: true });
  await writeFile(getCacheFilePath(cacheKey), bytes);
}
