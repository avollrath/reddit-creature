"use client";

import { useEffect, useMemo, useState } from "react";

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

  const sharePath = useMemo(() => `/u/${username}`, [username]);
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return sharePath;
    }

    return new URL(sharePath, window.location.origin).toString();
  }, [sharePath]);

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
      await navigator.clipboard.writeText(shareUrl);
      setFeedback({
        kind: "success",
        message: "Share link copied.",
      });
    } catch {
      setFeedback({
        kind: "error",
        message: "Clipboard access is unavailable in this browser.",
      });
    }
  }

  return (
    <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
        Shareable Link
      </p>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/75">
          <p className="truncate">{shareUrl}</p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="rounded-2xl border border-emerald-300/20 bg-emerald-400/90 px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-emerald-300"
        >
          Copy link
        </button>
      </div>

      <p
        className={`mt-3 min-h-5 text-sm ${
          feedback?.kind === "error" ? "text-rose-200/85" : "text-white/60"
        }`}
      >
        {feedback?.message ?? " "}
      </p>
    </div>
  );
}
