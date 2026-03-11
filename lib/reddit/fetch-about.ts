import "server-only";

import { normalizeUsername } from "@/lib/creatures/local-profile";
import { transformRedditAboutResponse, toCreatureProfileSnapshot } from "@/lib/reddit/transform-about";
import type { RedditAboutResponse, RedditAboutSnapshot } from "@/lib/reddit/types";

const REDDIT_TIMEOUT_MS = 5000;
const REDDIT_USER_AGENT =
  process.env.REDDIT_PUBLIC_USER_AGENT ||
  "RedditCreatureMVP/0.1 (server-side about.json fetch)";

export async function fetchRedditAboutSnapshot(
  username: string
): Promise<RedditAboutSnapshot | null> {
  const normalizedUsername = normalizeUsername(username);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REDDIT_TIMEOUT_MS);
  const url = `https://www.reddit.com/user/${normalizedUsername}/about.json`;

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
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
    });

    if (!response.ok) {
      console.warn("[reddit-about] Fetch failed", {
        username: normalizedUsername,
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const payload = (await response.json()) as RedditAboutResponse;
    const snapshot = transformRedditAboutResponse(payload, normalizedUsername);

    if (!snapshot) {
      console.warn("[reddit-about] Invalid about.json payload", {
        username: normalizedUsername,
      });
      return null;
    }

    console.info("[reddit-about] Snapshot resolved", {
      username: normalizedUsername,
      totalKarma: snapshot.totalKarma,
      behaviorArchetype: snapshot.behaviorArchetype,
      hasPremium: snapshot.hasPremium,
      prefersNightmode: snapshot.prefersNightmode,
    });

    return snapshot;
  } catch (error) {
    console.warn("[reddit-about] Fetch errored", {
      username: normalizedUsername,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
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
