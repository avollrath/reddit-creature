import "server-only";

import { getAbsoluteUrl } from "@/lib/site";
import { normalizeUsername } from "@/lib/creatures/local-profile";
import { toCreatureProfileSnapshot } from "@/lib/reddit/transform-about";
import {
  REDDIT_USER_ROUTE_SOURCE,
  type RedditUserProfile,
  type RedditUserProfileError,
} from "@/lib/reddit/types";

const REDDIT_PROFILE_REVALIDATE_SECONDS = 1800;

function isRedditUserProfile(value: unknown): value is RedditUserProfile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RedditUserProfile>;

  return (
    typeof candidate.username === "string" &&
    typeof candidate.totalKarma === "number" &&
    typeof candidate.commentKarma === "number" &&
    typeof candidate.linkKarma === "number" &&
    (typeof candidate.createdUtc === "number" || candidate.createdUtc === null) &&
    (typeof candidate.avatarUrl === "string" || candidate.avatarUrl === null) &&
    (typeof candidate.subredditTitle === "string" ||
      candidate.subredditTitle === null) &&
    (typeof candidate.subredditDescription === "string" ||
      candidate.subredditDescription === null) &&
    (typeof candidate.subscribers === "number" || candidate.subscribers === null) &&
    candidate.source === REDDIT_USER_ROUTE_SOURCE
  );
}

function isRedditUserProfileError(value: unknown): value is RedditUserProfileError {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RedditUserProfileError>;

  return (
    typeof candidate.error === "string" &&
    candidate.source === REDDIT_USER_ROUTE_SOURCE
  );
}

export async function fetchRedditAboutSnapshot(
  username: string
): Promise<RedditUserProfile | null> {
  const normalizedUsername = normalizeUsername(username);

  if (normalizedUsername === "unknown_redditor") {
    return null;
  }

  const requestUrl = getAbsoluteUrl(
    `/api/reddit-user/${encodeURIComponent(normalizedUsername)}`
  );

  try {
    console.info("[reddit-about] Fetching local Reddit proxy", {
      username: normalizedUsername,
      requestUrl,
    });

    const response = await fetch(requestUrl, {
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: REDDIT_PROFILE_REVALIDATE_SECONDS,
      },
    });

    const payload = (await response.json().catch(() => null)) as
      | RedditUserProfile
      | RedditUserProfileError
      | null;

    if (!response.ok) {
      console.warn("[reddit-about] Local Reddit proxy failed", {
        username: normalizedUsername,
        requestUrl,
        status: response.status,
        statusText: response.statusText,
        error:
          payload && isRedditUserProfileError(payload)
            ? payload.error
            : "Unknown proxy failure.",
      });
      return null;
    }

    if (!payload || !isRedditUserProfile(payload)) {
      console.warn("[reddit-about] Local Reddit proxy returned invalid payload", {
        username: normalizedUsername,
        requestUrl,
      });
      return null;
    }

    console.info("[reddit-about] Local Reddit proxy resolved", {
      username: normalizedUsername,
      totalKarma: payload.totalKarma,
      createdUtc: payload.createdUtc,
      source: payload.source,
    });

    return payload;
  } catch (error) {
    console.warn("[reddit-about] Local Reddit proxy errored", {
      username: normalizedUsername,
      requestUrl,
      message: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function fetchRedditCreatureProfileSnapshot(username: string) {
  const normalizedUsername = normalizeUsername(username);
  const snapshot = await fetchRedditAboutSnapshot(normalizedUsername);
  return snapshot ? toCreatureProfileSnapshot(snapshot) : null;
}
