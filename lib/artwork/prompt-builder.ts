import type { Creature } from "@/lib/creatures";

const rarityColorHints: Record<Creature["rarity"], string> = {
  Common: "smoky silver, moonlit gray, pale spectral glow, restrained neon accents",
  Rare: "electric cyan, luminous teal, neon blue highlights, radiant holographic pulses",
  Epic: "vibrant magenta, fuchsia bloom, ultraviolet shimmer, impossible nightclub chroma",
  Legendary: "molten gold, radiant amber, solar fire accents, divine neon aura",
};

const affinityMotifHints: Record<string, string> = {
  Ash: "ash haze, ember dust, burnt neon sparks",
  Aether: "weightless energy ribbons, floating light geometry, electric vapor",
  Blood: "crimson plasma, glowing veins, ceremonial biotech menace",
  Bone: "ivory exoskeleton forms, skeletal ornament, fossil-tech details",
  Dream: "hallucinatory glow, surreal dream fog, impossible soft neon distortions",
  Ember: "molten flare, hot orange neon, ember storm particles",
  Mist: "volumetric fog, iridescent vapor, spectral haze",
  Moon: "cold lunar halos, silver night glare, astral reflections",
  Rune: "arcane glyph energy, glowing sigils, occult circuitry",
  Storm: "forked lightning, charged clouds, kinetic electric atmosphere",
  Void: "abyssal gradients, blacklight bloom, cosmic negative space",
  Wild: "feral organic forms, luminous growth, untamed bio-neon textures",
};

function getCreatureScaleHint(totalKarma: number | null, rarity: Creature["rarity"]) {
  if (typeof totalKarma !== "number") {
    return "Give the creature a medium physical scale and presence.";
  }

  if (totalKarma < 1_000 || rarity === "Common") {
    return "Depict a small-scale creature: bug, beetle, moth, rodent, tiny reptile, mushroom-being, sprout-creature, or another small lifeform. Keep it modest in size, fragile-looking, and low-threat rather than majestic.";
  }

  if (totalKarma < 5_000) {
    return "Depict a smaller creature with a clear but modest presence, like a clever critter, imp, nocturnal animal, little plant-beast, or compact relic familiar.";
  }

  if (totalKarma < 25_000 || rarity === "Rare") {
    return "Depict a medium-sized creature with visible power, but not colossal or godlike.";
  }

  if (totalKarma < 100_000 || rarity === "Epic") {
    return "Depict a large, striking, majestic creature with strong physical presence and obvious power.";
  }

  return "Depict a grand, majestic, imposing creature with legendary scale and commanding presence, like a mythic guardian or towering sovereign beast.";
}

function getCreatureAgeAppearanceHint(accountAgeYears: number | null) {
  if (accountAgeYears === null) {
    return "Keep the creature's apparent age balanced: neither very young nor truly ancient.";
  }

  if (accountAgeYears < 2) {
    return "The creature should look very young: newly formed, juvenile, fresh, sprightly, and recently awakened.";
  }

  if (accountAgeYears < 5) {
    return "The creature should look young and newly matured rather than ancient.";
  }

  if (accountAgeYears < 10) {
    return "The creature should look fully matured, seasoned, and stable.";
  }

  if (accountAgeYears < 15) {
    return "The creature should look old and experienced, with weathered, time-touched details.";
  }

  return "The creature should look very old and ancient, with elder presence, age-worn detail, and deep mythic longevity.";
}

