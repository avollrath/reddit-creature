import "server-only";

import { getAbsoluteUrl } from "@/lib/site";
import { normalizeUsername } from "@/lib/creatures/local-profile";
import { toPlayerProfileSnapshot } from "@/lib/chesscom/transform";
import {
  CHESSCOM_PLAYER_ROUTE_SOURCE,
  type ChessComNormalizedPlayer,
  type ChessComPlayerError,
} from "@/lib/chesscom/types";
import type { PlayerProfileSnapshot } from "@/lib/creatures/types";

const CHESS_PROFILE_REVALIDATE_SECONDS = 3600;

function isNormalizedPlayer(value: unknown): value is ChessComNormalizedPlayer {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ChessComNormalizedPlayer>;
  return (
    typeof candidate.username === "string" &&
    candidate.source === CHESSCOM_PLAYER_ROUTE_SOURCE &&
    Array.isArray(candidate.warnings)
  );
}

function isPlayerError(value: unknown): value is ChessComPlayerError {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ChessComPlayerError>;
  return (
    typeof candidate.error === "string" &&
    candidate.source === CHESSCOM_PLAYER_ROUTE_SOURCE
  );
}

export type PlayerSnapshotLookup = {
  profile: PlayerProfileSnapshot | null;
  status: "ok" | "not_found" | "unavailable";
  message: string | null;
};

export async function fetchChessPlayerSnapshot(
  username: string
): Promise<PlayerSnapshotLookup> {
  const normalizedUsername = normalizeUsername(username);

  if (normalizedUsername === "unknown-player") {
    return {
      profile: null,
      status: "not_found",
      message: "Enter a Chess.com username to forge a player card.",
    };
  }

  const requestUrl = getAbsoluteUrl(
    `/api/chess-player/${encodeURIComponent(normalizedUsername)}`
  );

  try {
    const response = await fetch(requestUrl, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: CHESS_PROFILE_REVALIDATE_SECONDS,
      },
    });

    const payload = (await response.json().catch(() => null)) as
      | ChessComNormalizedPlayer
      | ChessComPlayerError
      | null;

    if (!response.ok) {
      const errorMessage =
        payload && isPlayerError(payload)
          ? payload.error
          : "Chess.com player data is temporarily unavailable.";

      return {
        profile: null,
        status: response.status === 404 ? "not_found" : "unavailable",
        message: errorMessage,
      };
    }

    if (!payload || !isNormalizedPlayer(payload)) {
      return {
        profile: null,
        status: "unavailable",
        message: "Chess.com returned an invalid player payload.",
      };
    }

    return {
      profile: toPlayerProfileSnapshot(payload),
      status: "ok",
      message: payload.warnings[0] ?? null,
    };
  } catch (error) {
    return {
      profile: null,
      status: "unavailable",
      message:
        error instanceof Error
          ? error.message
          : "Chess.com player data is temporarily unavailable.",
    };
  }
}
