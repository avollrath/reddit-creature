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
  creature: Creature,
  reason: "missing_api_key" | "generation_failed" | "timeout"
): CreatureArtworkResult {
  return {
    kind: "fallback",
    fallbackUrl: creature.imageUrl,
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

  const cachedArtwork = await readArtworkFromCache(cacheKey);

  if (cachedArtwork) {
    return {
      kind: "generated",
        artwork: {
          bytes: cachedArtwork,
          mimeType: "image/png",
          model: pollinationsCreatureArtworkProvider.model,
        },
      };
  }

  if (!pollinationsCreatureArtworkProvider.isConfigured()) {
    return getFallbackResult(creature, "missing_api_key");
  }

  const existingRequest = inFlightArtwork.get(cacheKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = (async () => {
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
        creature,
        artwork.error.reason === "timeout" ? "timeout" : artwork.error.reason === "missing_api_key" ? "missing_api_key" : "generation_failed"
      );
    }

    await writeArtworkToCache(cacheKey, artwork.artwork.bytes);

    return {
      kind: "generated",
      artwork: artwork.artwork,
    } satisfies CreatureArtworkResult;
  })().finally(() => {
    inFlightArtwork.delete(cacheKey);
  });

  inFlightArtwork.set(cacheKey, request);

  return request;
}