export function buildCreatureArtworkPrompt(creature: Creature): string {
  const colorHint = rarityColorHints[creature.rarity];
  const affinityHint =
    affinityMotifHints[creature.metadata.affinity] ||
    "futuristic fantasy textures, strange energy motifs, collectible illustration detail";
  const scaleHint = getCreatureScaleHint(
    creature.grounding.totalKarma,
    creature.rarity
  );
  const ageAppearanceHint = getCreatureAgeAppearanceHint(
    creature.grounding.accountAgeYears
  );
  const groundingHints = [
    creature.grounding.source === "reddit"
      ? "Ground the character in real Reddit-profile signals rather than pure random fantasy."
      : "This creature is grounded in the local deterministic fallback profile.",
    creature.grounding.behaviorArchetype === "commenter"
      ? "Emphasize a watchful speaker, lorekeeper, whisper-network presence, and reply-born intelligence."
      : creature.grounding.behaviorArchetype === "poster"
        ? "Emphasize a broadcasting presence, signal-summoning charisma, and creator-like dramatic stage energy."
        : "Blend speaker and summoner energy into a balanced relic-bearing presence.",
    creature.grounding.prefersNightmode
      ? "Lean into darker nocturnal palette control, elegant void contrast, and midnight interface glow."
      : "Allow brighter spectral color, cleaner illumination, and more open atmospheric light.",
    creature.grounding.over18
      ? "Allow a slightly sharper, stranger, more dangerous mood without becoming graphic."
      : "Keep the mood wondrous and safe-for-broad-audience rather than menacing.",
    creature.grounding.hasPremium
      ? "Add prestige materials, gilded relic details, and luxe ornamental accents."
      : "Keep the finish premium but slightly less ceremonial.",
    creature.grounding.isModeratorLike
      ? "Hint at a guardian, archivist, or threshold-warden role."
      : "Avoid overt authority symbolism unless supported elsewhere.",
    creature.grounding.accountAgeYears
      ? `Account age mood: ${creature.grounding.accountAgeYears} years old, so balance veteran myth with modern neon clarity.`
      : "Account age unavailable; keep the mythic age impression moderate.",
    typeof creature.grounding.totalKarma === "number"
      ? `Total karma grounding: ${creature.grounding.totalKarma}, so creature scale and grandeur should match that level.`
      : "Total karma unavailable; keep creature scale moderate.",
  ].join(" ");

  return [
    `Create a single character illustration for a premium collectible trading card art window.`,

    `STYLE: bizarre popup cyberpunk fantasy, surreal but beautiful, high-end digital painting, polished collectible-card illustration, vivid neon atmosphere, strange futuristic mythic energy.`,

    `SUBJECT: ${creature.name}, ${creature.title}.`,
    `CLASS: ${creature.metadata.affinity}.`,
    `TRAIT: ${creature.metadata.traitLabel}.`,
    `RARITY: ${creature.rarity}.`,
    `COLOR DIRECTION: ${colorHint}.`,
    `MOTIF DIRECTION: ${affinityHint}.`,
    `STORY MOOD: ${creature.description}.`,
    `CREATURE SCALE DIRECTION: ${scaleHint}`,
    `CREATURE AGE DIRECTION: ${ageAppearanceHint}`,
    `GROUNDING HINTS: ${groundingHints}`,

    `COMPOSITION: one single main creature only, centered, medium shot or three-quarter portrait, filling most of the image in a way that matches its intended scale, strong readable silhouette, clear focal subject, suitable for a trading card illustration slot.`,

    `LIGHTING: dramatic rim light, luminous glow, cinematic contrast, bright focal highlights, rich atmospheric depth, clean separation between subject and background.`,

    `BACKGROUND: surreal futuristic environment, abstracted and supportive, visually rich but secondary to the creature, no clutter, no extra characters.`,

    `TEXTURE AND DETAIL: elegant techno-organic surfaces, glowing materials, strange ornament, premium rendering, crisp forms, vivid color separation.`,

    `IMPORTANT NEGATIVE RULES: no text, no letters, no words, no typography, no logo, no watermark, no signature, no captions.`,

    `IMPORTANT NEGATIVE RULES: no frame, no trading card border, no UI, no interface, no panel layout, no labels, no overlay graphics.`,

    `IMPORTANT NEGATIVE RULES: no multiple characters, no crowd, no tiny distant subject, no chaotic unreadable composition, no washed out colors, no muddy silhouette.`,

    `The final image must feel iconic, memorable, weird, colorful, premium, and instantly legible as collectible fantasy-cyberpunk creature art.`,
  ].join(" ");
}
