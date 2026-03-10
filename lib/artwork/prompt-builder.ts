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

export function buildCreatureArtworkPrompt(creature: Creature): string {
  const colorHint = rarityColorHints[creature.rarity];
  const affinityHint =
    affinityMotifHints[creature.metadata.affinity] ||
    "futuristic fantasy textures, strange energy motifs, collectible illustration detail";
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
    `GROUNDING HINTS: ${groundingHints}`,

    `COMPOSITION: one single main creature only, centered, medium shot or three-quarter portrait, large in frame, filling most of the image, strong readable silhouette, clear focal subject, suitable for a trading card illustration slot.`,

    `LIGHTING: dramatic rim light, luminous glow, cinematic contrast, bright focal highlights, rich atmospheric depth, clean separation between subject and background.`,

    `BACKGROUND: surreal futuristic environment, abstracted and supportive, visually rich but secondary to the creature, no clutter, no extra characters.`,

    `TEXTURE AND DETAIL: elegant techno-organic surfaces, glowing materials, strange ornament, premium rendering, crisp forms, vivid color separation.`,

    `IMPORTANT NEGATIVE RULES: no text, no letters, no words, no typography, no logo, no watermark, no signature, no captions.`,

    `IMPORTANT NEGATIVE RULES: no frame, no trading card border, no UI, no interface, no panel layout, no labels, no overlay graphics.`,

    `IMPORTANT NEGATIVE RULES: no multiple characters, no crowd, no tiny distant subject, no chaotic unreadable composition, no washed out colors, no muddy silhouette.`,

    `The final image must feel iconic, memorable, weird, colorful, premium, and instantly legible as collectible fantasy-cyberpunk creature art.`,
  ].join(" ");
}
