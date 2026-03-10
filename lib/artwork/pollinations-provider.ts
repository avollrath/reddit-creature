import "server-only";

import type { Creature } from "@/lib/creatures";
import type {
  ArtworkGenerationResult,
  CreatureArtworkProvider,
} from "@/lib/artwork/types";

const POLLINATIONS_IMAGE_MODEL = "flux";
const POLLINATIONS_BASE_URL = "https://gen.pollinations.ai/image";
const GENERATION_TIMEOUT_MS = 15000;
const OUTPUT_WIDTH = 1365;
const OUTPUT_HEIGHT = 1024;

function getApiKey() {
  return process.env.POLLINATIONS_API_KEY || null;
}

function buildPollinationsUrl(prompt: string, apiKey: string) {
  const encodedPrompt = encodeURIComponent(prompt);
  const searchParams = new URLSearchParams({
    model: POLLINATIONS_IMAGE_MODEL,
    key: apiKey,
    width: String(OUTPUT_WIDTH),
    height: String(OUTPUT_HEIGHT),
  });

  return `${POLLINATIONS_BASE_URL}/${encodedPrompt}?${searchParams.toString()}`;
}

class PollinationsCreatureArtworkProvider implements CreatureArtworkProvider {
  readonly model = POLLINATIONS_IMAGE_MODEL;

  isConfigured() {
    return Boolean(getApiKey());
  }

  async generate(
    creature: Creature,
    prompt: string
  ): Promise<ArtworkGenerationResult> {
    const apiKey = getApiKey();

    if (!apiKey) {
      console.warn("[artwork-provider] Missing Pollinations API key", {
        username: creature.username,
        model: this.model,
        apiKeyPresent: false,
      });

      return {
        ok: false,
        error: {
          reason: "missing_api_key",
          message: "Pollinations API key is not configured.",
        },
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);
    const requestUrl = buildPollinationsUrl(prompt, apiKey);

    try {
      console.info("[artwork-provider] Starting Pollinations generation", {
        username: creature.username,
        model: this.model,
        apiKeyPresent: true,
      });

      const response = await fetch(requestUrl, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.error("[artwork-provider] Pollinations request failed", {
          username: creature.username,
          model: this.model,
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });

        return {
          ok: false,
          error: {
            reason: "provider_error",
            message: `Pollinations request failed with ${response.status} ${response.statusText}`,
          },
        };
      }

      const bytes = new Uint8Array(await response.arrayBuffer());

      console.info("[artwork-provider] Pollinations response received", {
        username: creature.username,
        model: this.model,
        byteLength: bytes.byteLength,
      });

      if (!bytes.byteLength) {
        return {
          ok: false,
          error: {
            reason: "empty_result",
            message: "Provider returned no image bytes.",
          },
        };
      }

      return {
        ok: true,
        artwork: {
          bytes,
          mimeType: "image/png",
          model: this.model,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const reason = controller.signal.aborted ? "timeout" : "provider_error";

      console.error("[artwork-provider] Pollinations generation failed", {
        username: creature.username,
        model: this.model,
        reason,
        message,
      });

      return {
        ok: false,
        error: {
          reason,
          message,
        },
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const pollinationsCreatureArtworkProvider =
  new PollinationsCreatureArtworkProvider();
