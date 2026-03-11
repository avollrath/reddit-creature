import type { RedditProfileSnapshot } from "@/lib/creatures/types";
import { normalizeUsername } from "@/lib/creatures/local-profile";
import {
  REDDIT_USER_ROUTE_SOURCE,
  type RedditAboutResponse,
  type RedditUserProfile,
} from "@/lib/reddit/types";

function sanitizeRedditImageUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const decoded = value.replace(/&amp;/g, "&").trim();
  return decoded.startsWith("http") ? decoded : null;
}

function toSafeNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

export function transformRedditAboutResponse(
  payload: RedditAboutResponse,
  requestedUsername: string
): RedditUserProfile | null {
  const data = payload.data;

  if (!data) {
    return null;
  }

  const username = normalizeUsername(data.name || requestedUsername);
  const linkKarma = Math.max(0, Number(data.link_karma ?? 0));
  const commentKarma = Math.max(0, Number(data.comment_karma ?? 0));
  const totalKarma = Math.max(
    linkKarma + commentKarma,
    Number(data.total_karma ?? linkKarma + commentKarma)
  );

  return {
    username,
    totalKarma,
    commentKarma,
    linkKarma,
    createdUtc: toSafeNumber(data.created_utc),
    avatarUrl:
      sanitizeRedditImageUrl(data.snoovatar_img) ||
      sanitizeRedditImageUrl(data.icon_img) ||
      sanitizeRedditImageUrl(data.subreddit?.icon_img) ||
      sanitizeRedditImageUrl(data.subreddit?.community_icon),
    subredditTitle:
      data.subreddit?.title?.trim() ||
      data.subreddit?.display_name_prefixed?.replace(/^u\//i, "").trim() ||
      username,
    subredditDescription: data.subreddit?.public_description?.trim() || null,
    subscribers: toSafeNumber(data.subreddit?.subscribers),
    source: REDDIT_USER_ROUTE_SOURCE,
  };
}

function getBehaviorArchetype(linkKarma: number, commentKarma: number) {
  const ratio = linkKarma / Math.max(commentKarma, 1);

  if (ratio >= 1.45) {
    return "poster" as const;
  }

  if (ratio <= 0.68) {
    return "commenter" as const;
  }

  return "balanced" as const;
}

export function toCreatureProfileSnapshot(
  profile: RedditUserProfile
): RedditProfileSnapshot {
  const createdDate =
    typeof profile.createdUtc === "number"
      ? new Date(profile.createdUtc * 1000)
      : null;
  const accountAgeYears = createdDate
    ? Math.max(
        0,
        Number(
          (
            (Date.now() - createdDate.getTime()) /
            (1000 * 60 * 60 * 24 * 365.25)
          ).toFixed(1)
        )
      )
    : null;

  return {
    username: profile.username,
    displayName: profile.subredditTitle || profile.username,
    source: "reddit",
    createdUtc: profile.createdUtc,
    accountAgeYears,
    linkKarma: profile.linkKarma,
    commentKarma: profile.commentKarma,
    totalKarma: profile.totalKarma,
    behaviorArchetype: getBehaviorArchetype(
      profile.linkKarma,
      profile.commentKarma
    ),
    hasVerifiedEmail: null,
    isVerified: null,
    hasPremium: null,
    prefersNightmode: null,
    over18: null,
    isModeratorLike: null,
    cakeDayYear: createdDate ? createdDate.getUTCFullYear() : null,
    cakeDayMonth: createdDate ? createdDate.getUTCMonth() + 1 : null,
    preferredImageUrl: profile.avatarUrl,
  };
}
