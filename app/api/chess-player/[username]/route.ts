import { NextResponse } from "next/server";
import { normalizeUsername } from "@/lib/creatures/local-profile";
import { normalizeChessComResponses } from "@/lib/chesscom/transform";
import {
  CHESSCOM_PLAYER_ROUTE_SOURCE,
  type ChessComNormalizedPlayer,
  type ChessComPlayerError,
  type ChessComPlayerResponse,
  type ChessComStatsResponse,
} from "@/lib/chesscom/types";

const CHESS_PROFILE_REVALIDATE_SECONDS = 3600;
const CHESS_PROFILE_CACHE_CONTROL = "s-maxage=3600, stale-while-revalidate=86400";
const CHESSCOM_USERNAME = process.env.CHESSCOM_CONTACT_USERNAME || "chess-player-card-generator";
const CHESSCOM_CONTACT_EMAIL =
  process.env.CHESSCOM_CONTACT_EMAIL || "noreply@example.com";
const CHESSCOM_USER_AGENT = `my-chess-card-app/1.0 (username: ${CHESSCOM_USERNAME}; contact: ${CHESSCOM_CONTACT_EMAIL})`;
const inFlightRequests = new Map<string, Promise<ResponsePayload>>();

type ChessPlayerRouteProps = {
  params: Promise<{
    username: string;
  }>;
};

type ResponsePayload =
  | {
      ok: true;
      status: number;
      body: ChessComNormalizedPlayer;
    }
  | {
      ok: false;
      status: number;
      body: ChessComPlayerError;
    };

function jsonError(message: string, status: number, username?: string) {
  return {
    ok: false,
    status,
    body: {
      error: message,
      source: CHESSCOM_PLAYER_ROUTE_SOURCE,
      ...(username ? { username } : {}),
    },
  } satisfies ResponsePayload;
}

async function fetchUpstreamJson<T>(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": CHESSCOM_USER_AGENT,
      Accept: "application/json",
    },
    next: {
      revalidate: CHESS_PROFILE_REVALIDATE_SECONDS,
    },
  });

  if (response.status === 404) {
    return { kind: "not_found" as const };
  }

  if (response.status === 429) {
    return { kind: "rate_limited" as const };
  }

  if (!response.ok) {
    return { kind: "error" as const, status: response.status };
  }

  const payload = (await response.json().catch(() => null)) as T | null;

  if (!payload || typeof payload !== "object") {
    return { kind: "invalid" as const };
  }

  return {
    kind: "ok" as const,
    payload,
  };
}

async function resolvePlayer(username: string): Promise<ResponsePayload> {
  const normalizedUsername = normalizeUsername(username);

  if (normalizedUsername === "unknown-player") {
    return jsonError("Enter a Chess.com username to forge a player card.", 400);
  }

  if (!/^[a-z0-9_-]{2,25}$/i.test(normalizedUsername)) {
    return jsonError("Use a valid Chess.com username or member URL.", 400, normalizedUsername);
  }

  const profileUrl = `https://api.chess.com/pub/player/${encodeURIComponent(normalizedUsername)}`;
  const statsUrl = `${profileUrl}/stats`;
  const profileResult = await fetchUpstreamJson<ChessComPlayerResponse>(profileUrl);

  if (profileResult.kind === "not_found") {
    return jsonError(`Player "${normalizedUsername}" was not found on Chess.com.`, 404, normalizedUsername);
  }

  if (profileResult.kind === "rate_limited") {
    return jsonError("Chess.com is rate limiting requests right now. Try again shortly.", 503, normalizedUsername);
  }

  if (profileResult.kind === "error" || profileResult.kind === "invalid") {
    return jsonError("Chess.com profile data is temporarily unavailable.", 502, normalizedUsername);
  }

  const warnings: string[] = [];
  let statsPayload: ChessComStatsResponse | null = null;
  const statsResult = await fetchUpstreamJson<ChessComStatsResponse>(statsUrl);

  if (statsResult.kind === "ok") {
    statsPayload = statsResult.payload;
  } else if (statsResult.kind === "not_found") {
    warnings.push("Stats were not published for this player yet.");
  } else if (statsResult.kind === "rate_limited") {
    warnings.push("Stats are temporarily rate limited. The card uses profile-first data.");
  } else if (statsResult.kind === "error" || statsResult.kind === "invalid") {
    warnings.push("Stats are temporarily unavailable. The card uses profile-first data.");
  }

  const normalized = normalizeChessComResponses({
    requestedUsername: normalizedUsername,
    profile: profileResult.payload,
    stats: statsPayload,
    warnings,
  });

  if (!normalized) {
    return jsonError("Chess.com returned an empty player profile.", 502, normalizedUsername);
  }

  return {
    ok: true,
    status: 200,
    body: normalized,
  };
}

export async function GET(_request: Request, { params }: ChessPlayerRouteProps) {
  const { username } = await params;
  const normalizedUsername = normalizeUsername(username);
  const existingRequest = inFlightRequests.get(normalizedUsername);
  const request = existingRequest ?? resolvePlayer(normalizedUsername);

  if (!existingRequest) {
    inFlightRequests.set(normalizedUsername, request);
  }

  const result = await request.finally(() => {
    inFlightRequests.delete(normalizedUsername);
  });

  return NextResponse.json(result.body, {
    status: result.status,
    headers: {
      "Cache-Control": CHESS_PROFILE_CACHE_CONTROL,
    },
  });
}
