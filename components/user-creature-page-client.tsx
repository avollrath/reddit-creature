"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CreatureCard from "@/components/creature-card";
import ShareCreatureLink from "@/components/share-creature-link";

type UserCreaturePageClientProps = {
  username: string;
  creature: React.ComponentProps<typeof CreatureCard>;
};

const loadingStatuses = [
  "Loading player data...",
  "Building the card...",
  "Rendering artwork...",
  "Calculating stats...",
  "Finishing the details...",
];

function CrownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 18h14M7 15h10l1-8-4 2-2-4-2 4-4-2 1 8Z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8v5" />
      <path d="M12 17h.01" />
      <path d="m10.3 3.8-7 12.1A2 2 0 0 0 5 19h14a2 2 0 0 0 1.7-3.1l-7-12.1a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

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
  const hasPartialData = creature.grounding.limitedData && !isUsingFallbackProfile;

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

        if (!cancelled) {
          setResolvedImageUrl(loadedSrc);
          setIsReady(true);
        }
      } catch {
        if (!cancelled) {
          setResolvedImageUrl(creature.imageUrl);
          setIsReady(true);
        }
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
          Preparing your card
        </p>

        <p className="mt-3 max-w-xl text-2xl font-extrabold tracking-tight text-white sm:mt-4 sm:text-3xl">
          Your player card is almost ready.
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
        <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.22em] text-emerald-300/80 sm:mt-3 sm:text-base sm:tracking-[0.28em]">
          <CrownIcon />
          CTC - Chess.com Trading Card
        </p>

        <h1 className="mt-2 text-xl font-extrabold leading-[0.96] tracking-tight sm:mt-3 sm:text-2xl xl:text-3xl">
          Your Chess.com player card is ready
        </h1>

        <p className="mt-3 w-full max-w-none pb-6 text-base font-medium leading-7 text-white/72 sm:mt-4 sm:pb-8 sm:text-lg sm:leading-8 lg:max-w-[42rem] lg:pb-0 xl:max-w-[48rem]">
          Ratings, title, followers, account age, and match history shape the card&apos;s rarity and stats.
        </p>

        {isUsingFallbackProfile ? (
          <div className="mb-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-left text-sm leading-6 text-amber-100/86 sm:mb-8">
            <div className="mb-2 inline-flex items-center gap-2 text-amber-100">
              <WarningIcon />
              <span className="font-medium">Limited data</span>
            </div>
            {creature.grounding.lookupMessage ??
              "Chess.com data was unavailable, so this card uses fallback data."}
          </div>
        ) : hasPartialData ? (
          <div className="mb-6 rounded-2xl border border-sky-300/20 bg-sky-300/10 px-4 py-3 text-left text-sm leading-6 text-sky-100/86 sm:mb-8">
            <div className="mb-2 inline-flex items-center gap-2 text-sky-100">
              <WarningIcon />
              <span className="font-medium">Partial data</span>
            </div>
            {creature.grounding.warnings[0] ??
              "Some player stats were unavailable, so this card was created with partial data."}
          </div>
        ) : null}

        <div className="hidden lg:block">
          <ShareCreatureLink username={username} />
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/72 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-base"
            >
              ✨ Create another card 
            </Link>
          </div>
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
          <div className="mt-6 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/72 transition hover:bg-white/10 hover:text-white sm:px-4 sm:text-base"
            >
              ✨ Create another card 
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
