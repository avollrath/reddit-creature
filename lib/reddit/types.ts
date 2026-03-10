import type { BehaviorArchetype } from "@/lib/creatures/types";

export type RedditAboutSnapshot = {
  username: string;
  displayName: string;
  createdUtc: number | null;
  accountAgeYears: number | null;
  linkKarma: number;
  commentKarma: number;
  totalKarma: number;
  behaviorArchetype: BehaviorArchetype;
  hasVerifiedEmail: boolean;
  isVerified: boolean;
  hasPremium: boolean;
  prefersNightmode: boolean;
  over18: boolean;
  isModeratorLike: boolean;
  preferredImageUrl: string | null;
  cakeDayYear: number | null;
  cakeDayMonth: number | null;
};

export type RedditAboutResponse = {
  kind?: string;
  data?: {
    name?: string | null;
    created_utc?: number | null;
    link_karma?: number | null;
    comment_karma?: number | null;
    total_karma?: number | null;
    has_verified_email?: boolean | null;
    verified?: boolean | null;
    is_gold?: boolean | null;
    has_subscribed_to_premium?: boolean | null;
    has_gold_subscription?: boolean | null;
    pref_nightmode?: boolean | null;
    over_18?: boolean | null;
    is_mod?: boolean | null;
    icon_img?: string | null;
    snoovatar_img?: string | null;
    subreddit?: {
      title?: string | null;
      display_name_prefixed?: string | null;
      icon_img?: string | null;
      community_icon?: string | null;
      user_is_moderator?: boolean | null;
    } | null;
  } | null;
};
