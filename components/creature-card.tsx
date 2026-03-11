import ThreeDCard from "@/components/3d-card";
import Balatro from "@/components/balatro";
import CardParticleLayer from "@/components/card-particle-layer";
import CreatureArtworkImage from "@/components/creature-artwork-image";
import Plasma from "@/components/plasma";
import LiquidChrome from "@/components/liquid-chrome";
import { Card } from "@/components/ui/card";
import { CREATURE_ARTWORK_FALLBACK_URL } from "@/lib/artwork/fallback";

type CreatureCardProps = {
  name: string;
  title: string;
  description: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  rarityAccent: string;
  imageUrl: string;
  artworkAssumeLoaded?: boolean;
  username: string;
  metadata: {
    power: number;
    affinity: string;
    traitLabel: string;
  };
  grounding: {
    source: "local" | "reddit";
    accountAgeYears: number | null;
  };
  stats: {
    karma: string;
    cakeDay: string;
    alignment: string;
  };
};

const rarityStyles = {
  Common: "border-white/15 bg-white/10 text-zinc-100",
  Rare: "border-sky-300/30 bg-sky-400/15 text-sky-100",
  Epic: "border-fuchsia-300/30 bg-fuchsia-400/15 text-fuchsia-100",
  Legendary: "border-amber-300/35 bg-amber-400/20 text-amber-100",
};

const rarityThemes = {
  Common: {
    frame:
      "border-zinc-200/18 bg-[linear-gradient(180deg,#404046_0%,#18181d_18%,#111114_52%,#09090b_100%)]",
    inner:
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.008)_18%,rgba(0,0,0,0.04)_100%)]",
    accent: "text-zinc-100",
    line: "bg-white/10",
    tag: "border-zinc-200/14 bg-white/[0.05] text-white/84",
    stat:
      "border-zinc-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.12))]",
    panel:
      "border-zinc-200/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(24,24,27,0.22))]",
    artFrame:
      "border-zinc-200/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.015)_20%,rgba(0,0,0,0.12)_100%)]",
    glow: "from-white/12 via-white/4 to-transparent",
  },
  Rare: {
    frame:
      "border-sky-200/18 bg-[linear-gradient(180deg,#164e63_0%,#0f172a_18%,#082f49_52%,#09090b_100%)]",
    inner:
      "bg-[linear-gradient(180deg,rgba(224,242,254,0.02),rgba(255,255,255,0.008)_18%,rgba(0,0,0,0.04)_100%)]",
    accent: "text-sky-100",
    line: "bg-sky-300/12",
    tag: "border-sky-200/16 bg-sky-400/12 text-sky-100",
    stat:
      "border-sky-200/10 bg-[linear-gradient(180deg,rgba(125,211,252,0.05),rgba(8,47,73,0.16))]",
    panel:
      "border-sky-200/10 bg-[linear-gradient(180deg,rgba(224,242,254,0.05),rgba(8,47,73,0.22))]",
    artFrame:
      "border-sky-200/12 bg-[linear-gradient(180deg,rgba(125,211,252,0.10),rgba(34,211,238,0.03)_20%,rgba(0,0,0,0.12)_100%)]",
    glow: "from-sky-300/14 via-cyan-300/6 to-transparent",
  },
  Epic: {
    frame:
      "border-fuchsia-200/18 bg-[linear-gradient(180deg,#7a1f85_0%,#1d1122_18%,#4b0b53_52%,#09090b_100%)]",
    inner:
      "bg-[linear-gradient(180deg,rgba(250,232,255,0.02),rgba(255,255,255,0.008)_18%,rgba(0,0,0,0.04)_100%)]",
    accent: "text-fuchsia-100",
    line: "bg-fuchsia-300/12",
    tag: "border-fuchsia-200/16 bg-fuchsia-400/12 text-fuchsia-100",
    stat:
      "border-fuchsia-200/10 bg-[linear-gradient(180deg,rgba(240,171,252,0.05),rgba(74,4,78,0.16))]",
    panel:
      "border-fuchsia-200/10 bg-[linear-gradient(180deg,rgba(250,232,255,0.05),rgba(74,4,78,0.22))]",
    artFrame:
      "border-fuchsia-200/12 bg-[linear-gradient(180deg,rgba(240,171,252,0.11),rgba(217,70,239,0.03)_20%,rgba(0,0,0,0.12)_100%)]",
    glow: "from-fuchsia-300/14 via-pink-300/6 to-transparent",
  },
  Legendary: {
    frame:
      "border-amber-200/20 bg-[linear-gradient(180deg,#9a5a12_0%,#21170f_18%,#6c3f12_52%,#09090b_100%)]",
    inner:
      "bg-[linear-gradient(180deg,rgba(254,243,199,0.02),rgba(255,255,255,0.008)_18%,rgba(0,0,0,0.04)_100%)]",
    accent: "text-amber-100",
    line: "bg-amber-300/12",
    tag: "border-amber-200/16 bg-amber-400/12 text-amber-100",
    stat:
      "border-amber-200/10 bg-[linear-gradient(180deg,rgba(251,191,36,0.05),rgba(120,53,15,0.16))]",
    panel:
      "border-amber-200/10 bg-[linear-gradient(180deg,rgba(254,243,199,0.05),rgba(120,53,15,0.22))]",
    artFrame:
      "border-amber-200/12 bg-[linear-gradient(180deg,rgba(253,224,71,0.11),rgba(251,191,36,0.04)_20%,rgba(0,0,0,0.12)_100%)]",
    glow: "from-amber-300/14 via-yellow-200/6 to-transparent",
  },
} as const;

