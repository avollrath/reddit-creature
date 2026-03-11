"use client";

import { useEffect, useMemo, useState } from "react";
import CreatureCard from "@/components/creature-card";
import ShareCreatureLink from "@/components/share-creature-link";

type UserCreaturePageClientProps = {
  username: string;
  creature: React.ComponentProps<typeof CreatureCard>;
};

const loadingStatuses = [
  "Consulting the archive imps...",
  "Polishing the holo-foil edges...",
  "Stealing moonlight for the card frame...",
  "Teaching the creature its dramatic entrance...",
  "Dusting off forbidden profile lore...",
  "Negotiating with the pixel spirits...",
  "Feeding the rarity engine fresh karma...",
  "Sharpening the silhouette for maximum menace...",
  "Summoning tasteful neon from the void...",
  "Aligning the shine sweep with destiny...",
  "Taming a small and opinionated djinn...",
  "Extracting ancient upvotes from the ether...",
  "Weaving comment-chain static into silk...",
  "Charging the sigils under blacklight...",
  "Checking if the creature prefers applause...",
  "Translating profile vibes into prophecy...",
  "Brushing stardust off the stat plate...",
  "Convincing the artwork not to blink...",
  "Tuning the particles for dramatic drift...",
  "Binding the card spirit to premium cardstock...",
  "Cooling the forge before the big reveal...",
  "Giving the creature one last evil smirk...",
  "Inspecting the aura for suspicious glitter...",
  "Sealing the summon with collector-grade varnish...",
  "Letting the myth settle into focus...",
  "Preparing a very unnecessary amount of grandeur...",
];

function preloadImage(src: string) {
  return new Promise<string>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(src);
    image.onerror = () => reject(new Error(`Failed to load ${src}`));
    image.src = src;
  });
}

export default function UserCreaturePageClient({
  username,
  creature,
}: UserCreaturePageClientProps) {
  const [isReady, setIsReady] = useState(false);
  const [resolvedImageUrl, setResolvedImageUrl] = useState(creature.imageUrl);
  const [statusIndex, setStatusIndex] = useState(0);
  const isUsingFallbackProfile = creature.grounding.source === "local";

  const currentStatus = useMemo(
    () => loadingStatuses[statusIndex % loadingStatuses.length],
    [statusIndex]
  );

  useEffect(() => {
    if (isReady) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setStatusIndex((previous) => previous + 1);
    }, 2200);

    return () => window.clearInterval(intervalId);
  }, [isReady]);

  useEffect(() => {
    let cancelled = false;

    async function prepareCard() {
      try {
        const loadedSrc = await preloadImage(creature.imageUrl);

        if (cancelled) {
          return;
        }

        setResolvedImageUrl(loadedSrc);
        setIsReady(true);
      } catch {
        if (cancelled) {
          return;
        }

        setResolvedImageUrl(creature.imageUrl);
        setIsReady(true);
      }
    }

    prepareCard();

    return () => {
      cancelled = true;
    };
  }, [creature.imageUrl]);

  if (!isReady) {
    return (
      <div className="mx-auto max-w-6xl py-6 sm:py-8">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
          <div className="h-full w-2/5 animate-loading-bar rounded-full bg-emerald-300" />
        </div>

        <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.24em] text-emerald-300/80 sm:mt-5 sm:text-xs sm:tracking-[0.28em]">
          Preparing the reveal
        </p>

        <p className="mt-3 max-w-xl text-2xl font-extrabold tracking-tight text-white sm:mt-4 sm:text-3xl">
          Your creature is almost ready to step out of the archive.
        </p>

        <p className="mt-3 text-base leading-7 text-white/68 sm:mt-4 sm:text-lg sm:leading-8">
          {currentStatus}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 pt-5 text-center lg:flex-row lg:items-start lg:gap-16 lg:pt-8 lg:text-left xl:gap-20">
      <div className="w-full lg:max-w-none lg:flex-[1.9] xl:flex-[2.1]">
        <p className="mt-2 text-sm font-medium uppercase tracking-[0.22em] text-emerald-300/80 sm:mt-3 sm:text-base sm:tracking-[0.28em]">
          RTC - Reddit Trading Card
        </p>

        <h1 className="mt-2 text-xl font-extrabold leading-[0.96] tracking-tight sm:mt-3 sm:text-2xl xl:text-3xl">
          Your unique Reddit Trading Card has been forged
        </h1>

        <p className="mt-3 w-full max-w-none pb-6 text-base font-medium leading-7 text-white/72 sm:mt-4 sm:pb-8 sm:text-lg sm:leading-8 lg:max-w-[42rem] lg:pb-0 xl:max-w-[48rem]">
          Your Reddit profile shapes the card&apos;s rarity, power, story, and vibe,
          so every reveal feels personal.
        </p>

        {isUsingFallbackProfile ? (
          <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-left text-sm leading-6 text-amber-100/86 sm:mb-8">
            Reddit profile data was unavailable for this summon, so the card is
            using graceful fallback stats and defaults.
          </div>
        ) : null}

        <div className="hidden lg:block">
          <ShareCreatureLink username={username} />
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-12 lg:w-auto lg:flex-[0_0_auto] lg:gap-0">
        <CreatureCard
          {...creature}
          imageUrl={resolvedImageUrl}
          artworkAssumeLoaded
        />

        <div className="w-full max-w-xl lg:hidden">
          <ShareCreatureLink username={username} />
        </div>
      </div>
    </div>
  );
}
