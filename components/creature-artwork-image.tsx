"use client";

import { useEffect, useRef, useState } from "react";

type CreatureArtworkImageProps = {
  src: string;
  fallbackSrc: string;
  alt: string;
  assumeLoaded?: boolean;
};

export default function CreatureArtworkImage({
  src,
  fallbackSrc,
  alt,
  assumeLoaded = false,
}: CreatureArtworkImageProps) {
  const [isLoaded, setIsLoaded] = useState(assumeLoaded);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [statusText, setStatusText] = useState(
    assumeLoaded ? "Artwork ready." : "Generating artwork..."
  );
  const fallbackTimeoutRef = useRef<number | null>(null);

  function clearFallbackTimeout() {
    if (fallbackTimeoutRef.current !== null) {
      window.clearTimeout(fallbackTimeoutRef.current);
      fallbackTimeoutRef.current = null;
    }
  }

  useEffect(() => {
    if (assumeLoaded) {
      clearFallbackTimeout();
      return;
    }

    clearFallbackTimeout();

    fallbackTimeoutRef.current = window.setTimeout(() => {
      setCurrentSrc((previousSrc) => {
        if (previousSrc === fallbackSrc) {
          return previousSrc;
        }

        setIsLoaded(false);
        setStatusText("Using fallback artwork...");
        return fallbackSrc;
      });
    }, 12000);

    return () => {
      clearFallbackTimeout();
    };
  }, [assumeLoaded, fallbackSrc, src]);

  function handleLoad() {
    clearFallbackTimeout();
    setIsLoaded(true);
    setStatusText(currentSrc === fallbackSrc ? "Using fallback artwork..." : "Artwork ready.");
  }

  function handleError() {
    if (currentSrc !== fallbackSrc) {
      clearFallbackTimeout();
      setIsLoaded(false);
      setStatusText("Using fallback artwork...");
      setCurrentSrc(fallbackSrc);
      return;
    }

    clearFallbackTimeout();
    setStatusText("Artwork unavailable.");
  }

  return (
    <>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_rgba(0,0,0,0.22)_58%,_rgba(0,0,0,0.4)_100%)]">
          <div className="rounded-[12px] border border-white/10 bg-black/36 px-3 py-2 text-center backdrop-blur-sm">
            <p className="text-[7px] font-semibold uppercase tracking-[0.28em] text-emerald-300/70">
              Artwork Loading
            </p>
            <p className="mt-1 text-[10px] text-white/65">
              {statusText}
            </p>
          </div>
        </div>
      )}

      <img
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`absolute inset-0 h-full w-full object-cover saturation-[1.16] contrast-[1.08] transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}
