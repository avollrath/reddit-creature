"use client";

import { useEffect, useMemo, useState } from "react";
import { toPng } from "html-to-image";

type ShareCreatureLinkProps = {
  username: string;
};

function LinkIcon() {
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
      <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.9 5" />
      <path d="M14 11a5 5 0 0 0-7.07 0L4.81 13.12a5 5 0 0 0 7.07 7.07L13.1 19" />
    </svg>
  );
}

function DownloadIcon() {
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
      <path d="M12 3v11" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M5 20h14" />
    </svg>
  );
}

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
        message: "Link copied.",
      });
    } catch {
      setFeedback({
        kind: "error",
        message: "Copy failed. Try again or copy the link manually.",
      });
    }
  }

  async function handleDownload() {
    const cardNode = document.getElementById("creature-card");

    if (!cardNode) {
      setFeedback({
        kind: "error",
        message: "The card is not ready yet. Try again in a moment.",
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
      link.download = `${username}-chess-player-card.png`;
      link.click();
      setFeedback({
        kind: "success",
        message: "PNG saved.",
      });
    } catch {
      setFeedback({
        kind: "error",
        message: "Export failed. Try again in this browser or on another device.",
      });
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm sm:mt-6 sm:rounded-[24px] sm:p-4">
      <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/48 sm:text-[12px] sm:tracking-[0.24em]">
        <LinkIcon />
        Share or save 🔗
      </p>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white/75 sm:px-4 sm:py-3">
          <p className="truncate">{sharePath}</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-white/12 sm:px-4 sm:py-3 sm:text-base"
          >
            <LinkIcon />
            Copy Link
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/90 px-3.5 py-2.5 text-sm font-bold text-black transition disabled:cursor-wait disabled:bg-emerald-400/75 hover:scale-[1.02] hover:bg-emerald-300 sm:px-4 sm:py-3 sm:text-base"
          >
            <DownloadIcon />
            {isDownloading ? "Rendering..." : "Save PNG"}
          </button>
        </div>
      </div>

      <p
        className={`mt-3 min-h-5 text-xs sm:text-sm ${
          feedback?.kind === "error" ? "text-rose-200/85" : "text-white/60"
        }`}
      >
        {feedback?.message ?? "Copy the link or save the card as a PNG."}
      </p>
    </div>
  );
}
