export default function UserCreatureLoading() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#27272a_0%,_#09090b_45%,_#000_100%)] px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
          <div className="h-full w-2/5 animate-loading-bar rounded-full bg-emerald-300" />
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
          Summoning Creature
        </p>
      </div>
    </main>
  );
}
