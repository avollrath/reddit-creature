import "server-only";

import { normalizeUsername } from "@/lib/creatures/local-profile";
import { transformRedditAboutResponse, toCreatureProfileSnapshot } from "@/lib/reddit/transform-about";
import type { RedditAboutResponse, RedditAboutSnapshot } from "@/lib/reddit/types";

const REDDIT_TIMEOUT_MS = 5000;
const REDDIT_USER_AGENT =
  process.env.REDDIT_PUBLIC_USER_AGENT ||
  "RedditCreature/0.1 (+https://reddit-trading-card.vercel.app)";

const REDDIT_ABOUT_ENDPOINTS = [
  "https://www.reddit.com/user/{username}/about.json?raw_json=1",
  "https://api.reddit.com/user/{username}/about?raw_json=1",
] as const;

export async function fetchRedditAboutSnapshot(
  username: string
): Promise<RedditAboutSnapshot | null> {
  const normalizedUsername = normalizeUsername(username);
  for (const endpointTemplate of REDDIT_ABOUT_ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REDDIT_TIMEOUT_MS);
    const url = endpointTemplate.replace("{username}", normalizedUsername);

    try {
      console.info("[reddit-about] Starting about.json fetch", {
        username: normalizedUsername,
        url,
        timeoutMs: REDDIT_TIMEOUT_MS,
      });

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
        headers: {
          "User-Agent": REDDIT_USER_AGENT,
          Accept: "application/json",
        },
      });

      console.info("[reddit-about] Reddit about.json response received", {
        username: normalizedUsername,
        url,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get("content-type"),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn("[reddit-about] Fetch failed", {
          username: normalizedUsername,
          url,
          status: response.status,
          statusText: response.statusText,
          bodyPreview: errorText.slice(0, 300),
        });
        continue;
      }

      const payload = (await response.json()) as RedditAboutResponse;
      const snapshot = transformRedditAboutResponse(payload, normalizedUsername);

      if (!snapshot) {
        console.warn("[reddit-about] Invalid about.json payload", {
          username: normalizedUsername,
          url,
        });
        continue;
      }

      console.info("[reddit-about] Snapshot resolved", {
        username: normalizedUsername,
        url,
        totalKarma: snapshot.totalKarma,
        cakeDayMonth: snapshot.cakeDayMonth,
        cakeDayYear: snapshot.cakeDayYear,
        behaviorArchetype: snapshot.behaviorArchetype,
        hasPremium: snapshot.hasPremium,
        prefersNightmode: snapshot.prefersNightmode,
      });

      return snapshot;
    } catch (error) {
      console.warn("[reddit-about] Fetch errored", {
        username: normalizedUsername,
        url,
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return null;
}

export async function fetchRedditCreatureProfileSnapshot(username: string) {
  const normalizedUsername = normalizeUsername(username);
  console.info("[reddit-about] Resolving creature profile snapshot", {
    username: normalizedUsername,
  });
  const snapshot = await fetchRedditAboutSnapshot(username);
  console.info("[reddit-about] Creature profile snapshot resolved", {
    username: normalizedUsername,
    found: Boolean(snapshot),
    source: snapshot ? "reddit" : "fallback-local",
  });
  return snapshot ? toCreatureProfileSnapshot(snapshot) : null;
}
