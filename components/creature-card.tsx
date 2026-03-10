import ThreeDCard from "@/components/3d-card";
import Plasma from "@/components/plasma";
import LiquidChrome from "@/components/liquid-chrome";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type CreatureCardProps = {
  name: string;
  title: string;
  description: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  rarityAccent: string;
  imageUrl: string;
  username: string;
  metadata: {
    power: number;
    affinity: string;
    traitLabel: string;
  };
  stats: {
    karma: string;
    cakeDay: string;
    alignment: string;
  };
};

const rarityStyles = {
  Common: "border-white/10 bg-white/5 text-white/70",
  Rare: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  Epic: "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-200",
  Legendary: "border-amber-400/40 bg-amber-400/10 text-amber-200",
};

const rarityPanelStyles = {
  Common: "border-white/10 bg-black/45",
  Rare: "border-sky-300/20 bg-sky-950/20",
  Epic: "border-fuchsia-300/20 bg-fuchsia-950/20",
  Legendary: "border-amber-300/25 bg-amber-950/20",
};

const rarityGlowStyles = {
  Common: "from-white/8 via-white/0 to-white/0",
  Rare: "from-sky-300/20 via-cyan-300/8 to-transparent",
  Epic: "from-fuchsia-300/22 via-pink-300/10 to-transparent",
  Legendary: "from-amber-300/24 via-yellow-200/10 to-transparent",
};

function TopOverlayEffect({
  rarity,
}: {
  rarity: CreatureCardProps["rarity"];
}) {
  if (rarity === "Epic" || rarity === "Legendary") {
    return (
      <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-[28px] opacity-45 mix-blend-screen">
        <LiquidChrome />
      </div>
    );
  }

  if (rarity === "Rare") {
    return (
      <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-[28px] opacity-25 mix-blend-screen">
        <Plasma
          color="#22d3ee"
          speed={0.6}
          direction="forward"
          scale={1.1}
          opacity={0.8}
          mouseInteractive={true}
        />
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden rounded-[28px] opacity-10 mix-blend-screen">
      <Plasma
        color="#ffffff"
        speed={0.4}
        direction="forward"
        scale={1}
        opacity={0.5}
        mouseInteractive={true}
      />
    </div>
  );
}

export default function CreatureCard({
  name,
  title,
  description,
  rarity,
  rarityAccent,
  imageUrl,
  username,
  metadata,
  stats,
}: CreatureCardProps) {
  return (
    <ThreeDCard
      className="w-full max-w-sm"
      innerId="creature-card"
      maxRotation={12}
      glowOpacity={0.18}
      shadowBlur={35}
      parallaxOffset={28}
      transitionDuration="0.35s"
      enableGlow
      enableShadow
      enableParallax
      hoverPadding={16}
    >
      <Card className="relative overflow-hidden rounded-[28px] border border-white/10 bg-neutral-950 text-white shadow-2xl">
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-20 h-28 bg-gradient-to-b ${rarityGlowStyles[rarity]}`}
        />
        <div className="relative z-10 h-[440px] overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover opacity-82"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />

          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
            <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/70 backdrop-blur">
              u/{username}
            </div>

            <div
              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] backdrop-blur ${rarityStyles[rarity]}`}
            >
              {rarity}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-4">
            <div
              className={`rounded-[24px] border p-4 backdrop-blur-md ${rarityPanelStyles[rarity]}`}
            >
              <p className="mb-1 text-[11px] uppercase tracking-[0.24em] text-emerald-300/90">
                {title}
              </p>
              <h2 className="text-3xl font-black tracking-tight">{name}</h2>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1">
                  {metadata.affinity}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 ${rarityStyles[rarity]}`}
                >
                  {metadata.traitLabel}
                </span>
                <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-white/78">
                  {rarityAccent}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/78">
                {description}
              </p>
            </div>
          </div>
        </div>

        <CardHeader className="relative z-10 border-t border-white/10 bg-white/[0.03]">
          <CardTitle className="text-xs uppercase tracking-[0.24em] text-white/55">
            Creature Traits
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10 grid grid-cols-2 gap-3 pb-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Power
            </p>
            <p className="mt-1 text-sm font-bold text-white">{metadata.power}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Class
            </p>
            <p className="mt-1 text-sm font-bold text-white">{metadata.affinity}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Karma
            </p>
            <p className="mt-1 text-sm font-bold text-white">{stats.karma}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Cake Day
            </p>
            <p className="mt-1 text-sm font-bold text-white">{stats.cakeDay}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Alignment
            </p>
            <p className="mt-1 text-sm font-bold text-white">
              {stats.alignment}
            </p>
          </div>
        </CardContent>

        <CardFooter className="relative z-10 justify-between border-white/10 bg-black/20 text-xs text-white/55 backdrop-blur-sm">
          <span>Reddit Creature</span>
          <span>Prototype v1</span>
        </CardFooter>

        <div className="pointer-events-none absolute inset-0 z-40 rounded-[28px] bg-[linear-gradient(120deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.03)_18%,rgba(255,255,255,0)_34%,rgba(255,255,255,0.08)_58%,rgba(255,255,255,0.02)_78%,rgba(255,255,255,0.12)_100%)] opacity-60" />

        <TopOverlayEffect rarity={rarity} />
      </Card>
    </ThreeDCard>
  );
}
