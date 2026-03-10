import type { RedditProfileSnapshot } from "@/lib/creatures/types";
import { normalizeUsername } from "@/lib/creatures/local-profile";
import type { RedditAboutResponse, RedditAboutSnapshot } from "@/lib/reddit/types";

function sanitizeRedditImageUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const decoded = value.replace(/&amp;/g, "&").trim();
  return decoded.startsWith("http") ? decoded : null;
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

export function transformRedditAboutResponse(
  payload: RedditAboutResponse,
  requestedUsername: string
): RedditAboutSnapshot | null {
  const data = payload.data;

  if (!data) {
    return null;
  }

  const username = normalizeUsername(data.name || requestedUsername);
  const rawDisplayName =
    data.subreddit?.title ||
    data.name ||
    data.subreddit?.display_name_prefixed?.replace(/^u\//i, "") ||
    requestedUsername;
  const createdUtc =
    typeof data.created_utc === "number" && Number.isFinite(data.created_utc)
      ? data.created_utc
      : null;
  const createdDate = createdUtc ? new Date(createdUtc * 1000) : null;
  const linkKarma = Math.max(0, Number(data.link_karma ?? 0));
  const commentKarma = Math.max(0, Number(data.comment_karma ?? 0));
  const totalKarma = Math.max(
    linkKarma + commentKarma,
    Number(data.total_karma ?? linkKarma + commentKarma)
  );
  const accountAgeYears = createdDate
    ? Math.max(
        0,
        Number(((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1))
      )
    : null;

  return {
    username,
    displayName: rawDisplayName.trim() || username,
    createdUtc,
    accountAgeYears,
    linkKarma,
    commentKarma,
    totalKarma,
    behaviorArchetype: getBehaviorArchetype(linkKarma, commentKarma),
    hasVerifiedEmail: Boolean(data.has_verified_email),
    isVerified: Boolean(data.verified),
    hasPremium: Boolean(
      data.is_gold || data.has_subscribed_to_premium || data.has_gold_subscription
    ),
    prefersNightmode: Boolean(data.pref_nightmode),
    over18: Boolean(data.over_18),
    isModeratorLike: Boolean(data.is_mod || data.subreddit?.user_is_moderator),
    preferredImageUrl:
      sanitizeRedditImageUrl(data.snoovatar_img) ||
      sanitizeRedditImageUrl(data.icon_img) ||
      sanitizeRedditImageUrl(data.subreddit?.icon_img) ||
      sanitizeRedditImageUrl(data.subreddit?.community_icon),
    cakeDayYear: createdDate ? createdDate.getUTCFullYear() : null,
    cakeDayMonth: createdDate ? createdDate.getUTCMonth() + 1 : null,
  };
}

export function toCreatureProfileSnapshot(
  snapshot: RedditAboutSnapshot
): RedditProfileSnapshot {
  return {
    username: snapshot.username,
    displayName: snapshot.displayName,
    source: "reddit",
    createdUtc: snapshot.createdUtc,
    accountAgeYears: snapshot.accountAgeYears,
    linkKarma: snapshot.linkKarma,
    commentKarma: snapshot.commentKarma,
    totalKarma: snapshot.totalKarma,
    behaviorArchetype: snapshot.behaviorArchetype,
    hasVerifiedEmail: snapshot.hasVerifiedEmail,
    isVerified: snapshot.isVerified,
    hasPremium: snapshot.hasPremium,
    prefersNightmode: snapshot.prefersNightmode,
    over18: snapshot.over18,
    isModeratorLike: snapshot.isModeratorLike,
    cakeDayYear: snapshot.cakeDayYear,
    cakeDayMonth: snapshot.cakeDayMonth,
    preferredImageUrl: snapshot.preferredImageUrl,
  };
}
