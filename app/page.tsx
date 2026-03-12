"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExampleCardStack from "@/components/example-card-stack";
import SummonForm from "@/components/summon-form";
import { normalizeUsername } from "@/lib/creatures/local-profile";

function CrownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5"
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

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [isSummoning, setIsSummoning] = useState(false);
  const [feedback, setFeedback] = useState<{
    kind: "error" | "success";
    message: string;
  } | null>(null);

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

    if (!value.trim() || normalized === "unknown-player") {
      return "Enter a Chess.com username to create a card.";
    }

    if (normalized.length < 2 || normalized.length > 25) {
      return "That username looks invalid. Chess.com usernames are usually 2 to 25 characters.";
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(normalized)) {
      return "Use letters, numbers, underscores, or hyphens only.";
    }

    return null;
  }

  function summonUsername(username: string) {
    setInput(username);
    setFeedback(null);
    setIsSummoning(true);
    router.push(`/u/${username}`);
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
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 text-center">
        <div className="max-w-2xl">
          <ExampleCardStack
            activeUsername={input}
            disabled={isSummoning}
            onSelect={setInput}
          />

          <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.28em] text-emerald-300/80">
            <CrownIcon />
            CTC - Chess.com Trading Card
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Turn any Chess.com player into a trading card 
          </h1>

          <p className="mt-4 text-lg font-medium leading-8 text-white/72">
            Enter a Chess.com username to generate a card with player stats, rarity,
            story text, and fantasy artwork.
          </p>

          <p className="mt-4 text-sm font-normal leading-7 text-white/52">
            Ratings, title, followers, account age, and play style all shape the final result. ✨
          </p>

          <SummonForm
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isSummoning={isSummoning}
            feedback={feedback}
          />
        </div>
      </div>
    </main>
  );
}
