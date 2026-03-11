import { ImageResponse } from "next/og";
import { resolveCreatureFromUsername } from "@/lib/creatures";
import { normalizeUsername } from "@/lib/creatures/local-profile";

export const alt = "RTC - Reddit Trading Card social preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const rarityStyles = {
  Common: {
    accent: "#d4d4d8",
    glow: "rgba(255,255,255,0.12)",
  },
  Rare: {
    accent: "#7dd3fc",
    glow: "rgba(34,211,238,0.18)",
  },
  Epic: {
    accent: "#f0abfc",
    glow: "rgba(217,70,239,0.18)",
  },
  Legendary: {
    accent: "#fbbf24",
    glow: "rgba(251,191,36,0.22)",
  },
} as const;

type OgImageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function OgImage({ params }: OgImageProps) {
  const { username } = await params;
  const normalizedUsername = normalizeUsername(username);
  const creature = await resolveCreatureFromUsername(normalizedUsername);
  const rarityStyle = rarityStyles[creature.rarity];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 36,
          background:
            "radial-gradient(circle at top, #27272a 0%, #09090b 45%, #000000 100%)",
          color: "white",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 26%, rgba(255,255,255,0) 55%, rgba(255,255,255,0.08) 100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: -80,
            right: -40,
            width: 360,
            height: 360,
            borderRadius: 9999,
            background: rarityStyle.glow,
            filter: "blur(12px)",
          }}
        />

        <div
          style={{
            display: "flex",
            flex: 1,
            borderRadius: 32,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(10,10,12,0.72)",
            backdropFilter: "blur(10px)",
            padding: 28,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: 710,
              paddingRight: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontSize: 18,
                  textTransform: "uppercase",
                  letterSpacing: 4,
                  color: "rgba(167,243,208,0.9)",
                }}
              >
                <span>RTC - Reddit Trading Card</span>
                <span style={{ color: "rgba(255,255,255,0.35)" }}>Prototype</span>
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 18,
                  fontSize: 22,
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                u/{normalizedUsername}
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 18,
                  fontSize: 64,
                  lineHeight: 1.03,
                  fontWeight: 800,
                  letterSpacing: -2,
                  maxWidth: 640,
                }}
              >
                {creature.name}
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 16,
                  fontSize: 24,
                  textTransform: "uppercase",
                  letterSpacing: 3,
                  color: rarityStyle.accent,
                }}
              >
                {creature.title}
              </div>

              <div
                style={{
                  display: "flex",
                  marginTop: 20,
                  fontSize: 24,
                  lineHeight: 1.45,
                  color: "rgba(255,255,255,0.78)",
                  maxWidth: 640,
                }}
              >
                {creature.description}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {[
                creature.rarity,
                creature.metadata.affinity,
                creature.rarityAccent,
                `${creature.metadata.power} power`,
              ].map((label, index) => (
                <div
                  key={`${label}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 16px",
                    borderRadius: 9999,
                    border:
                      index === 0
                        ? `1px solid ${rarityStyle.accent}`
                        : "1px solid rgba(255,255,255,0.12)",
                    background:
                      index === 0
                        ? rarityStyle.glow
                        : "rgba(255,255,255,0.05)",
                    color:
                      index === 0 ? rarityStyle.accent : "rgba(255,255,255,0.8)",
                    fontSize: 18,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    fontWeight: 700,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "stretch",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                borderRadius: 28,
                border: `1px solid ${rarityStyle.accent}33`,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(120deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 18%, rgba(255,255,255,0) 34%, rgba(255,255,255,0.08) 58%, rgba(255,255,255,0.02) 78%, rgba(255,255,255,0.12) 100%)",
                  opacity: 0.6,
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  justifyContent: "space-between",
                  padding: 24,
                  background:
                    "radial-gradient(circle at top, rgba(255,255,255,0.12), transparent 38%), linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.45))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      padding: "8px 12px",
                      borderRadius: 9999,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "rgba(0,0,0,0.35)",
                      fontSize: 16,
                      color: "rgba(255,255,255,0.74)",
                    }}
                  >
                    u/{creature.username}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      padding: "8px 12px",
                      borderRadius: 9999,
                      border: `1px solid ${rarityStyle.accent}66`,
                      background: rarityStyle.glow,
                      fontSize: 16,
                      color: rarityStyle.accent,
                      textTransform: "uppercase",
                      letterSpacing: 2,
                      fontWeight: 700,
                    }}
                  >
                    {creature.rarity}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 24,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(0,0,0,0.35)",
                    padding: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      fontSize: 18,
                      textTransform: "uppercase",
                      letterSpacing: 3,
                      color: "rgba(167,243,208,0.9)",
                    }}
                  >
                    {creature.metadata.traitLabel}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      marginTop: 10,
                      fontSize: 38,
                      lineHeight: 1.05,
                      fontWeight: 800,
                    }}
                  >
                    {creature.name}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 12,
                  }}
                >
                  {[
                    ["Power", String(creature.metadata.power)],
                    ["Class", creature.metadata.affinity],
                    ["Alignment", creature.stats.alignment],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        padding: 14,
                        borderRadius: 18,
                        border: "1px solid rgba(255,255,255,0.1)",
                        background: "rgba(0,0,0,0.28)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          fontSize: 14,
                          textTransform: "uppercase",
                          letterSpacing: 2,
                          color: "rgba(255,255,255,0.45)",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          marginTop: 8,
                          fontSize: 18,
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
