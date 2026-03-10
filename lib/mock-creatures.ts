export type Creature = {
  name: string;
  title: string;
  description: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  imageUrl: string;
  username: string;
  stats: {
    karma: string;
    cakeDay: string;
    alignment: string;
  };
};

const mockCreatures: Record<string, Creature> = {
  trendy_summoner: {
    name: "Karma Wraith",
    title: "Guardian of Endless Threads",
    description:
      "Born from midnight debates, cursed memes, and suspiciously detailed comment chains.",
    rarity: "Epic",
    imageUrl:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
    username: "trendy_summoner",
    stats: {
      karma: "42.8k",
      cakeDay: "2018",
      alignment: "Chaotic Good",
    },
  },
  lurkfather: {
    name: "The Lurkfather",
    title: "Silent Watcher of Ancient Threads",
    description:
      "It rarely posts, never forgets, and emerges only when the discourse becomes truly unbearable.",
    rarity: "Legendary",
    imageUrl:
      "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=80",
    username: "lurkfather",
    stats: {
      karma: "88.1k",
      cakeDay: "2012",
      alignment: "True Neutral",
    },
  },
  memecleric: {
    name: "Meme Cleric",
    title: "Healer of Broken Timelines",
    description:
      "Channels low-resolution prophecy and forbidden reaction images to restore morale in chaotic subreddits.",
    rarity: "Rare",
    imageUrl:
      "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=1200&q=80",
    username: "memecleric",
    stats: {
      karma: "16.5k",
      cakeDay: "2020",
      alignment: "Neutral Good",
    },
  },
};

export function getMockCreature(username: string): Creature {
  const normalized = username.trim().toLowerCase().replace(/^u\//, "");

  return (
    mockCreatures[normalized] ?? {
      name: "Thread Sprite",
      title: "Newborn of the Comment Forest",
      description:
        "A mysterious being with undeclared lore, generated from an unknown Reddit presence.",
      rarity: "Common",
      imageUrl:
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1200&q=80",
      username: normalized || "unknown_redditor",
      stats: {
        karma: "1.2k",
        cakeDay: "2024",
        alignment: "Unpredictable",
      },
    }
  );
}