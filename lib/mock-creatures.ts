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

const creatureNames = [
  "Karma Wraith",
  "Thread Sprite",
  "Debate Hydra",
  "Meme Cleric",
  "Lore Hound",
  "Hot Take Golem",
  "Void Lurker",
  "Reply Phantom",
  "Scroll Serpent",
  "Upvote Djinn",
];

const creatureTitles = [
  "Guardian of Endless Threads",
  "Watcher of the Comment Forest",
  "Healer of Broken Timelines",
  "Collector of Forbidden Memes",
  "Oracle of Late-Night Opinions",
  "Keeper of Ancient Subreddits",
  "Whisperer of Viral Chaos",
  "Summoner of Unholy Discourse",
  "Archivist of Lost Replies",
  "Protector of Niche Communities",
];

const creatureDescriptions = [
  "Born from midnight debates, cursed memes, and suspiciously detailed comment chains.",
  "It emerges when discussions grow chaotic and leaves behind only strange wisdom and deleted replies.",
  "Forged in the heat of upvotes and downvotes, it thrives on discourse and digital folklore.",
  "A mysterious being that drifts between subreddits, feeding on reaction images and obscure knowledge.",
  "No one knows where it came from, only that it appears when the thread needs balance.",
  "It collects fragments of internet culture and shapes them into myth, prophecy, and confusion.",
];

const alignments = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
];

const imagePool = [
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1200&q=80",
];

function hashString(value: string): number {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function pick<T>(items: T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function formatKarma(seed: number): string {
  const karma = 500 + (seed % 250000);

  if (karma >= 1000) {
    return `${(karma / 1000).toFixed(1)}k`;
  }

  return `${karma}`;
}

function getRarity(seed: number): Creature["rarity"] {
  const value = seed % 100;

  if (value >= 95) return "Legendary";
  if (value >= 75) return "Epic";
  if (value >= 40) return "Rare";
  return "Common";
}

function getCakeDay(seed: number): string {
  const year = 2011 + (seed % 14);
  return `${year}`;
}

export function getMockCreature(username: string): Creature {
  const normalized = username.trim().toLowerCase().replace(/^u\//, "") || "unknown_redditor";
  const seed = hashString(normalized);

  const name = pick(creatureNames, seed, 1);
  const title = pick(creatureTitles, seed, 3);
  const description = pick(creatureDescriptions, seed, 5);
  const alignment = pick(alignments, seed, 7);
  const imageUrl = pick(imagePool, seed, 11);
  const rarity = getRarity(seed);

  return {
    name,
    title,
    description,
    rarity,
    imageUrl,
    username: normalized,
    stats: {
      karma: formatKarma(seed),
      cakeDay: getCakeDay(seed),
      alignment,
    },
  };
}