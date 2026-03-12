export const CHESSCOM_PLAYER_ROUTE_SOURCE = "chesscom-pubapi";

export type ChessComPlayerRouteSource = typeof CHESSCOM_PLAYER_ROUTE_SOURCE;

export type ChessComModeStats = {
  last?: {
    rating?: number | null;
  } | null;
  best?: {
    rating?: number | null;
  } | null;
  record?: {
    win?: number | null;
    loss?: number | null;
    draw?: number | null;
  } | null;
} | null;

export type ChessComPlayerResponse = {
  username?: string | null;
  name?: string | null;
  avatar?: string | null;
  title?: string | null;
  followers?: number | null;
  country?: string | null;
  joined?: number | null;
  last_online?: number | null;
  status?: string | null;
  is_streamer?: boolean | null;
};

export type ChessComStatsResponse = {
  chess_rapid?: ChessComModeStats;
  chess_blitz?: ChessComModeStats;
  chess_bullet?: ChessComModeStats;
  chess_daily?: ChessComModeStats;
  tactics?: {
    highest?: {
      rating?: number | null;
    } | null;
  } | null;
  puzzle_rush?: {
    best?: {
      score?: number | null;
    } | null;
  } | null;
};

export type ChessComNormalizedPlayer = {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  title: string | null;
  followers: number | null;
  countryUrl: string | null;
  joined: number | null;
  lastOnline: number | null;
  status: string | null;
  isStreamer: boolean;
  rapidRating: number | null;
  rapidBest: number | null;
  rapidWins: number | null;
  rapidLosses: number | null;
  rapidDraws: number | null;
  blitzRating: number | null;
  blitzBest: number | null;
  blitzWins: number | null;
  blitzLosses: number | null;
  blitzDraws: number | null;
  bulletRating: number | null;
  bulletBest: number | null;
  bulletWins: number | null;
  bulletLosses: number | null;
  bulletDraws: number | null;
  dailyRating: number | null;
  dailyBest: number | null;
  dailyWins: number | null;
  dailyLosses: number | null;
  dailyDraws: number | null;
  puzzleBest: number | null;
  tacticsBest: number | null;
  partial: boolean;
  warnings: string[];
  source: ChessComPlayerRouteSource;
};

export type ChessComPlayerError = {
  error: string;
  source: ChessComPlayerRouteSource;
  username?: string;
};
