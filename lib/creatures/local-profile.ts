import type { RedditProfileSnapshot } from "@/lib/creatures/types";

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/^u\//, "") || "unknown_redditor";
}

export function createLocalProfileSnapshot(
  username: string
): RedditProfileSnapshot {
  return {
    username: normalizeUsername(username),
    displayName: username.trim().replace(/^u\//i, "") || normalizeUsername(username),
    source: "local",
  };
}
