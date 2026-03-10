"use client";

const epicParticles = [
  { left: "10%", top: "16%", size: 5, delay: "0s", duration: "5.4s" },
  { left: "22%", top: "74%", size: 4, delay: "0.9s", duration: "6.2s" },
  { left: "38%", top: "22%", size: 6, delay: "1.6s", duration: "5.8s" },
  { left: "56%", top: "68%", size: 4, delay: "0.4s", duration: "6.6s" },
  { left: "72%", top: "26%", size: 5, delay: "1.2s", duration: "5.1s" },
  { left: "82%", top: "58%", size: 3, delay: "2s", duration: "6.1s" },
];

const legendaryParticles = [
  { left: "12%", top: "14%", size: 6, delay: "0s", duration: "4.8s" },
  { left: "24%", top: "70%", size: 5, delay: "0.8s", duration: "5.6s" },
  { left: "36%", top: "20%", size: 7, delay: "1.4s", duration: "5s" },
  { left: "52%", top: "76%", size: 5, delay: "2.1s", duration: "5.7s" },
  { left: "64%", top: "24%", size: 6, delay: "1s", duration: "4.6s" },
  { left: "76%", top: "62%", size: 4, delay: "2.5s", duration: "5.9s" },
  { left: "86%", top: "30%", size: 5, delay: "1.8s", duration: "5.2s" },
  { left: "90%", top: "54%", size: 4, delay: "0.5s", duration: "6.3s" },
];

type CardParticleLayerProps = {
  rarity: "Epic" | "Legendary";
};

export default function CardParticleLayer({
  rarity,
}: CardParticleLayerProps) {
  const particles = rarity === "Legendary" ? legendaryParticles : epicParticles;
  const particleClass =
    rarity === "Legendary"
      ? "bg-[radial-gradient(circle,rgba(254,240,138,0.98)_0%,rgba(251,191,36,0.78)_52%,rgba(249,115,22,0.12)_100%)] shadow-[0_0_16px_rgba(251,191,36,0.58)]"
      : "bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,rgba(244,114,182,0.74)_48%,rgba(96,165,250,0.14)_100%)] shadow-[0_0_14px_rgba(217,70,239,0.48)]";

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[26px]">
      {particles.map((particle, index) => (
        <span
          key={`${rarity}-${index}`}
          className={`absolute rounded-full opacity-90 mix-blend-screen animate-card-particle-float ${particleClass}`}
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
          }}
        />
      ))}
    </div>
  );
}
