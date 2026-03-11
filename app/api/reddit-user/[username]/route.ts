import { NextResponse } from "next/server";
import { normalizeUsername } from "@/lib/creatures/local-profile";
import { transformRedditAboutResponse } from "@/lib/reddit/transform-about";
import {
  REDDIT_USER_ROUTE_SOURCE,
  type RedditAboutResponse,
  type RedditUserProfileError,
} from "@/lib/reddit/types";

const REDDIT_PROFILE_REVALIDATE_SECONDS = 1800;
const REDDIT_PROFILE_CACHE_CONTROL =
  "s-maxage=1800, stale-while-revalidate=86400";
const REDDIT_USER_AGENT =
  "web:reddit-trading-card-generator:v1.0.0 (by /u/CharlieJaxon86)";

type RedditUserRouteProps = {
  params: Promise<{
    username: string;
  }>;
};

function jsonError(message: string, status: number, username?: string) {
  const body: RedditUserProfileError = {
    error: message,
    source: REDDIT_USER_ROUTE_SOURCE,
    ...(username ? { username } : {}),
  };

  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": REDDIT_PROFILE_CACHE_CONTROL,
    },
  });
}

export async function GET(_request: Request, { params }: RedditUserRouteProps) {
  const { username } = await params;
  const normalizedUsername = normalizeUsername(username);

  if (normalizedUsername === "unknown_redditor") {
    return jsonError(
      "Enter a Reddit username to summon a card.",
      400
    );
  }

  const redditUrl = `https://www.reddit.com/user/${encodeURIComponent(
    normalizedUsername
  )}/about.json`;

  try {
    console.info("[reddit-user-route] Fetching Reddit profile", {
      username: normalizedUsername,
      redditUrl,
      revalidateSeconds: REDDIT_PROFILE_REVALIDATE_SECONDS,
    });

    const response = await fetch(redditUrl, {
      headers: {
        "User-Agent": REDDIT_USER_AGENT,
        Accept: "application/json",
      },
      next: {
        revalidate: REDDIT_PROFILE_REVALIDATE_SECONDS,
      },
    });

    if (response.status === 404) {
      return jsonError(
        `No Reddit profile was found for u/${normalizedUsername}.`,
        404,
        normalizedUsername
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("[reddit-user-route] Reddit upstream failed", {
        username: normalizedUsername,
        status: response.status,
        statusText: response.statusText,
        bodyPreview: errorText.slice(0, 300),
      });
      return jsonError(
        "Reddit is not responding right now. Using fallback card data instead.",
        502,
        normalizedUsername
      );
    }

    const payload = (await response.json().catch(() => null)) as
      | RedditAboutResponse
      | null;

    if (!payload) {
      return jsonError(
        "Reddit returned invalid profile data.",
        502,
        normalizedUsername
      );
    }

    const profile = transformRedditAboutResponse(payload, normalizedUsername);

    if (!profile) {
      return jsonError(
        "Reddit returned an empty profile response.",
        502,
        normalizedUsername
      );
    }

    return NextResponse.json(profile, {
      headers: {
        "Cache-Control": REDDIT_PROFILE_CACHE_CONTROL,
      },
    });
  } catch (error) {
    console.error("[reddit-user-route] Reddit fetch errored", {
      username: normalizedUsername,
      message: error instanceof Error ? error.message : String(error),
    });
    return jsonError(
      "We could not reach Reddit right now. A fallback creature can still be generated.",
      502,
      normalizedUsername
    );
  }
}
