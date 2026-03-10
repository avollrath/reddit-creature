import ThreeDCard from "@/components/3d-card";
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
  imageUrl: string;
  username: string;
  stats: {
    karma: string;
    cakeDay: string;
    alignment: string;
  };
};

const rarityStyles = {
  Common:
    "border-white/10 bg-white/5 text-white/70",
  Rare:
    "border-sky-400/40 bg-sky-400/10 text-sky-200",
  Epic:
    "border-fuchsia-400/40 bg-fuchsia-400/10 text-fuchsia-200",
  Legendary:
    "border-amber-400/40 bg-amber-400/10 text-amber-200",
};

export default function CreatureCard({
  name,
  title,
  description,
  rarity,
  imageUrl,
  username,
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
      <Card className="overflow-hidden rounded-[28px] border border-white/10 bg-neutral-950 text-white shadow-2xl">
        <div className="relative h-[440px] overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

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
            <div className="rounded-[24px] border border-white/10 bg-black/45 p-4 backdrop-blur-md">
              <p className="mb-1 text-[11px] uppercase tracking-[0.24em] text-emerald-300/90">
                {title}
              </p>
              <h2 className="text-3xl font-black tracking-tight">{name}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/78">
                {description}
              </p>
            </div>
          </div>
        </div>

        <CardHeader className="border-t border-white/10 bg-white/[0.03]">
          <CardTitle className="text-xs uppercase tracking-[0.24em] text-white/55">
            Creature Traits
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-3 gap-3 pb-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Karma
            </p>
            <p className="mt-1 text-sm font-bold text-white">{stats.karma}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Cake Day
            </p>
            <p className="mt-1 text-sm font-bold text-white">{stats.cakeDay}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
              Alignment
            </p>
            <p className="mt-1 text-sm font-bold text-white">
              {stats.alignment}
            </p>
          </div>
        </CardContent>

        <CardFooter className="justify-between border-white/10 bg-white/[0.02] text-xs text-white/55">
          <span>Reddit Creature</span>
          <span>Prototype v1</span>
        </CardFooter>
      </Card>
    </ThreeDCard>
  );
}