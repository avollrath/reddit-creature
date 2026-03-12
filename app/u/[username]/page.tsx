import type { Metadata } from "next";
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
  const cardCopy = await resolveCreatureCardCopy(creature);
  const canonicalPath = `/u/${normalizedUsername}`;
  const canonicalUrl = getAbsoluteUrl(canonicalPath);
  const previewImageUrl = getAbsoluteUrl(`${canonicalPath}/opengraph-image`);
  const title = `${cardCopy.name} | @${normalizedUsername} | CTC - Chess.com Trading Card`;
  const description = `${cardCopy.title}. ${creature.rarity} ${creature.metadata.affinity} card with ${creature.metadata.power} power and ${creature.metadata.strongestModeLabel.toLowerCase()} specialization.`;

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
      siteName: "CTC - Chess.com Trading Card",
      type: "website",
      images: [
        {
          url: previewImageUrl,
          alt: `${cardCopy.name} player card for @${normalizedUsername}`,
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
    title: cardCopy.title,
    description: cardCopy.lore,
    imageUrl: `/u/${normalizedUsername}/artwork`,
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#27272a_0%,_#09090b_45%,_#000_100%)] px-4 py-6 text-white sm:px-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <UserCreaturePageClient
          username={normalizedUsername}
          creature={creatureWithArtwork}
        />
      </div>
    </main>
  );
}
