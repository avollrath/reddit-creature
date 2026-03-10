import type {
  Creature,
  CreatureRarity,
  RedditProfileSnapshot,
} from "@/lib/creatures/types";

const namePrefixes = [
  "Ashen",
  "Astral",
  "Cinder",
  "Crypt",
  "Ember",
  "Gilded",
  "Hollow",
  "Ivory",
  "Moonlit",
  "Obsidian",
  "Rune",
  "Shadow",
  "Storm",
  "Velvet",
  "Void",
];

const nameRoots = [
  "Archivist",
  "Basilisk",
  "Chimera",
  "Djinn",
  "Golem",
  "Harbinger",
  "Hydra",
  "Oracle",
  "Phantom",
  "Serpent",
  "Sphinx",
  "Sprite",
  "Stag",
  "Warden",
  "Wraith",
];

const nameSuffixes = [
  "of Echoes",
  "of Embers",
  "of Karma",
  "of Lore",
  "of Night Scrolls",
  "of Quiet Threads",
  "of Relics",
  "of Replies",
  "of Sparks",
  "of the Hollow Feed",
  "of the Last Upvote",
  "of the Velvet Void",
];

const alignments = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
];

const imagePool = [
  "/creatures/obsidian-oracle.svg",
  "/creatures/ember-stag.svg",
  "/creatures/moon-hydra.svg",
  "/creatures/rune-wraith.svg",
  "/creatures/velvet-djinn.svg",
  "/creatures/ashen-serpent.svg",
];

const titleRoles = [
  "Archivist",
  "Binder",
  "Guardian",
  "Harvester",
  "Keeper",
  "Oracle",
  "Sentinel",
  "Whisperer",
];

const titleDomains = [
  "Broken Timelines",
  "Cinder Threads",
  "Endless Replies",
  "Forgotten Subreddits",
  "Late-Night Omens",
  "Niche Catacombs",
  "Stolen Memes",
  "Viral Relics",
];

const origins = [
  "Born from midnight scrolling",
  "Forged in collapsing comment chains",
  "Raised beneath a black sun of karma",
  "Summoned by a thousand lurking eyes",
  "Woven from screenshot folklore",
  "Shaped in the ruins of old forums",
];

const behaviors = [
  "it stalks heated debates and feeds on unresolved lore",
  "it appears when a thread tips from wit into chaos",
  "it guards obscure knowledge with ceremonial pettiness",
  "it turns discarded jokes into prophecy and warning",
  "it hunts reaction images like sacred prey",
  "it drifts between subreddits collecting strange allegiances",
];

const traits = [
  "leaving behind luminous dust and deleted replies",
  "marking its passage with silver static",
  "while the bravest users swear they hear upvotes crackle",
  "and every witness remembers a different name",
  "until even moderators treat it like an omen",
  "before vanishing into the velvet feed again",
];

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const affinities = [
  "Ash",
  "Aether",
  "Blood",
  "Bone",
  "Dream",
  "Ember",
  "Mist",
  "Moon",
  "Rune",
  "Storm",
  "Void",
  "Wild",
];

const traitLabels = [
  "Archive Hunter",
  "Chaos Tamer",
  "Comment Devourer",
  "Dustbound Seer",
  "Echo Forager",
  "Feed Stalker",
  "Lorekeeper",
  "Meme Reliquary",
  "Night Watcher",
  "Relic Binder",
  "Reply Hexer",
  "Threadbreaker",
];

const rarityAccents: Record<CreatureRarity, string[]> = {
  Common: ["Ashen Iron", "Faded Silver", "Pale Smoke"],
  Rare: ["Moonglass", "Stormglass", "Tidal Sapphire"],
  Epic: ["Night Bloom", "Royal Amethyst", "Velvet Neon"],
  Legendary: ["Auric Ember", "Crownfire", "Solar Relic"],
};

function hashString(value: string, seed = 0): number {
  let hash = seed || 2166136261;

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function deriveSeed(seed: number, salt: number): number {
  let value = seed ^ salt;
  value ^= value >>> 16;
  value = Math.imul(value, 2246822507);
  value ^= value >>> 13;
  value = Math.imul(value, 3266489909);
  value ^= value >>> 16;
  return value >>> 0;
}

function pick<T>(items: T[], seed: number, salt: number): T {
  return items[deriveSeed(seed, salt) % items.length];
}

function formatKarmaValue(totalKarma: number): string {
  if (totalKarma >= 1000) {
    return `${(totalKarma / 1000).toFixed(1)}k`;
  }

  return `${totalKarma}`;
}

function getFallbackKarma(seed: number): number {
  return 250 + (deriveSeed(seed, 71) % 420000);
}

function getRarity(seed: number): CreatureRarity {
  const value = deriveSeed(seed, 29) % 100;

  if (value >= 95) return "Legendary";
  if (value >= 75) return "Epic";
  if (value >= 40) return "Rare";
  return "Common";
}

function formatCakeDay(profile: RedditProfileSnapshot, seed: number): string {
  const monthIndex =
    profile.cakeDayMonth && profile.cakeDayMonth >= 1 && profile.cakeDayMonth <= 12
      ? profile.cakeDayMonth - 1
      : deriveSeed(seed, 83) % monthNames.length;
  const year =
    profile.cakeDayYear && profile.cakeDayYear >= 2005
      ? profile.cakeDayYear
      : 2011 + (deriveSeed(seed, 97) % 15);

  return `${monthNames[monthIndex]} ${year}`;
}

function getCreatureName(seed: number): string {
  return `${pick(namePrefixes, seed, 11)} ${pick(nameRoots, seed, 13)} ${pick(
    nameSuffixes,
    seed,
    17
  )}`;
}

function getTitle(seed: number): string {
  return `${pick(titleRoles, seed, 19)} of ${pick(titleDomains, seed, 23)}`;
}

function getDescription(seed: number): string {
  const origin = pick(origins, seed, 31);
  const behavior = pick(behaviors, seed, 37);
  const trait = pick(traits, seed, 41);
  return `${origin}, ${behavior}, ${trait}.`;
}

function getPower(seed: number, rarity: CreatureRarity): number {
  const baseByRarity: Record<CreatureRarity, number> = {
    Common: 1100,
    Rare: 1800,
    Epic: 2600,
    Legendary: 3400,
  };

  return baseByRarity[rarity] + (deriveSeed(seed, 53) % 900);
}

export function generateCreatureFromProfile(
  profile: RedditProfileSnapshot
): Creature {
  const seed = hashString(profile.username);
  const rarity = getRarity(seed);
  const karma = profile.totalKarma ?? getFallbackKarma(seed);

  return {
    name: getCreatureName(seed),
    title: getTitle(seed),
    description: getDescription(seed),
    rarity,
    rarityAccent: pick(rarityAccents[rarity], seed, 67),
    imageUrl: profile.preferredImageUrl || pick(imagePool, seed, 47),
    username: profile.username,
    metadata: {
      power: getPower(seed, rarity),
      affinity: pick(affinities, seed, 59),
      traitLabel: pick(traitLabels, seed, 61),
    },
    stats: {
      karma: formatKarmaValue(karma),
      cakeDay: formatCakeDay(profile, seed),
      alignment: pick(alignments, seed, 43),
    },
  };
}
