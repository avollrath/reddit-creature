import type { RedditProfileSnapshot } from "@/lib/creatures/types";

export function normalizeUsername(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(?:www\.)?reddit\.com\//, "")
    .replace(/^\/+/, "")
    .replace(/^(?:u|user)\//, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");

  return normalized || "unknown_redditor";
}

export function createLocalProfileSnapshot(
  username: string
): RedditProfileSnapshot {
  return {
    username: normalizeUsername(username),
    displayName:
      username.trim().replace(/^\/?(?:u|user)\//i, "") ||
      normalizeUsername(username),
    source: "local",
  };
}
