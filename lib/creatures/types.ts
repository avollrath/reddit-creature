export type CreatureRarity = "Common" | "Rare" | "Epic" | "Legendary";

export type Creature = {
  name: string;
  title: string;
  description: string;
  rarity: CreatureRarity;
  rarityAccent: string;
  imageUrl: string;
  username: string;
  metadata: {
    power: number;
    affinity: string;
    traitLabel: string;
  };
  stats: {
    karma: string;
    cakeDay: string;
    alignment: string;
  };
};

export type RedditProfileSnapshot = {
  username: string;
  totalKarma?: number | null;
  cakeDayYear?: number | null;
  cakeDayMonth?: number | null;
  preferredImageUrl?: string | null;
};
