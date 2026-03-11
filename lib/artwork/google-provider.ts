import "server-only";

import { GoogleGenAI } from "@google/genai";
import type { Creature } from "@/lib/creatures";
import type {
  ArtworkGenerationResult,
  CreatureArtworkProvider,
} from "@/lib/artwork/types";

const GOOGLE_IMAGE_MODEL = "imagen-4.0-fast-generate-001";
const GENERATION_TIMEOUT_MS = 15000;

function getApiKey() {
  return (
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    null
  );
}

let client: GoogleGenAI | null = null;

function getClient() {
  const apiKey = getApiKey();

  if (!apiKey) {
    return null;
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }

  return client;
}

class GoogleCreatureArtworkProvider implements CreatureArtworkProvider {
  readonly model = GOOGLE_IMAGE_MODEL;

  isConfigured() {
    return Boolean(getApiKey());
  }

  async generate(
    creature: Creature,
    prompt: string
  ): Promise<ArtworkGenerationResult> {
    const ai = getClient();

    if (!ai) {
      console.warn("[artwork-provider] Missing Google AI API key", {
        username: creature.username,
        model: this.model,
        apiKeyPresent: false,
      });
      return {
        ok: false,
        error: {
          reason: "missing_api_key",
          message: "Google AI API key is not configured.",
        },
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GENERATION_TIMEOUT_MS);

    try {
      console.info("[artwork-provider] Starting Google Imagen generation", {
        username: creature.username,
        model: this.model,
        apiKeyPresent: true,
        promptLength: prompt.length,
        timeoutMs: GENERATION_TIMEOUT_MS,
      });

      const response = await (
        ai.models.generateImages as unknown as (
          request: {
            model: string;
            contents: string;
            config: {
              numberOfImages: number;
              aspectRatio: string;
              outputMimeType: string;
            };
          },
          requestOptions?: { signal?: AbortSignal }
        ) => Promise<{
          generatedImages?: Array<{
            image?: {
              imageBytes?: string;
            };
          }>;
        }>
      )(
        {
          model: this.model,
          contents: prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: "3:4",
            outputMimeType: "image/png",
          },
        },
        { signal: controller.signal }
      );

      const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;

      console.info("[artwork-provider] Google Imagen response received", {
        username: creature.username,
        model: this.model,
        hasImageBytes: Boolean(imageBytes),
        generatedImageCount: response.generatedImages?.length ?? 0,
      });

      if (!imageBytes) {
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
          bytes: Uint8Array.from(Buffer.from(imageBytes, "base64")),
          mimeType: "image/png",
          model: this.model,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const reason = controller.signal.aborted ? "timeout" : "provider_error";

      console.error("[artwork-provider] Google Imagen generation failed", {
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

export const googleCreatureArtworkProvider =
  new GoogleCreatureArtworkProvider();
