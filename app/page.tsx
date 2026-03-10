"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import EmptyCreatureState from "@/components/empty-creature-state";
import ExampleUsernames from "@/components/example-usernames";
import SummonForm from "@/components/summon-form";
import { normalizeUsername } from "@/lib/creatures/local-profile";

const exampleUsernames = [
  "trendy_summoner",
  "lurkfather",
  "memecleric",
  "andre",
  "voidprophet99",
];

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isSummoning, setIsSummoning] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "error" | "success";
    message: string;
  } | null>(null);

  const activeExample = useMemo(() => {
    const normalized = input.trim() ? normalizeUsername(input) : null;
    return exampleUsernames.includes(normalized ?? "") ? normalized : null;
  }, [input]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  function validateUsername(value: string) {
    const normalized = normalizeUsername(value);

    if (!value.trim() || normalized === "unknown_redditor") {
      return "Enter a Reddit username to summon a creature.";
    }

    if (normalized.length < 3 || normalized.length > 20) {
      return "Usernames should be 3 to 20 characters long.";
    }

    if (!/^[a-zA-Z0-9_]+$/.test(normalized)) {
      return "Use letters, numbers, and underscores only.";
    }

    return null;
  }

  function summonUsername(username: string) {
    setInput(username);
    setFeedback(null);
    setIsSummoning(true);

    window.setTimeout(() => {
      setIsSummoning(false);
      router.push(`/u/${username}`);
    }, 450);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSummoning) {
      return;
    }

    const validationMessage = validateUsername(input);

    if (validationMessage) {
      setFeedback({
        kind: "error",
        message: validationMessage,
      });
      return;
    }

    summonUsername(normalizeUsername(input));
  }

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
            This prototype now generates a deterministic creature for any username,
            so we can validate the interaction and card system before adding real
            Reddit data and AI generation.
          </p>

          <SummonForm
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isSummoning={isSummoning}
            feedback={feedback}
          />

          <ExampleUsernames
            usernames={exampleUsernames}
            activeUsername={activeExample}
            disabled={isSummoning}
            onSelect={summonUsername}
          />
        </div>

        <EmptyCreatureState />
      </div>
    </main>
  );
}
