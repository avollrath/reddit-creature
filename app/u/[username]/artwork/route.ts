import { NextResponse } from "next/server";
import { resolveCreatureFromUsername } from "@/lib/creatures";
import { normalizeUsername } from "@/lib/creatures/local-profile";
import { resolveCreatureArtwork } from "@/lib/artwork";
import { CREATURE_ARTWORK_FALLBACK_URL } from "@/lib/artwork/fallback";

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

  try {
    let routeTimeoutId: NodeJS.Timeout | null = null;
    const artwork = await Promise.race([
      resolveCreatureArtwork(creature),
      new Promise<Awaited<ReturnType<typeof resolveCreatureArtwork>>>((resolve) => {
        routeTimeoutId = setTimeout(() => {
          console.error(
            "[artwork-route] Route-level timeout reached, using fallback",
            {
              username: normalizedUsername,
            }
          );
          resolve({
            kind: "fallback",
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
        fallbackUrl: CREATURE_ARTWORK_FALLBACK_URL,
      });
      const response = NextResponse.redirect(
        new URL(CREATURE_ARTWORK_FALLBACK_URL, request.url),
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
    const body = new ArrayBuffer(artwork.artwork.bytes.byteLength);
    new Uint8Array(body).set(artwork.artwork.bytes);

    return new Response(body, {
      headers: {
        "Content-Type": artwork.artwork.mimeType,
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition": `inline; filename="${normalizedUsername}-artwork.png"`,
      },
    });
  } catch (error) {
    console.error("[artwork-route] Unexpected route failure, using fallback", {
      username: normalizedUsername,
      message: error instanceof Error ? error.message : String(error),
    });
    const response = NextResponse.redirect(
      new URL(CREATURE_ARTWORK_FALLBACK_URL, request.url),
      307
    );
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    return response;
  }
}
