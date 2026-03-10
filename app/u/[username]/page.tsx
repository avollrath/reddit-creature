import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import CreatureCard from "@/components/creature-card";
import ShareCreatureLink from "@/components/share-creature-link";
import { resolveCreatureFromUsername } from "@/lib/creatures";
import { resolveCreatureCardCopy } from "@/lib/creature-card-copy";
import { normalizeUsername } from "@/lib/creatures/local-profile";
import { getAbsoluteUrl } from "@/lib/site";

type UserCreaturePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export async function generateMetadata({
  params,
}: UserCreaturePageProps): Promise<Metadata> {
  const { username } = await params;
  const normalizedUsername = normalizeUsername(username);
  const creature = await resolveCreatureFromUsername(normalizedUsername);
  const canonicalPath = `/u/${normalizedUsername}`;
  const canonicalUrl = getAbsoluteUrl(canonicalPath);
  const previewImageUrl = getAbsoluteUrl(`${canonicalPath}/opengraph-image`);
  const title = `${creature.name} | u/${normalizedUsername} | Reddit Creature`;
  const description = `${creature.title}. ${creature.description} ${creature.rarity} ${creature.metadata.affinity} creature with ${creature.metadata.power} power.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Reddit Creature",
      type: "website",
      images: [
        {
          url: previewImageUrl,
          alt: `${creature.name} creature card for u/${normalizedUsername}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [previewImageUrl],
    },
  };
}

export default async function UserCreaturePage({
  params,
}: UserCreaturePageProps) {
  const { username } = await params;
  const normalizedUsername = normalizeUsername(username);

  if (username !== normalizedUsername) {
    redirect(`/u/${normalizedUsername}`);
  }

  const creature = await resolveCreatureFromUsername(normalizedUsername);
  const cardCopy = await resolveCreatureCardCopy(creature);
  const creatureWithArtwork = {
    ...creature,
    name: cardCopy.name,
    description: cardCopy.lore,
    imageUrl: `/u/${normalizedUsername}/artwork`,
    fallbackImageUrl: creature.imageUrl,
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#27272a_0%,_#09090b_45%,_#000_100%)] px-6 py-16 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-base font-medium text-white/72 transition hover:bg-white/10 hover:text-white"
          >
            Summon another
          </Link>

          <p className="mt-6 text-base font-medium uppercase tracking-[0.28em] text-emerald-300/80">
            Reddit Creature
          </p>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Your Reddit creature has emerged
          </h1>

          <p className="mt-4 max-w-lg text-lg font-medium leading-8 text-white/72">
            Real Reddit signals shape the rarity, power, lore, and mood, so each reveal
            feels pulled from the profile behind the name.
          </p>

          <p className="mt-3 max-w-lg text-base font-normal leading-7 text-white/56">
            First-time art can take a beat to bloom. After that, sharing and saving are quick.
          </p>

          <ShareCreatureLink username={normalizedUsername} />
        </div>

        <CreatureCard {...creatureWithArtwork} />
      </div>
    </main>
  );
}
