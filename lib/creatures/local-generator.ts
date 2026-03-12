import type {
  ChessMode,
  Creature,
  CreatureRarity,
  CreatureStat,
  PlayerProfileSnapshot,
} from "@/lib/creatures/types";

const rarityAccents: Record<CreatureRarity, string[]> = {
  Common: ["Club Steel", "Pawn Silver", "Quiet Marble"],
  Rare: ["Knightglass", "Royal Teal", "Ivory Tempo"],
  Epic: ["Queenshard", "Velvet Clockfire", "Storm Opal"],
  Legendary: ["Crown Gold", "Imperial Slate", "Sunlit Ebony"],
  Mythic: ["Astral Onyx", "Mythic Foil", "Celestial Check"],
  Grandmaster: ["Grandmaster Seal", "Auric Crownfire", "Infinite Boardfoil"],
};

const titleWeight: Record<string, number> = {
  GM: 60,
  WGM: 50,
  IM: 46,
  WIM: 38,
  FM: 34,
  WFM: 30,
  CM: 24,
  WCM: 22,
  NM: 20,
};

const modeThemes: Record<
  ChessMode,
  {
    affinity: string;
    traitPool: string[];
    titlePool: string[];
    namePool: string[];
    flavorPool: string[];
  }
> = {
  bullet: {
    affinity: "Clockfire",
    traitPool: ["Bullet Duelist", "Flag Hunter", "Timeburn Raider", "Clock Demon"],
    titlePool: ["of the Final Second", "of Needlefast Lines", "of the Burning Clock"],
    namePool: ["Clockfang", "Flash Knight", "Volt Rook", "Needle Queen"],
    flavorPool: [
      "wins before the board has time to breathe",
      "treats every second like a sharpened blade",
      "thrives where panic becomes technique",
    ],
  },
  blitz: {
    affinity: "Stormblade",
    traitPool: ["Blitz Predator", "Tactical Berserker", "Stormline Hunter", "Tempo Reaver"],
    titlePool: ["of Flash Tactics", "of the Storm Board", "of Violent Initiative"],
    namePool: ["Storm Bishop", "Shock Rook", "Tempest Knight", "Volt Regent"],
    flavorPool: [
      "turns loose tactics into immediate punishment",
      "hunts initiative and never gives it back",
      "forces chaos into elegant violence",
    ],
  },
  rapid: {
    affinity: "Ivory Calculus",
    traitPool: ["Positional Mastermind", "Rapid Architect", "Calculation Savant", "Centerline Oracle"],
    titlePool: ["of Quiet Pressure", "of Engineered Wins", "of the Long Initiative"],
    namePool: ["Ivory Regent", "Quiet Bishop", "Slate Oracle", "Glass King"],
    flavorPool: [
      "prefers clean advantages that never leave",
      "converts structure into inevitability",
      "plays with measured force and exact timing",
    ],
  },
  daily: {
    affinity: "Endgame Stone",
    traitPool: ["Endgame Grinder", "Correspondence Monk", "Patience Warden", "Deep Table Sage"],
    titlePool: ["of the Long Board", "of Patient Sieges", "of Lasting Pressure"],
    namePool: ["Stone Monk", "Longgame Warden", "Ivory Hermit", "Deepfile Sentinel"],
    flavorPool: [
      "wins by exhausting every careless resource",
      "lives in long endgames and colder plans",
      "treats patience as a weapon, not a virtue",
    ],
  },
  puzzles: {
    affinity: "Runeburst",
    traitPool: ["Puzzle Fiend", "Tactic Warlock", "Fork Seer", "Combination Hunter"],
    titlePool: ["of Hidden Tactics", "of the Forking Rune", "of Impossible Motifs"],
    namePool: ["Rune Knight", "Forkmage", "Sigil Queen", "Pattern Wraith"],
    flavorPool: [
      "sees tactical ruptures before the board admits them",
      "collects mating nets like relics",
      "smells combinations buried under quiet moves",
    ],
  },
};

