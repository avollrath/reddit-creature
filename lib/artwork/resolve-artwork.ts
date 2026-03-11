import "server-only";

import type { Creature } from "@/lib/creatures";
import {
  createArtworkCacheKey,
  readArtworkFromCache,
  writeArtworkToCache,
} from "@/lib/artwork/cache";
import { pollinationsCreatureArtworkProvider } from "@/lib/artwork/pollinations-provider";
import { buildCreatureArtworkPrompt } from "@/lib/artwork/prompt-builder";
import type { CreatureArtworkResult } from "@/lib/artwork/types";

const inFlightArtwork = new Map<string, Promise<CreatureArtworkResult>>();

function getFallbackResult(
  reason: "missing_api_key" | "generation_failed" | "timeout"
): CreatureArtworkResult {
  return {
    kind: "fallback",
    reason,
  };
}

export async function resolveCreatureArtwork(
  creature: Creature
): Promise<CreatureArtworkResult> {
  const prompt = buildCreatureArtworkPrompt(creature);
  const cacheKey = createArtworkCacheKey({
    username: creature.username,
    prompt,
    model: pollinationsCreatureArtworkProvider.model,
  });

  console.info("[artwork-resolver] Resolving artwork", {
    username: creature.username,
    model: pollinationsCreatureArtworkProvider.model,
    cacheKey,
  });

  const cachedArtwork = await readArtworkFromCache(cacheKey);

  if (cachedArtwork) {
    console.info("[artwork-resolver] Cache hit", {
      username: creature.username,
      model: pollinationsCreatureArtworkProvider.model,
      cacheKey,
      byteLength: cachedArtwork.byteLength,
    });
    return {
      kind: "generated",
        artwork: {
          bytes: cachedArtwork,
          mimeType: "image/png",
          model: pollinationsCreatureArtworkProvider.model,
        },
      };
  }

  console.info("[artwork-resolver] Cache miss", {
    username: creature.username,
    model: pollinationsCreatureArtworkProvider.model,
    cacheKey,
  });

  if (!pollinationsCreatureArtworkProvider.isConfigured()) {
    console.warn("[artwork-resolver] Provider not configured, using fallback", {
      username: creature.username,
      model: pollinationsCreatureArtworkProvider.model,
      cacheKey,
    });
    return getFallbackResult("missing_api_key");
  }

  const existingRequest = inFlightArtwork.get(cacheKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
    try {
      const artwork = await pollinationsCreatureArtworkProvider.generate(
        creature,
        prompt
      );

      if (!artwork.ok) {
        console.warn("[artwork-resolver] Provider generation failed", {
          username: creature.username,
          model: pollinationsCreatureArtworkProvider.model,
          reason: artwork.error.reason,
          message: artwork.error.message,
        });
        return getFallbackResult(
          artwork.error.reason === "timeout"
            ? "timeout"
            : artwork.error.reason === "missing_api_key"
              ? "missing_api_key"
              : "generation_failed"
        );
      }

      try {
        await writeArtworkToCache(cacheKey, artwork.artwork.bytes);
      } catch (error) {
        console.warn("[artwork-resolver] Failed to write cache entry", {
          username: creature.username,
          cacheKey,
          model: pollinationsCreatureArtworkProvider.model,
          message: error instanceof Error ? error.message : String(error),
        });
      }

      return {
        kind: "generated",
        artwork: artwork.artwork,
      } satisfies CreatureArtworkResult;
    } catch (error) {
      console.error("[artwork-resolver] Unexpected resolver failure", {
        username: creature.username,
        cacheKey,
        model: pollinationsCreatureArtworkProvider.model,
        message: error instanceof Error ? error.message : String(error),
      });
      return getFallbackResult("generation_failed");
    }
  })().finally(() => {
    inFlightArtwork.delete(cacheKey);
  });

  inFlightArtwork.set(cacheKey, request);

  return request;
}
