import { NextResponse } from "next/server";
import { resolveCreatureFromUsername } from "@/lib/creatures";
import { normalizeUsername } from "@/lib/creatures/local-profile";
import { resolveCreatureArtwork } from "@/lib/artwork";

type ArtworkRouteProps = {
  params: Promise<{
    username: string;
  }>;
};

export async function GET(request: Request, { params }: ArtworkRouteProps) {
  const { username } = await params;
  const normalizedUsername = normalizeUsername(username);
  const creature = await resolveCreatureFromUsername(normalizedUsername);
  console.info("[artwork-route] Artwork request started", {
    username: normalizedUsername,
  });

  let routeTimeoutId: NodeJS.Timeout | null = null;
  const artwork = await Promise.race([
    resolveCreatureArtwork(creature),
    new Promise<Awaited<ReturnType<typeof resolveCreatureArtwork>>>((resolve) => {
      routeTimeoutId = setTimeout(() => {
        console.error("[artwork-route] Route-level timeout reached, using fallback", {
          username: normalizedUsername,
        });
        resolve({
          kind: "fallback",
          fallbackUrl: creature.imageUrl,
          reason: "timeout",
        });
      }, 17000);
    }),
  ]);

  if (routeTimeoutId) {
    clearTimeout(routeTimeoutId);
  }

  if (artwork.kind === "fallback") {
    console.warn("[artwork-route] Returning fallback artwork", {
      username: normalizedUsername,
      reason: artwork.reason,
      fallbackUrl: artwork.fallbackUrl,
    });
    const response = NextResponse.redirect(
      new URL(artwork.fallbackUrl, request.url),
      307
    );
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    return response;
  }

  console.info("[artwork-route] Returning generated artwork", {
    username: normalizedUsername,
    model: artwork.artwork.model,
    mimeType: artwork.artwork.mimeType,
    bytes: artwork.artwork.bytes.length,
  });

  return new Response(artwork.artwork.bytes, {
    headers: {
      "Content-Type": artwork.artwork.mimeType,
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `inline; filename="${normalizedUsername}-artwork.png"`,
    },
  });
}
