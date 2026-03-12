import type { PlayerProfileSnapshot } from "@/lib/creatures/types";

export function normalizeUsername(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(?:www\.)?chess\.com\//, "")
    .replace(/^\/+/, "")
    .replace(/^(?:member)\//, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/^@/, "");

  return normalized || "unknown-player";
}

export function createLocalProfileSnapshot(
  username: string
): PlayerProfileSnapshot {
  const normalizedUsername = normalizeUsername(username);
  const displayName =
    username
      .trim()
      .replace(/^@/, "")
      .replace(/^https?:\/\/(?:www\.)?chess\.com\/member\//i, "")
      .replace(/^\/?member\//i, "") || normalizedUsername;

  return {
    username: normalizedUsername,
    displayName,
    avatarUrl: null,
    title: null,
    followers: null,
    countryUrl: null,
    joined: null,
    lastOnline: null,
    status: null,
    isStreamer: false,
    rapidRating: null,
    rapidBest: null,
    rapidWins: null,
    rapidLosses: null,
    rapidDraws: null,
    blitzRating: null,
    blitzBest: null,
    blitzWins: null,
    blitzLosses: null,
    blitzDraws: null,
    bulletRating: null,
    bulletBest: null,
    bulletWins: null,
    bulletLosses: null,
    bulletDraws: null,
    dailyRating: null,
    dailyBest: null,
    dailyWins: null,
    dailyLosses: null,
    dailyDraws: null,
    puzzleBest: null,
    tacticsBest: null,
    source: "local",
    lookupState: "unavailable",
    lookupMessage: "Live Chess.com data was unavailable, so this card uses a deterministic fallback profile.",
    limitedData: true,
    warnings: [
      "Live Chess.com data was unavailable, so this card uses a deterministic fallback profile.",
    ],
  };
}
