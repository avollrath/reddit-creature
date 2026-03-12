"use client";

import { useMemo } from "react";
import CreatureCard from "@/components/creature-card";
import { generateCreatureFromProfile } from "@/lib/creatures/local-generator";
import { createLocalProfileSnapshot } from "@/lib/creatures/local-profile";

type ExampleCardStackProps = {
  activeUsername: string;
  disabled: boolean;
  onSelect: (username: string) => void;
};

const hikaruLore =
  "The Hikaru Nakamura Tempest enters the fray as a predatory force, a Blitz Grandmaster who relentlessly hunts initiative. His movements are a storm of calculated aggression, never yielding ground once seized. Hikaru Nakamura fights with the discipline and presence expected from a tactical berserker.";

export default function ExampleCardStack({
  activeUsername,
  disabled,
  onSelect,
}: ExampleCardStackProps) {
  const hikaruCreature = useMemo(() => {
    const profile = {
      ...createLocalProfileSnapshot("hikaru"),
      source: "chesscom" as const,
      lookupState: "ok" as const,
      lookupMessage: null,
      limitedData: false,
      warnings: [],
      displayName: "Hikaru Nakamura",
      title: "GM",
      followers: 285200,
      joined: 1_284_681_600,
      lastOnline: 1_742_478_400,
      status: "premium",
      rapidRating: 2839,
      rapidBest: 2900,
      rapidWins: 154,
      rapidLosses: 35,
      rapidDraws: 22,
      blitzRating: 3321,
      blitzBest: 3400,
      blitzWins: 1820,
      blitzLosses: 511,
      blitzDraws: 96,
      bulletRating: 3299,
      bulletBest: 3360,
      bulletWins: 2740,
      bulletLosses: 910,
      bulletDraws: 110,
      dailyRating: 1960,
      dailyBest: 2010,
      dailyWins: 9,
      dailyLosses: 4,
      dailyDraws: 2,
      puzzleBest: 3590,
      tacticsBest: 3590,
    };

    const creature = generateCreatureFromProfile(profile);

    return {
      ...creature,
      name: "Hikaru Nakamura, Blitz Gm",
      title: "Blitz Grandmaster",
      description: hikaruLore,
      imageUrl: "/creatures/hikaru.png",
    };
  }, []);

  const isActive = activeUsername.trim().toLowerCase() === "hikaru";

  return (
    <div className="mb-8 flex flex-col items-center">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => onSelect("hikaru")}
        onKeyDown={(event) => {
          if (disabled) {
            return;
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect("hikaru");
          }
        }}
        className={`rounded-[28px] transition ${
          isActive ? "ring-2 ring-emerald-300/70 ring-offset-0" : ""
        } ${disabled ? "cursor-not-allowed opacity-70" : "hover:-translate-y-1"}`}
        aria-label="Use hikaru as the example username"
      >
        <div className="flex h-[239px] w-[171px] items-start justify-center overflow-visible">
          <CreatureCard
            {...hikaruCreature}
            artworkAssumeLoaded
            fixedScale={0.3}
          />
        </div>
      </div>
    </div>
  );
}
