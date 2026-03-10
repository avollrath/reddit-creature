"use client";

import { useEffect, useMemo, useState } from "react";
import { toPng } from "html-to-image";

type ShareCreatureLinkProps = {
  username: string;
};

export default function ShareCreatureLink({
  username,
}: ShareCreatureLinkProps) {
  const [feedback, setFeedback] = useState<{
    kind: "success" | "error";
    message: string;
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const sharePath = useMemo(() => `/u/${username}`, [username]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  async function handleCopy() {
    try {
      const absoluteUrl = new URL(sharePath, window.location.origin).toString();
      await navigator.clipboard.writeText(absoluteUrl);
      setFeedback({
        kind: "success",
        message: "Link copied. Ready to send into the wild.",
      });
    } catch {
      setFeedback({
        kind: "error",
        message: "This browser refused the copy spell. Try again or copy it manually.",
      });
    }
  }

  async function handleDownload() {
    const cardNode = document.getElementById("creature-card");

    if (!cardNode) {
      setFeedback({
        kind: "error",
        message: "The card slipped out of frame. Try again in a second.",
      });
      return;
    }

    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardNode, {
        cacheBust: true,
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${username}-creature-card.png`;
      link.click();
      setFeedback({
        kind: "success",
        message: "Card captured. Your summon is ready to keep.",
      });
    } catch {
      setFeedback({
        kind: "error",
        message: "That export fizzled. Try again in this browser or switch devices.",
      });
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
      <p className="text-[12px] font-medium uppercase tracking-[0.24em] text-white/48">
        Keep or share the summon
      </p>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/75">
          <p className="truncate">{sharePath}</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-base font-semibold text-white transition hover:scale-[1.02] hover:bg-white/12"
          >
            Copy Link
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="rounded-2xl border border-emerald-300/20 bg-emerald-400/90 px-4 py-3 text-base font-bold text-black transition disabled:cursor-wait disabled:bg-emerald-400/75 hover:scale-[1.02] hover:bg-emerald-300"
          >
            {isDownloading ? "Rendering..." : "Save PNG"}
          </button>
        </div>
      </div>

      <p
        className={`mt-3 min-h-5 text-sm ${
          feedback?.kind === "error" ? "text-rose-200/85" : "text-white/60"
        }`}
      >
        {feedback?.message ?? "Pocket the link or save the card art while the magic is still fresh."}
      </p>
    </div>
  );
}