const rarityFxThemes = {
  Common: {
    glow:
      "bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),rgba(255,255,255,0.05),transparent_72%)] opacity-45",
    aura: "",
    shineOpacity: "opacity-[0.12]",
  },
  Rare: {
    glow:
      "bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.48),rgba(14,165,233,0.28),transparent_72%)] opacity-70 animate-card-pulse-glow",
    aura:
      "bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.22),rgba(34,211,238,0.1),transparent_74%)] opacity-70",
    shineOpacity: "opacity-[0.18]",
  },
  Epic: {
    glow:
      "bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.5),rgba(217,70,239,0.24),transparent_72%)] opacity-80 animate-card-pulse-glow",
    aura: "",
    shineOpacity: "opacity-[0.22]",
  },
  Legendary: {
    glow:
      "bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.54),rgba(249,115,22,0.28),transparent_72%)] opacity-85 animate-card-pulse-glow",
    aura: "",
    shineOpacity: "opacity-[0.28]",
  },
} as const;

function ClassIcon({ rarity }: { rarity: CreatureCardProps["rarity"] }) {
  const color =
    rarity === "Legendary"
      ? "#fde68a"
      : rarity === "Epic"
        ? "#f5d0fe"
        : rarity === "Rare"
          ? "#bae6fd"
          : "#f4f4f5";

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
      aria-hidden="true"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.8 14.8 8l5.8 1-4.2 4.1.9 6.1L12 16.7 6.7 19.2l.9-6.1L3.4 9l5.8-1L12 2.8Z" />
      <path d="M12 7.8v8.4M8.5 12h7" />
    </svg>
  );
}

function TagIcon({ type }: { type: "class" | "trait" | "relic" }) {
  if (type === "trait") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 12 4 4 8-8" />
      </svg>
    );
  }

  if (type === "relic") {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-3 w-3"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v18M6.5 8.5h11M8.5 15.5h7" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 2.5 5 5.5.8-4 3.9.95 5.5L12 15.6 7.05 18.2 8 12.7 4 8.8 9.5 8 12 3Z" />
    </svg>
  );
}

