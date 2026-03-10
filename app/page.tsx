import CreatureCard from "@/components/creature-card";

const demoCreature = {
  name: "Karma Wraith",
  title: "Guardian of Endless Threads",
  description:
    "Born from midnight debates, cursed memes, and suspiciously detailed comment chains.",
  rarity: "Epic" as const,
  imageUrl:
    "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
  username: "trendy_summoner",
  stats: {
    karma: "42.8k",
    cakeDay: "2018",
    alignment: "Chaotic Good",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#27272a_0%,_#09090b_45%,_#000_100%)] px-6 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
            Reddit Creature
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Turn a Reddit profile into a fantasy creature card
          </h1>

          <p className="mt-4 max-w-lg text-base leading-7 text-white/70">
            This is the first MVP shell. For now, the card is hardcoded so we can
            get the visuals and interaction feeling right before adding Reddit
            fetching and AI generation.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/65">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              3D tilt card
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              fake creature data
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              no backend yet
            </span>
          </div>
        </div>

        <CreatureCard {...demoCreature} />
      </div>
    </main>
  );
}