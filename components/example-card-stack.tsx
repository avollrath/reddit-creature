type ExampleCardStackProps = {
  activeUsername: string;
  disabled: boolean;
  onSelect: (username: string) => void;
};

const exampleCards = [
  {
    username: "hikaru",
    rarity: "Grandmaster",
    title: "Clockfire Sovereign",
    accent: "Bullet",
    palette:
      "border-yellow-200/25 bg-[linear-gradient(180deg,rgba(250,204,21,0.22),rgba(120,53,15,0.42),rgba(9,9,11,0.98))]",
    glow: "from-yellow-200/35 via-amber-300/12 to-transparent",
  },
  {
    username: "magnuscarlsen",
    rarity: "Mythic",
    title: "Ivory Worldshaper",
    accent: "Rapid",
    palette:
      "border-violet-200/22 bg-[linear-gradient(180deg,rgba(139,92,246,0.24),rgba(49,46,129,0.4),rgba(9,9,11,0.98))]",
    glow: "from-violet-200/30 via-indigo-300/10 to-transparent",
  },
  {
    username: "fabianocaruana",
    rarity: "Legendary",
    title: "Endgame Regent",
    accent: "Classical",
    palette:
      "border-sky-200/22 bg-[linear-gradient(180deg,rgba(56,189,248,0.22),rgba(8,47,73,0.42),rgba(9,9,11,0.98))]",
    glow: "from-sky-200/30 via-cyan-300/10 to-transparent",
  },
] as const;

export default function ExampleCardStack({
  activeUsername,
  disabled,
  onSelect,
}: ExampleCardStackProps) {
  return (
    <div className="mt-8 flex flex-col items-center">
      <div className="relative flex h-[168px] w-[310px] items-end justify-center sm:h-[184px] sm:w-[420px]">
        {exampleCards.map((card, index) => {
          const isActive = activeUsername.trim().toLowerCase() === card.username;
          const offsetClass =
            index === 0
              ? "left-0 top-5 rotate-[-8deg] sm:left-5"
              : index === 1
                ? "left-1/2 top-0 z-20 -translate-x-1/2"
                : "right-0 top-5 rotate-[8deg] sm:right-5";

          return (
            <button
              key={card.username}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(card.username)}
              className={`absolute h-[144px] w-[108px] overflow-hidden rounded-[18px] border p-2 text-left shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1 hover:scale-[1.03] sm:h-[160px] sm:w-[120px] ${offsetClass} ${card.palette} ${
                isActive ? "ring-2 ring-emerald-300/70" : ""
              } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
              aria-label={`Use ${card.username} as the example username`}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${card.glow}`} />
              <div className="relative flex h-full flex-col rounded-[14px] border border-white/10 bg-black/28 p-2 backdrop-blur-sm">
                <div className="flex items-center justify-between text-[7px] font-semibold uppercase tracking-[0.22em] text-white/68">
                  <span>{card.rarity}</span>
                  <span>♟️</span>
                </div>

                <div className="mt-2 flex-1 rounded-[12px] border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.2))]" />

                <div className="mt-2">
                  <p className="truncate text-[9px] font-black uppercase tracking-[0.18em] text-white">
                    @{card.username}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[9px] font-medium leading-3.5 text-white/82">
                    {card.title}
                  </p>
                  <div className="mt-2 inline-flex rounded-full border border-white/12 bg-white/8 px-1.5 py-1 text-[7px] font-semibold uppercase tracking-[0.18em] text-white/75">
                    {card.accent}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-white/48">
        Tap a card to try an example player.
      </p>
    </div>
  );
}
