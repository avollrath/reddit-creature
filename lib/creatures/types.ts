export type CreatureRarity =
  | "Common"
  | "Rare"
  | "Epic"
  | "Legendary"
  | "Mythic"
  | "Grandmaster";

export type LookupState = "ok" | "not_found" | "unavailable";

export type ChessMode = "rapid" | "blitz" | "bullet" | "daily" | "puzzles";

export type CreatureStatIcon =
  | "power"
  | "speed"
  | "tactics"
  | "precision"
  | "endurance"
  | "prestige";

export type CreatureStat = {
  label: string;
  value: number;
  display: string;
  icon: CreatureStatIcon;
};

export type Creature = {
  name: string;
  title: string;
  description: string;
  rarity: CreatureRarity;
  rarityAccent: string;
  imageUrl: string;
  username: string;
  displayName: string;
  metadata: {
    power: number;
    affinity: string;
    traitLabel: string;
    titleBadge: string;
    strongestModeLabel: string;
  };
  grounding: {
    source: "local" | "chesscom";
    lookupState: LookupState;
    lookupMessage: string | null;
    warnings: string[];
    limitedData: boolean;
    accountAgeYears: number | null;
    followers: number | null;
    title: string | null;
    status: string | null;
    countryCode: string | null;
    isStreamer: boolean;
    strongestMode: ChessMode;
    rapidRating: number | null;
    blitzRating: number | null;
    bulletRating: number | null;
    dailyRating: number | null;
    puzzleBest: number | null;
    tacticsBest: number | null;
  };
  stats: CreatureStat[];
  details: {
    memberSince: string;
    signature: string;
    record: string;
  };
};

export type PlayerProfileSnapshot = {
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
  source: "local" | "chesscom";
  lookupState: LookupState;
  lookupMessage: string | null;
  limitedData: boolean;
  warnings: string[];
};
