import type { PlayerProfileSnapshot } from "@/lib/creatures/types";
import { normalizeUsername } from "@/lib/creatures/local-profile";
import {
  CHESSCOM_PLAYER_ROUTE_SOURCE,
  type ChessComModeStats,
  type ChessComNormalizedPlayer,
  type ChessComPlayerResponse,
  type ChessComStatsResponse,
} from "@/lib/chesscom/types";

function toSafeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toSafeString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeModeStats(mode: ChessComModeStats | undefined) {
  return {
    rating: toSafeNumber(mode?.last?.rating),
    best: toSafeNumber(mode?.best?.rating),
    wins: toSafeNumber(mode?.record?.win),
    losses: toSafeNumber(mode?.record?.loss),
    draws: toSafeNumber(mode?.record?.draw),
  };
}

export function normalizeChessComResponses(input: {
  requestedUsername: string;
  profile: ChessComPlayerResponse;
  stats: ChessComStatsResponse | null;
  warnings?: string[];
}): ChessComNormalizedPlayer | null {
  const username = normalizeUsername(
    toSafeString(input.profile.username) || input.requestedUsername
  );

  if (username === "unknown-player") {
    return null;
  }

  const rapid = normalizeModeStats(input.stats?.chess_rapid);
  const blitz = normalizeModeStats(input.stats?.chess_blitz);
  const bullet = normalizeModeStats(input.stats?.chess_bullet);
  const daily = normalizeModeStats(input.stats?.chess_daily);
  const tacticsBest = toSafeNumber(input.stats?.tactics?.highest?.rating);
  const puzzleRushBest = toSafeNumber(input.stats?.puzzle_rush?.best?.score);
  const warnings = [...(input.warnings ?? [])];

  if (!input.stats) {
    warnings.push("Stats are currently unavailable. The card uses profile-first data.");
  }

  return {
    username,
    displayName: toSafeString(input.profile.name) || toSafeString(input.profile.username),
    avatarUrl: toSafeString(input.profile.avatar),
    title: toSafeString(input.profile.title),
    followers: toSafeNumber(input.profile.followers),
    countryUrl: toSafeString(input.profile.country),
    joined: toSafeNumber(input.profile.joined),
    lastOnline: toSafeNumber(input.profile.last_online),
    status: toSafeString(input.profile.status),
    isStreamer: input.profile.is_streamer === true,
    rapidRating: rapid.rating,
    rapidBest: rapid.best,
    rapidWins: rapid.wins,
    rapidLosses: rapid.losses,
    rapidDraws: rapid.draws,
    blitzRating: blitz.rating,
    blitzBest: blitz.best,
    blitzWins: blitz.wins,
    blitzLosses: blitz.losses,
    blitzDraws: blitz.draws,
    bulletRating: bullet.rating,
    bulletBest: bullet.best,
    bulletWins: bullet.wins,
    bulletLosses: bullet.losses,
    bulletDraws: bullet.draws,
    dailyRating: daily.rating,
    dailyBest: daily.best,
    dailyWins: daily.wins,
    dailyLosses: daily.losses,
    dailyDraws: daily.draws,
    puzzleBest: tacticsBest ?? puzzleRushBest,
    tacticsBest: tacticsBest ?? puzzleRushBest,
    partial:
      !input.stats ||
      [rapid.rating, blitz.rating, bullet.rating, daily.rating, tacticsBest].every(
        (value) => value === null
      ),
    warnings,
    source: CHESSCOM_PLAYER_ROUTE_SOURCE,
  };
}

export function toPlayerProfileSnapshot(
  profile: ChessComNormalizedPlayer,
  lookupState: "ok" | "not_found" | "unavailable" = "ok",
  lookupMessage: string | null = null
): PlayerProfileSnapshot {
  return {
    username: profile.username,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    title: profile.title,
    followers: profile.followers,
    countryUrl: profile.countryUrl,
    joined: profile.joined,
    lastOnline: profile.lastOnline,
    status: profile.status,
    isStreamer: profile.isStreamer,
    rapidRating: profile.rapidRating,
    rapidBest: profile.rapidBest,
    rapidWins: profile.rapidWins,
    rapidLosses: profile.rapidLosses,
    rapidDraws: profile.rapidDraws,
    blitzRating: profile.blitzRating,
    blitzBest: profile.blitzBest,
    blitzWins: profile.blitzWins,
    blitzLosses: profile.blitzLosses,
    blitzDraws: profile.blitzDraws,
    bulletRating: profile.bulletRating,
    bulletBest: profile.bulletBest,
    bulletWins: profile.bulletWins,
    bulletLosses: profile.bulletLosses,
    bulletDraws: profile.bulletDraws,
    dailyRating: profile.dailyRating,
    dailyBest: profile.dailyBest,
    dailyWins: profile.dailyWins,
    dailyLosses: profile.dailyLosses,
    dailyDraws: profile.dailyDraws,
    puzzleBest: profile.puzzleBest,
    tacticsBest: profile.tacticsBest,
    source: "chesscom",
    lookupState,
    lookupMessage,
    limitedData: profile.partial,
    warnings: profile.warnings,
  };
}
