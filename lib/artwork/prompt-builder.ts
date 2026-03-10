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