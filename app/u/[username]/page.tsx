import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import UserCreaturePageClient from "@/components/user-creature-page-client";
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
  const title = `${creature.name} | u/${normalizedUsername} | RTC - Reddit Trading Card`;
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
      siteName: "RTC - Reddit Trading Card",
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
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#27272a_0%,_#09090b_45%,_#000_100%)] px-4 py-6 text-white sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex justify-center lg:justify-start">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/72 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-base"
          >
            Create new card
          </Link>
        </div>

        <UserCreaturePageClient
          username={normalizedUsername}
          creature={creatureWithArtwork}
        />
      </div>
    </main>
  );
}
