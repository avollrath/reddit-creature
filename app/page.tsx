"use client";

import { useMemo, useState } from "react";
import CreatureCard from "@/components/creature-card";
import { getMockCreature } from "@/lib/mock-creatures";

const exampleUsernames = [
  "trendy_summoner",
  "lurkfather",
  "memecleric",
  "andre",
  "voidprophet99",
];

export default function Home() {
  const [input, setInput] = useState("trendy_summoner");
  const [submittedUsername, setSubmittedUsername] = useState("trendy_summoner");

  const creature = useMemo(() => {
    return getMockCreature(submittedUsername);
  }, [submittedUsername]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmittedUsername(input);
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

          <form onSubmit={handleSubmit} className="mt-8 max-w-lg">
            <label
              htmlFor="username"
              className="mb-3 block text-xs font-semibold uppercase tracking-[0.24em] text-white/55"
            >
              Reddit username
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="username"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. andre"
                className="h-12 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-white outline-none transition focus:border-emerald-400/60 focus:bg-white/8"
              />

              <button
                type="submit"
                className="h-12 rounded-2xl bg-emerald-400 px-5 font-semibold text-black transition hover:scale-[1.02] hover:bg-emerald-300"
              >
                Summon
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2 text-sm text-white/65">
            {exampleUsernames.map((username) => {
              const isActive = submittedUsername === username;

              return (
                <button
                  key={username}
                  type="button"
                  onClick={() => {
                    setInput(username);
                    setSubmittedUsername(username);
                  }}
                  className={`rounded-full border px-4 py-2 transition ${
                    isActive
                      ? "border-white bg-white/10 text-white"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {username}
                </button>
              );
            })}
          </div>
        </div>

        <CreatureCard {...creature} />
      </div>
    </main>
  );
}