function hashString(value: string, seed = 2166136261): number {
  let hash = seed;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function deriveSeed(seed: number, salt: number) {
  let value = seed ^ salt;
  value ^= value >>> 16;
  value = Math.imul(value, 2246822507);
  value ^= value >>> 13;
  value = Math.imul(value, 3266489909);
  value ^= value >>> 16;
  return value >>> 0;
}

function pick<T>(items: T[], seed: number, salt: number) {
  return items[deriveSeed(seed, salt) % items.length];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getAccountAgeYears(joined: number | null) {
  if (!joined) {
    return null;
  }

  return Number(
    (((Date.now() / 1000 - joined) / (60 * 60 * 24 * 365.25)) || 0).toFixed(1)
  );
}

function ratingToScore(rating: number | null, fallback: number) {
  if (rating === null) {
    return fallback;
  }

  return clamp(Math.round((rating - 600) / 26), 12, 99);
}

function totalGames(wins: number | null, losses: number | null, draws: number | null) {
  return (wins ?? 0) + (losses ?? 0) + (draws ?? 0);
}

function prestigeToScore(input: {
  title: string | null;
  followers: number | null;
  accountAgeYears: number | null;
  status: string | null;
  isStreamer: boolean;
}) {
  const titleScore = input.title ? titleWeight[input.title] ?? 18 : 0;
  const followerScore =
    input.followers && input.followers > 0
      ? Math.round(Math.log10(input.followers + 10) * 14)
      : 0;
  const veteranScore = input.accountAgeYears
    ? clamp(Math.round(input.accountAgeYears * 2.2), 0, 18)
    : 0;
  const statusScore =
    input.status === "premium" ? 10 : input.status === "staff" ? 14 : 0;
  const streamerScore = input.isStreamer ? 8 : 0;

  return clamp(18 + titleScore + followerScore + veteranScore + statusScore + streamerScore, 12, 99);
}

function getStrongestMode(profile: PlayerProfileSnapshot): ChessMode {
  const ratings: Array<[ChessMode, number]> = [
    ["bullet", profile.bulletRating ?? -1],
    ["blitz", profile.blitzRating ?? -1],
    ["rapid", profile.rapidRating ?? -1],
    ["daily", profile.dailyRating ?? -1],
    ["puzzles", profile.tacticsBest ?? profile.puzzleBest ?? -1],
  ];

  ratings.sort((left, right) => right[1] - left[1]);

  return ratings[0]?.[1] > 0 ? ratings[0][0] : "rapid";
}

function getModeLabel(mode: ChessMode) {
  switch (mode) {
    case "bullet":
      return "Bullet";
    case "blitz":
      return "Blitz";
    case "daily":
      return "Daily";
    case "puzzles":
      return "Puzzles";
    default:
      return "Rapid";
  }
}

function getRarity(profile: PlayerProfileSnapshot, maxRating: number, prestige: number) {
  const titleBoost = profile.title ? titleWeight[profile.title] ?? 16 : 0;
  const ratingBoost =
    maxRating >= 3000
      ? 58
      : maxRating >= 2600
        ? 44
        : maxRating >= 2200
          ? 28
          : maxRating >= 1800
            ? 16
            : 0;
  const veteranBoost = (getAccountAgeYears(profile.joined) ?? 0) >= 10 ? 8 : 0;
  const totalScore = titleBoost + ratingBoost + prestige + veteranBoost;

  if (profile.title === "GM" || maxRating >= 3200) {
    return "Grandmaster" as const;
  }

  if (totalScore >= 132) {
    return "Mythic" as const;
  }

  if (totalScore >= 106) {
    return "Legendary" as const;
  }

  if (totalScore >= 82) {
    return "Epic" as const;
  }

  if (totalScore >= 58) {
    return "Rare" as const;
  }

  return "Common" as const;
}

function formatFollowers(followers: number | null) {
  if (followers === null) {
    return "Quiet Circle";
  }

  if (followers >= 1000) {
    return `${(followers / 1000).toFixed(1)}k followers`;
  }

  return `${followers} followers`;
}

function formatMemberSince(joined: number | null, seed: number) {
  if (!joined) {
    return `${2014 + (deriveSeed(seed, 202) % 10)}`;
  }

  return `${new Date(joined * 1000).getUTCFullYear()}`;
}

function getCountryCode(countryUrl: string | null) {
  if (!countryUrl) {
    return null;
  }

  const segments = countryUrl.split("/").filter(Boolean);
  return segments.at(-1)?.toUpperCase() ?? null;
}

function getDisplayName(profile: PlayerProfileSnapshot) {
  return profile.displayName || titleCase(profile.username);
}

function buildFallbackProfile(profile: PlayerProfileSnapshot, seed: number): PlayerProfileSnapshot {
  if (profile.source !== "local") {
    return profile;
  }

  const rapid = 900 + (deriveSeed(seed, 11) % 850);
  const blitz = 850 + (deriveSeed(seed, 13) % 950);
  const bullet = 800 + (deriveSeed(seed, 17) % 1100);
  const daily = 1000 + (deriveSeed(seed, 19) % 700);
  const tactics = 1400 + (deriveSeed(seed, 23) % 1100);

  return {
    ...profile,
    displayName: getDisplayName(profile),
    followers: 12 + (deriveSeed(seed, 29) % 2800),
    joined: 1_262_304_000 + (deriveSeed(seed, 31) % 315_532_800),
    lastOnline: Math.floor(Date.now() / 1000) - (deriveSeed(seed, 37) % 86_400),
    status: deriveSeed(seed, 41) % 9 === 0 ? "premium" : "basic",
    isStreamer: deriveSeed(seed, 43) % 11 === 0,
    rapidRating: rapid,
    rapidBest: rapid + 40 + (deriveSeed(seed, 47) % 90),
    rapidWins: 20 + (deriveSeed(seed, 53) % 160),
    rapidLosses: 18 + (deriveSeed(seed, 59) % 120),
    rapidDraws: 1 + (deriveSeed(seed, 61) % 18),
    blitzRating: blitz,
    blitzBest: blitz + 50 + (deriveSeed(seed, 67) % 120),
    blitzWins: 30 + (deriveSeed(seed, 71) % 220),
    blitzLosses: 24 + (deriveSeed(seed, 73) % 180),
    blitzDraws: 1 + (deriveSeed(seed, 79) % 24),
    bulletRating: bullet,
    bulletBest: bullet + 60 + (deriveSeed(seed, 83) % 130),
    bulletWins: 35 + (deriveSeed(seed, 89) % 320),
    bulletLosses: 20 + (deriveSeed(seed, 97) % 260),
    bulletDraws: deriveSeed(seed, 101) % 16,
    dailyRating: daily,
    dailyBest: daily + 30 + (deriveSeed(seed, 103) % 80),
    dailyWins: 6 + (deriveSeed(seed, 107) % 40),
    dailyLosses: 4 + (deriveSeed(seed, 109) % 30),
    dailyDraws: deriveSeed(seed, 113) % 10,
    puzzleBest: tactics,
    tacticsBest: tactics,
  };
}

function buildStats(input: {
  power: number;
  speed: number;
  tactics: number;
  precision: number;
  endurance: number;
  prestige: number;
}): CreatureStat[] {
  return [
    { label: "Power", value: input.power, display: String(input.power), icon: "power" },
    { label: "Speed", value: input.speed, display: String(input.speed), icon: "speed" },
    { label: "Tactics", value: input.tactics, display: String(input.tactics), icon: "tactics" },
    { label: "Precision", value: input.precision, display: String(input.precision), icon: "precision" },
    { label: "Endurance", value: input.endurance, display: String(input.endurance), icon: "endurance" },
    { label: "Prestige", value: input.prestige, display: String(input.prestige), icon: "prestige" },
  ];
}

export function generateCreatureFromProfile(baseProfile: PlayerProfileSnapshot): Creature {
  const seed = hashString(baseProfile.username);
  const profile = buildFallbackProfile(baseProfile, seed);
  const accountAgeYears = getAccountAgeYears(profile.joined);
  const strongestMode = getStrongestMode(profile);
  const theme = modeThemes[strongestMode];
  const modeLabel = getModeLabel(strongestMode);
  const precision = ratingToScore(profile.rapidRating, 48);
  const speed = ratingToScore(profile.bulletRating, 44);
  const tactics = ratingToScore(profile.tacticsBest ?? profile.blitzRating, 50);
  const enduranceSource = Math.max(
    profile.dailyRating ?? 0,
    totalGames(profile.dailyWins, profile.dailyLosses, profile.dailyDraws) * 18
  );
  const endurance = ratingToScore(enduranceSource || null, 42);
  const prestige = prestigeToScore({
    title: profile.title,
    followers: profile.followers,
    accountAgeYears,
    status: profile.status,
    isStreamer: profile.isStreamer,
  });
  const ratingValues = [
    profile.rapidRating,
    profile.blitzRating,
    profile.bulletRating,
    profile.dailyRating,
    profile.tacticsBest,
  ].filter((value): value is number => value !== null);
  const maxRating = ratingValues.length ? Math.max(...ratingValues) : 1400;
  const power = clamp(
    Math.round(
      precision * 0.26 +
        speed * 0.19 +
        tactics * 0.22 +
        endurance * 0.14 +
        prestige * 0.19
    ),
    18,
    99
  );
  const rarity = getRarity(profile, maxRating, prestige);
  const displayName = getDisplayName(profile);
  const traitLabel = pick(theme.traitPool, seed, 141);
  const titleBadge = profile.title
    ? `${profile.title} ${displayName}`
    : `${displayName} · ${modeLabel} ${traitLabel}`;
  const title =
    profile.title
      ? `${modeLabel} ${profile.title}`
      : `${modeLabel} ${traitLabel}`;
  const name = `${pick(theme.namePool, seed, 127)} ${pick(theme.titlePool, seed, 131)}`;
  const flair = pick(theme.flavorPool, seed, 137);
  const titleText = profile.title ? `${profile.title} ${displayName}` : displayName;
  const warnings = profile.warnings.join(" ");
  const recordSource =
    strongestMode === "bullet"
      ? [profile.bulletWins, profile.bulletLosses, profile.bulletDraws]
      : strongestMode === "blitz"
        ? [profile.blitzWins, profile.blitzLosses, profile.blitzDraws]
        : strongestMode === "daily"
          ? [profile.dailyWins, profile.dailyLosses, profile.dailyDraws]
          : [profile.rapidWins, profile.rapidLosses, profile.rapidDraws];

  return {
    name,
    title,
    description: `${titleText} enters the card as a ${theme.traitPool[0].toLowerCase()} who ${flair}.\n\nBuilt from ${modeLabel.toLowerCase()} pressure, follower prestige, and real match records, this portrait leans into ${theme.affinity.toLowerCase()} energy.${warnings ? ` ${warnings}` : ""}`,
    rarity,
    rarityAccent: pick(rarityAccents[rarity], seed, 139),
    imageUrl: profile.avatarUrl || "/creatures/chess-fallback-card-art.svg",
    username: profile.username,
    displayName,
    metadata: {
      power,
      affinity: theme.affinity,
      traitLabel,
      titleBadge,
      strongestModeLabel: modeLabel,
    },
    grounding: {
      source: profile.source,
      lookupState: profile.lookupState,
      lookupMessage: profile.lookupMessage,
      warnings: profile.warnings,
      limitedData: profile.limitedData,
      accountAgeYears,
      followers: profile.followers,
      title: profile.title,
      status: profile.status,
      countryCode: getCountryCode(profile.countryUrl),
      isStreamer: profile.isStreamer,
      strongestMode,
      rapidRating: profile.rapidRating,
      blitzRating: profile.blitzRating,
      bulletRating: profile.bulletRating,
      dailyRating: profile.dailyRating,
      puzzleBest: profile.puzzleBest,
      tacticsBest: profile.tacticsBest,
    },
    stats: buildStats({
      power,
      speed,
      tactics,
      precision,
      endurance,
      prestige,
    }),
    details: {
      memberSince: formatMemberSince(profile.joined, seed),
      signature: `${modeLabel} specialist · ${formatFollowers(profile.followers)}`,
      record: `${recordSource[0] ?? 0}W ${recordSource[1] ?? 0}L ${recordSource[2] ?? 0}D`,
    },
  };
}
