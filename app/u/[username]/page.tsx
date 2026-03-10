import Link from "next/link";
import { redirect } from "next/navigation";
import CreatureCard from "@/components/creature-card";
import ShareCreatureLink from "@/components/share-creature-link";
import { resolveCreature } from "@/lib/creatures";
import { normalizeUsername } from "@/lib/creatures/local-profile";

type UserCreaturePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function UserCreaturePage({
  params,
}: UserCreaturePageProps) {
  const { username } = await params;
  const normalizedUsername = normalizeUsername(username);

  if (username !== normalizedUsername) {
    redirect(`/u/${normalizedUsername}`);
  }

  const creature = resolveCreature({ username: normalizedUsername });

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#27272a_0%,_#09090b_45%,_#000_100%)] px-6 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Back to summon
          </Link>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-300/80">
            Reddit Creature
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Creature card for u/{normalizedUsername}
          </h1>

          <p className="mt-4 max-w-lg text-base leading-7 text-white/70">
            This card is resolved locally from the username using the current
            deterministic creature system, ready for future Reddit profile data.
          </p>

          <ShareCreatureLink username={normalizedUsername} />
        </div>

        <CreatureCard {...creature} />
      </div>
    </main>
  );
}
