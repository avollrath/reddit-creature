export type CreatureRarity = "Common" | "Rare" | "Epic" | "Legendary";

export type BehaviorArchetype = "commenter" | "poster" | "balanced";

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
  };
  grounding: {
    source: "local" | "reddit";
    behaviorArchetype: BehaviorArchetype;
    accountAgeYears: number | null;
    totalKarma: number | null;
    isVerified: boolean;
    hasPremium: boolean;
    prefersNightmode: boolean;
    over18: boolean;
    isModeratorLike: boolean;
  };
  stats: {
    karma: string;
    cakeDay: string;
    alignment: string;
  };
};

export type RedditProfileSnapshot = {
  username: string;
  displayName?: string | null;
  source?: "local" | "reddit";
  createdUtc?: number | null;
  accountAgeYears?: number | null;
  linkKarma?: number | null;
  commentKarma?: number | null;
  totalKarma?: number | null;
  behaviorArchetype?: BehaviorArchetype | null;
  hasVerifiedEmail?: boolean | null;
  isVerified?: boolean | null;
  hasPremium?: boolean | null;
  prefersNightmode?: boolean | null;
  over18?: boolean | null;
  isModeratorLike?: boolean | null;
  cakeDayYear?: number | null;
  cakeDayMonth?: number | null;
  preferredImageUrl?: string | null;
};
