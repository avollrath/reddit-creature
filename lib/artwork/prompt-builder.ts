import type { Creature } from "@/lib/creatures";

const rarityColorHints: Record<Creature["rarity"], string> = {
  Common: "smoky silver, moonlit gray, pale spectral glow, restrained neon accents",
  Rare: "electric cyan, luminous teal, neon blue highlights, radiant holographic pulses",
  Epic: "vibrant magenta, fuchsia bloom, ultraviolet shimmer, impossible nightclub chroma",
  Legendary: "molten gold, radiant amber, solar fire accents, divine neon aura",
  Mythic: "violet prism glow, celestial indigo bloom, astral lacquer, luminous relic chroma",
  Grandmaster: "ivory gold, solar crownlight, imperial radiance, sacred polished fire",
};

const affinityMotifHints: Record<string, string> = {
  Clockfire: "burning clockwork halos, ember sparks, molten timing glyphs, hourglass relic fragments",
  Stormblade: "forked lightning, charged clouds, warlike neon arcs, storm pressure and violent momentum",
  "Ivory Calculus": "marble geometry, cathedral logic, elegant rune grids, royal strategic symmetry",
  "Endgame Stone": "weathered stone, ancient fortress textures, patient monumental forms, relic endurance",
  Runeburst: "arcane glyph energy, glowing sigils, occult circuitry, sudden tactical light fractures",
};

function getCreatureScaleHint(power: number, rarity: Creature["rarity"]) {
  if (power < 40 || rarity === "Common") {
    return "Depict a small-scale creature: cunning familiar, dangerous bird, fox-spirit, insectile relic beast, little drake, tiny chimera, or another compact lifeform. Keep it modest in size and threat rather than majestic.";
  }

  if (power < 55) {
    return "Depict a smaller creature with a clear but modest presence, like a clever critter, imp, watchful beast, or compact relic familiar.";
  }

  if (power < 72 || rarity === "Rare") {
    return "Depict a medium-sized creature with visible power, but not colossal or godlike.";
  }

  if (power < 88 || rarity === "Epic" || rarity === "Legendary") {
    return "Depict a large, striking, majestic creature with strong physical presence and obvious power.";
  }

  return "Depict a grand, majestic, imposing creature with mythic scale and commanding presence, like a sovereign guardian or towering ritual beast.";
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

function getPresentationHint(creature: Creature) {
  const chessTitle = creature.grounding.title?.toUpperCase() ?? "";

  if (chessTitle.startsWith("W")) {
    return "Render the creature with distinctly feminine presence, anatomy cues, facial structure, and styling while keeping it fantastical and powerful.";
  }

  return "Infer gender presentation from the display name, username, and chess title only if it is genuinely clear. If it reads feminine, render feminine presentation. If it is unclear, remain neutral rather than defaulting masculine.";
}

export function buildCreatureArtworkPrompt(creature: Creature): string {
  const colorHint = rarityColorHints[creature.rarity];
  const affinityHint =
    affinityMotifHints[creature.metadata.affinity] ||
    "futuristic fantasy textures, strange energy motifs, collectible illustration detail";
  const scaleHint = getCreatureScaleHint(creature.metadata.power, creature.rarity);
  const ageAppearanceHint = getCreatureAgeAppearanceHint(
    creature.grounding.accountAgeYears
  );
  const strongestMode = creature.metadata.strongestModeLabel.toLowerCase();
  const groundingHints = [
    creature.grounding.source === "chesscom"
      ? "Ground the creature in real Chess.com player signals rather than pure random fantasy."
      : "This creature is grounded in the local deterministic fallback player profile.",
    strongestMode === "bullet"
      ? "Emphasize speed, predatory reflexes, razor timing, and volatile attack posture."
      : strongestMode === "blitz"
        ? "Emphasize tactical aggression, storm pressure, and immediate board violence."
        : strongestMode === "rapid"
          ? "Emphasize precision, composure, elegant planning, and controlled dominance."
          : strongestMode === "daily"
            ? "Emphasize patience, old strength, endurance, and heavy strategic presence."
            : "Emphasize hidden tactics, strange intelligence, and sudden rune-like combinations.",
    creature.grounding.isStreamer
      ? "Add subtle charisma, showmanship, and public-stage confidence without becoming cute or casual."
      : "Keep the mood serious, controlled, and focused rather than theatrical.",
    creature.grounding.status === "premium"
      ? "Add prestige materials, gilded relic details, and luxe ornamental accents."
      : "Keep the finish premium but slightly less ceremonial.",
    creature.grounding.title
      ? `Chess title grounding: ${creature.grounding.title}, so the creature should carry clear status, discipline, and elite identity.`
      : "No formal chess title is present, so keep the creature dangerous and specific without over-signaling nobility.",
    creature.grounding.followers
      ? `Follower grounding: ${creature.grounding.followers}, so public prestige and aura should roughly match that level.`
      : "Follower count unavailable; keep public prestige moderate.",
    creature.grounding.accountAgeYears
      ? `Account age mood: ${creature.grounding.accountAgeYears} years old, so balance veteran myth with modern fantasy clarity.`
      : "Account age unavailable; keep the mythic age impression moderate.",
    creature.grounding.limitedData
      ? "Some player data is missing, so keep the archetype strong and specific without inventing unrelated themes."
      : "Lean into the full player profile for specificity and authority.",
    getPresentationHint(creature),
  ].join(" ");

  return [
    "Create a single character illustration for a premium collectible trading card art window.",
    "STYLE: bizarre popup cyberpunk fantasy, surreal but beautiful, high-end digital painting, polished collectible-card illustration, vivid neon atmosphere, strange futuristic mythic energy.",
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
    "COMPOSITION: one single main creature only, centered, medium shot or three-quarter portrait, filling most of the image in a way that matches its intended scale, strong readable silhouette, clear focal subject, suitable for a trading card illustration slot.",
    "LIGHTING: dramatic rim light, luminous glow, cinematic contrast, bright focal highlights, rich atmospheric depth, clean separation between subject and background.",
    "BACKGROUND: surreal futuristic environment, abstracted and supportive, visually rich but secondary to the creature, no clutter, no extra characters.",
    "TEXTURE AND DETAIL: elegant techno-organic surfaces, glowing materials, strange ornament, premium rendering, crisp forms, vivid color separation.",
    "IMPORTANT NEGATIVE RULES: no text, no letters, no words, no typography, no logo, no watermark, no signature, no captions.",
    "IMPORTANT NEGATIVE RULES: no frame, no trading card border, no UI, no interface, no panel layout, no labels, no overlay graphics.",
    "IMPORTANT NEGATIVE RULES: no multiple characters, no crowd, no tiny distant subject, no chaotic unreadable composition, no washed out colors, no muddy silhouette, no ordinary esports headshot, no plain realistic person portrait.",
    "The final image must feel iconic, memorable, weird, colorful, premium, and instantly legible as collectible fantasy-cyberpunk creature art.",
  ].join(" ");
}
