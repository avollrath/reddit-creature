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

const commenterAffinities = ["Rune", "Void", "Blood", "Dream"];
const posterAffinities = ["Ember", "Storm", "Wild", "Ash"];
const balancedAffinities = ["Aether", "Moon", "Mist", "Bone"];

const moderatorTraits = ["Thread Warden", "Archive Marshal", "Scroll Arbiter"];
const commenterTraits = ["Reply Hexer", "Lorekeeper", "Comment Devourer"];
const posterTraits = ["Signal Forger", "Meme Reliquary", "Chaos Tamer"];
const veteranTraits = ["Ancient Archivist", "Dustbound Seer", "Relic Binder"];
const premiumAccents = {
  Common: "Polished Onyx",
  Rare: "Gilded Neon",
  Epic: "Velvet Crownfire",
  Legendary: "Imperial Sunfoil",
} as const;

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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getRarityFromProfile(profile: RedditProfileSnapshot): CreatureRarity {
  if (typeof profile.totalKarma !== "number") {
    return "Common";
  }

  if (profile.totalKarma >= 100000) return "Legendary";
  if (profile.totalKarma >= 25000) return "Epic";
  if (profile.totalKarma >= 5000) return "Rare";
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

function getPowerFromProfile(
  profile: RedditProfileSnapshot,
  seed: number,
  rarity: CreatureRarity
) {
  const basePower = getPower(seed, rarity);

  if (typeof profile.totalKarma !== "number") {
    return basePower;
  }

  const karmaScore = Math.round(Math.log10(profile.totalKarma + 10) * 260);
  const ageScore = Math.round((profile.accountAgeYears ?? 0) * 28);
  const modifier =
    (profile.hasPremium ? 120 : 0) +
    (profile.isModeratorLike ? 130 : 0) +
    (profile.isVerified || profile.hasVerifiedEmail ? 70 : 0);

  return clamp(basePower + karmaScore + ageScore + modifier, 900, 5200);
}

function getAffinityPool(profile: RedditProfileSnapshot) {
  if (profile.prefersNightmode) {
    return ["Void", "Moon", "Dream", "Rune"];
  }

  if (profile.isModeratorLike) {
    return ["Rune", "Bone", "Aether", "Moon"];
  }

  if (profile.behaviorArchetype === "commenter") {
    return commenterAffinities;
  }

  if (profile.behaviorArchetype === "poster") {
    return posterAffinities;
  }

  return balancedAffinities;
}

function getAffinity(profile: RedditProfileSnapshot, seed: number) {
  const pool = getAffinityPool(profile);
  return pick(pool.length ? pool : affinities, seed, 59);
}

function getTraitLabel(profile: RedditProfileSnapshot, seed: number) {
  if ((profile.accountAgeYears ?? 0) >= 8) {
    return pick(veteranTraits, seed, 109);
  }

  if (profile.isModeratorLike) {
    return pick(moderatorTraits, seed, 107);
  }

  if (profile.behaviorArchetype === "commenter") {
    return pick(commenterTraits, seed, 101);
  }

  if (profile.behaviorArchetype === "poster") {
    return pick(posterTraits, seed, 103);
  }

  return pick(traitLabels, seed, 61);
}

function getRarityAccent(
  profile: RedditProfileSnapshot,
  rarity: CreatureRarity,
  seed: number
) {
  if (profile.hasPremium || profile.isVerified) {
    return premiumAccents[rarity];
  }

  return pick(rarityAccents[rarity], seed, 67);
}

function getAlignment(profile: RedditProfileSnapshot, seed: number) {
  if (profile.isModeratorLike) {
    return pick(["Lawful Good", "Lawful Neutral", "Neutral Good"], seed, 113);
  }

  if (profile.behaviorArchetype === "poster") {
    return pick(["Chaotic Good", "Chaotic Neutral", "Neutral Good"], seed, 127);
  }

  if (profile.behaviorArchetype === "commenter") {
    return pick(["True Neutral", "Lawful Evil", "Neutral Evil"], seed, 131);
  }

  return pick(alignments, seed, 43);
}

export function generateCreatureFromProfile(
  profile: RedditProfileSnapshot
): Creature {
  const seed = hashString(profile.username);
  const rarity =
    profile.source === "reddit"
      ? getRarityFromProfile(profile)
      : getRarity(seed);
  const karma = profile.totalKarma ?? getFallbackKarma(seed);
  const affinity =
    profile.source === "reddit" ? getAffinity(profile, seed) : pick(affinities, seed, 59);
  const traitLabel =
    profile.source === "reddit"
      ? getTraitLabel(profile, seed)
      : pick(traitLabels, seed, 61);
  const power =
    profile.source === "reddit"
      ? getPowerFromProfile(profile, seed, rarity)
      : getPower(seed, rarity);

  return {
    name: getCreatureName(seed),
    title: getTitle(seed),
    description: getDescription(seed),
    rarity,
    rarityAccent:
      profile.source === "reddit"
        ? getRarityAccent(profile, rarity, seed)
        : pick(rarityAccents[rarity], seed, 67),
    imageUrl: profile.preferredImageUrl || pick(imagePool, seed, 47),
    username: profile.username,
    displayName: profile.displayName || profile.username,
    metadata: {
      power,
      affinity,
      traitLabel,
    },
    grounding: {
      source: profile.source ?? "local",
      behaviorArchetype: profile.behaviorArchetype ?? "balanced",
      accountAgeYears: profile.accountAgeYears ?? null,
      isVerified: Boolean(profile.isVerified || profile.hasVerifiedEmail),
      hasPremium: Boolean(profile.hasPremium),
      prefersNightmode: Boolean(profile.prefersNightmode),
      over18: Boolean(profile.over18),
      isModeratorLike: Boolean(profile.isModeratorLike),
    },
    stats: {
      karma: formatKarmaValue(karma),
      cakeDay: formatCakeDay(profile, seed),
      alignment:
        profile.source === "reddit" ? getAlignment(profile, seed) : pick(alignments, seed, 43),
    },
  };
}
