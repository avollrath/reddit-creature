import type { Creature } from "@/lib/creatures";

export type GeneratedArtwork = {
  bytes: Uint8Array;
  mimeType: string;
  model: string;
};

export type ArtworkGenerationFailure = {
  reason:
    | "missing_api_key"
    | "timeout"
    | "provider_error"
    | "empty_result";
  message: string;
};

export type ArtworkGenerationResult =
  | {
      ok: true;
      artwork: GeneratedArtwork;
    }
  | {
      ok: false;
      error: ArtworkGenerationFailure;
    };

export type CreatureArtworkResult =
  | {
      kind: "generated";
      artwork: GeneratedArtwork;
    }
  | {
      kind: "fallback";
      reason: "missing_api_key" | "generation_failed" | "timeout";
    };

export interface CreatureArtworkProvider {
  readonly model: string;
  isConfigured(): boolean;
  generate(
    creature: Creature,
    prompt: string
  ): Promise<ArtworkGenerationResult>;
}