function StatIcon({
  type,
}: {
  type: "power" | "class" | "karma" | "cake" | "alignment";
}) {
  const iconMap = {
    power: "M12 3l2.5 6H21l-5 4 2 7-6-4-6 4 2-7-5-4h6.5L12 3Z",
    class:
      "M12 4v16M5.5 9c2.2-1.2 4.4-1.8 6.5-1.8S16.3 7.8 18.5 9M8 15c1.5.8 2.9 1.2 4 1.2s2.5-.4 4-1.2",
    karma:
      "M6 12c1.6-2.8 3.6-4.2 6-4.2s4.4 1.4 6 4.2c-1.6 2.8-3.6 4.2-6 4.2S7.6 14.8 6 12Zm6-1.6v3.2",
    cake:
      "M7 10.5h10v7H7zm1-3.5v3.5m4-3.5v3.5m4-3.5v3.5M9.3 6.4c0-.9.9-1.9 1.8-1.9 1 0 1.9.7 1.9 1.9",
    alignment: "M12 3v18M5 12h14",
  } as const;

  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={iconMap[type]} />
    </svg>
  );
}

function TopOverlayEffect({
  rarity,
}: {
  rarity: CreatureCardProps["rarity"];
}) {
  if (rarity === "Epic" || rarity === "Legendary") {
    return (
      <>
        <div className="pointer-events-none absolute inset-0 z-45 overflow-hidden rounded-[26px] opacity-[0.12] mix-blend-screen">
          <Balatro
            color1={rarity === "Legendary" ? "#ffb224" : "#ff5ad9"}
            color2={rarity === "Legendary" ? "#ffe27a" : "#5ac8ff"}
            color3={rarity === "Legendary" ? "#311507" : "#250a32"}
            spinSpeed={rarity === "Legendary" ? 5.3 : 5.9}
            spinAmount={0.15}
            contrast={3.4}
            lighting={0.46}
            pixelFilter={780}
            opacity={0.78}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-[26px] opacity-[0.11] mix-blend-screen">
          <LiquidChrome />
        </div>
      </>
    );
  }

  if (rarity === "Rare") {
    return (
      <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-[26px] opacity-[0.065] mix-blend-screen">
        <Plasma
          color="#22d3ee"
          speed={0.59}
          direction="forward"
          scale={1.1}
          opacity={0.76}
          mouseInteractive={true}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-[26px] opacity-[0.04] mix-blend-screen">
      <Plasma
        color="#ffffff"
        speed={0.37}
        direction="forward"
        scale={1.01}
        opacity={0.45}
        mouseInteractive={true}
      />
    </div>
  );
}

function RarityFxLayers({
  rarity,
}: {
  rarity: CreatureCardProps["rarity"];
}) {
  const fx = rarityFxThemes[rarity];

  return (
    <>
      <div className="pointer-events-none absolute inset-[-18px] z-0 rounded-[34px] blur-[24px]">
        <div className={`h-full w-full rounded-[34px] ${fx.glow}`} />
      </div>

      {fx.aura ? (
        <div className="pointer-events-none absolute inset-[-28px] z-0 rounded-[36px] blur-[30px]">
          <div className={`h-full w-full rounded-[36px] ${fx.aura}`} />
        </div>
      ) : null}

      <div
        className={`pointer-events-none absolute inset-0 z-40 overflow-hidden rounded-[26px] ${fx.shineOpacity}`}
      >
        <div className="animate-card-shine-sweep absolute inset-y-0 left-[-85%] w-[80%] bg-[linear-gradient(120deg,transparent_18%,rgba(255,255,255,0.42)_48%,transparent_78%)]" />
      </div>
    </>
  );
}

function RarityParticles({
  rarity,
}: {
  rarity: CreatureCardProps["rarity"];
}) {
  if (rarity === "Epic" || rarity === "Legendary") {
    return <CardParticleLayer rarity={rarity} />;
  }

  return null;
}

export default function CreatureCard({
  name,
  title,
  description,
  rarity,
  rarityAccent,
  imageUrl,
  artworkAssumeLoaded = false,
  username,
  metadata,
  grounding,
  stats,
}: CreatureCardProps) {
  const theme = rarityThemes[rarity];
  const cardNumber = `${username.slice(0, 3).toUpperCase()}-${metadata.power}`;
  const sigilNumber = Math.max(1, Math.round(grounding.accountAgeYears ?? 1));

  return (
    <div className="mx-auto h-[calc((570px*88/63)*var(--card-scale))] w-[calc(570px*var(--card-scale))] max-w-full [--card-scale:0.64] sm:[--card-scale:0.74] md:[--card-scale:0.86] lg:[--card-scale:1]">
      <div className="origin-top-left [transform:scale(var(--card-scale))]">
        <ThreeDCard
          className="w-[570px]"
          innerId="creature-card"
          maxRotation={18}
          glowOpacity={0.26}
          shadowBlur={48}
          parallaxOffset={38}
          transitionDuration="0.35s"
          enableGlow
          enableShadow
          enableParallax
          hoverPadding={0}
        >
          <Card className="relative aspect-[63/88] gap-0 overflow-visible rounded-none bg-transparent py-0 text-left text-white shadow-none ring-0 [font-family:Arial,Helvetica,sans-serif]">
            <RarityFxLayers rarity={rarity} />
            <RarityParticles rarity={rarity} />
            <div
              className={`relative z-10 flex h-full flex-col overflow-hidden rounded-[26px] border ${theme.frame}`}
            >
              <div className={`pointer-events-none absolute inset-0 ${theme.inner}`} />

              <div className="relative flex h-full flex-col px-3 pb-1.5 pt-1.5">
                <div className="relative px-1 pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-full border p-1.5 ${rarityStyles[rarity]}`}
                        >
                          <ClassIcon rarity={rarity} />
                        </div>

                        <p className="text-[0.98rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-white">
                          {name}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center gap-2 text-[8.5px] uppercase tracking-[0.2em] text-white/52">
                        <span className="truncate">u/{username}</span>
                        <span className="text-white/25">•</span>
                        <span>No. {cardNumber}</span>
                      </div>
                    </div>

                    <div
                      className={`mt-[5px] rounded-full border px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.22em] ${rarityStyles[rarity]}`}
                    >
                      {rarity}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div
                    className={`relative rounded-[16px] border p-[4px] ${theme.artFrame}`}
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 rounded-[16px] bg-gradient-to-b ${theme.glow}`}
                    />
                    <div className="relative aspect-[1.42/1] overflow-hidden rounded-[12px] bg-black">
                      <CreatureArtworkImage
                        key={imageUrl}
                        src={imageUrl}
                        fallbackSrc={CREATURE_ARTWORK_FALLBACK_URL}
                        alt={name}
                        assumeLoaded={artworkAssumeLoaded}
                      />

                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,255,255,0.14),transparent_28%)]" />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_24%,transparent_76%,rgba(0,0,0,0.32))]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/68 via-black/6 to-black/10" />

                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <div className="rounded-[12px] bg-black/34 px-3 py-2 backdrop-blur-sm">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[8.5px] font-semibold uppercase tracking-[0.24em] text-white/42">
                              {metadata.traitLabel}
                            </p>
                            <div
                              className={`rounded-full border px-2 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.2em] ${theme.tag}`}
                            >
                              {metadata.affinity}
                            </div>
                          </div>
                          <p className="mt-1.5 text-[1rem] font-bold leading-tight text-white">
                            {title}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative pt-2">
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] ${theme.tag}`}
                    >
                      <TagIcon type="class" />
                      {metadata.affinity}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] ${theme.tag}`}
                    >
                      <TagIcon type="trait" />
                      {metadata.traitLabel}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.2em] ${theme.tag}`}
                    >
                      <TagIcon type="relic" />
                      {rarityAccent}
                    </span>
                  </div>
                </div>

                <div className="relative pt-2">
                  <div className={`rounded-[12px] border p-2 ${theme.panel}`}>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[
                        ["Power", String(metadata.power), "power"],
                        ["Class", metadata.affinity, "class"],
                        ["Karma", stats.karma, "karma"],
                        ["Cake", stats.cakeDay, "cake"],
                        ["Align", stats.alignment, "alignment"],
                      ].map(([label, value, icon]) => (
                        <div
                          key={label}
                          className={`rounded-[9px] border px-1.5 py-2 ${theme.stat}`}
                        >
                          <div className="flex items-center gap-1 text-[8px] uppercase tracking-[0.18em] text-white/44">
                            <StatIcon
                              type={
                                icon as
                                  | "power"
                                  | "class"
                                  | "karma"
                                  | "cake"
                                  | "alignment"
                              }
                            />
                            <span>{label}</span>
                          </div>

                          <p className="mt-1.5 text-[10.5px] font-bold leading-tight text-white">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative pt-2">
                  <div className={`h-[150px] rounded-[12px] border px-3 py-3 ${theme.panel}`}>
                    <div className="space-y-3 text-[13px] italic leading-6 text-white/84">
                      {description.split(/\n\s*\n/).map((paragraph, index) => (
                        <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative pt-2 text-center">
                  <a
                    href="https://www.vollrath.dev"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-white/62 underline decoration-white/25 underline-offset-4 transition hover:text-white/88"
                  >
                    www.vollrath.dev
                  </a>
                </div>

                <div className="relative mt-auto pt-2">
                  <div className="rounded-[10px] bg-black/14 px-3 py-2">
                    <div className="flex items-center justify-between gap-2 text-[8px] uppercase tracking-[0.2em] text-white/40">
                      <span>Edition 01</span>
                      <span>{cardNumber}</span>
                      <span className={theme.accent}>{rarity}</span>
                      <span>RTC</span>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute bottom-[48px] right-[6px] z-30">
                  <div className="relative flex h-[58px] w-[58px] items-center justify-center rounded-full border border-orange-300/48 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.98)_0%,rgba(0,0,0,0.96)_44%,rgba(17,24,39,0.88)_62%,rgba(251,146,60,0.14)_100%)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.12),inset_0_-12px_18px_rgba(0,0,0,0.78),0_8px_18px_rgba(0,0,0,0.34),0_0_16px_rgba(251,146,60,0.26)] backdrop-blur-md">
                    <div className="pointer-events-none absolute inset-[2px] rounded-full border border-orange-200/34 bg-[conic-gradient(from_210deg,rgba(255,241,220,0.78),rgba(251,146,60,0.1),rgba(255,245,230,0.34),rgba(120,53,15,0.04),rgba(255,241,220,0.78))] opacity-95" />
                    <div className="pointer-events-none absolute inset-[7px] rounded-full border border-black/46 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.08),rgba(255,255,255,0.01)_28%,rgba(0,0,0,0.24)_52%,rgba(0,0,0,0.88)_100%)]" />
                    <div className="pointer-events-none absolute left-[13px] top-[9px] h-[10px] w-[24px] rounded-full bg-orange-100/22 blur-[4px]" />
                    <div className="pointer-events-none absolute inset-x-[10px] top-[4px] h-[8px] rounded-full bg-white/18 blur-[3px]" />
                    <span className="relative z-10 text-[1.45rem] font-black leading-none text-white [text-shadow:0_1px_0_rgba(255,255,255,0.18),0_4px_10px_rgba(0,0,0,0.65)]">
                      {sigilNumber}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 z-40 rounded-[26px] bg-[linear-gradient(120deg,rgba(255,255,255,0.085)_0%,rgba(255,255,255,0.016)_18%,rgba(255,255,255,0)_34%,rgba(255,255,255,0.038)_58%,rgba(255,255,255,0.013)_78%,rgba(255,255,255,0.05)_100%)] opacity-[0.12]" />

              <TopOverlayEffect rarity={rarity} />
            </div>
          </Card>
        </ThreeDCard>
      </div>
    </div>
  );
}
