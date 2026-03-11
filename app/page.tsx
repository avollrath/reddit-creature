"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SummonForm from "@/components/summon-form";
import { normalizeUsername } from "@/lib/creatures/local-profile";

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

    if (!value.trim() || normalized === "unknown_redditor") {
      return "Drop in a Reddit handle and let the summoning begin.";
    }

    if (normalized.length < 3 || normalized.length > 20) {
      return "That handle feels off. Reddit usernames should be 3 to 20 characters.";
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
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.28em] text-emerald-300/80">
            RTC - Reddit Trading Card
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Turn any Reddit profile into a collectible trading card
          </h1>

          <p className="mt-4 text-lg font-medium leading-8 text-white/72">
            Enter a Reddit username and we&apos;ll transform it into a one-of-a-kind
            card with rarity, power, lore, and original creature art.
          </p>

          <p className="mt-4 text-sm font-normal leading-7 text-white/52">
            It&apos;s a fun way to see a Reddit profile reimagined as something worth
            sharing, saving, and showing off.
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
