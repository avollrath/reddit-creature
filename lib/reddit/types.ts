export const REDDIT_USER_ROUTE_SOURCE = "server-proxied-public-about-json";

export type RedditUserRouteSource = typeof REDDIT_USER_ROUTE_SOURCE;

export type RedditUserProfile = {
  username: string;
  totalKarma: number;
  commentKarma: number;
  linkKarma: number;
  createdUtc: number | null;
  avatarUrl: string | null;
  subredditTitle: string | null;
  subredditDescription: string | null;
  subscribers: number | null;
  source: RedditUserRouteSource;
};

export type RedditUserProfileError = {
  error: string;
  source: RedditUserRouteSource;
  username?: string;
};

export type RedditAboutResponse = {
  kind?: string;
  data?: {
    name?: string | null;
    created_utc?: number | null;
    link_karma?: number | null;
    comment_karma?: number | null;
    total_karma?: number | null;
    icon_img?: string | null;
    snoovatar_img?: string | null;
    subreddit?: {
      title?: string | null;
      public_description?: string | null;
      subscribers?: number | null;
      display_name_prefixed?: string | null;
      icon_img?: string | null;
      community_icon?: string | null;
    } | null;
  } | null;
};
