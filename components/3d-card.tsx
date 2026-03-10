"use client";

import React, {
  useState,
  useRef,
  useCallback,
  ReactNode,
  CSSProperties,
  useEffect,
} from "react";

interface ThreeDCardProps {
  children: ReactNode;
  className?: string;
  innerId?: string;
  maxRotation?: number;
  glowOpacity?: number;
  shadowBlur?: number;
  parallaxOffset?: number;
  transitionDuration?: string;
  backgroundImage?: string | null;
  enableGlow?: boolean;
  enableShadow?: boolean;
  enableParallax?: boolean;
  hoverPadding?: number;
  trackOnWindow?: boolean;
}

function ThreeDCard({
  children,
  className = "",
  innerId,
  maxRotation = 10,
  glowOpacity = 0.2,
  shadowBlur = 30,
  parallaxOffset = 40,
  transitionDuration = "0.6s",
  backgroundImage = null,
  enableGlow = true,
  enableShadow = true,
  enableParallax = true,
  hoverPadding = 12,
  trackOnWindow = false,
}: ThreeDCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const lastPointerRef = useRef({ x: 0.5, y: 0.5, insideViewport: false });

  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    glowX: 50,
    glowY: 50,
    shadowX: 0,
    shadowY: 20,
    isHovered: false,
  });

  const resetTransform = useCallback(() => {
    setTransform({
      rotateX: 0,
      rotateY: 0,
      glowX: 50,
      glowY: 50,
      shadowX: 0,
      shadowY: 20,
      isHovered: false,
    });
  }, []);

  const applyTransform = useCallback(
    ({
      xPct,
      yPct,
      glowX,
      glowY,
      rotationScale,
      isHovered,
    }: {
      xPct: number;
      yPct: number;
      glowX: number;
      glowY: number;
      rotationScale: number;
      isHovered: boolean;
    }) => {
      const newRotateX = yPct * -1 * maxRotation * rotationScale;
      const newRotateY = xPct * maxRotation * rotationScale;

      setTransform({
        rotateX: newRotateX,
        rotateY: newRotateY,
        glowX,
        glowY,
        shadowX: enableShadow ? newRotateY * 0.8 : 0,
        shadowY: enableShadow ? 20 - newRotateX * 0.6 : 20,
        isHovered,
      });
    },
    [enableShadow, maxRotation]
  );

  const applyViewportTransform = useCallback(
    (clientX: number, clientY: number) => {
      if (!cardRef.current) return;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const normalizedX = Math.min(1, Math.max(0, clientX / viewportWidth));
      const normalizedY = Math.min(1, Math.max(0, clientY / viewportHeight));

      const rect = cardRef.current.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;
      const distanceToCard = Math.hypot(clientX - cardCenterX, clientY - cardCenterY);
      const maxDistance = Math.hypot(viewportWidth, viewportHeight) * 0.6;
      const proximity = 1 - Math.min(distanceToCard / maxDistance, 1);
      const viewportRotationScale = 0.18 + proximity * 0.2;

      applyTransform({
        xPct: normalizedX - 0.5,
        yPct: normalizedY - 0.5,
        glowX: normalizedX * 100,
        glowY: normalizedY * 100,
        rotationScale: viewportRotationScale,
        isHovered: false,
      });
    },
    [applyTransform]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const { width, height, left, top } = rect;

      // Mouse events are attached to a padded "hit area" wrapper to avoid
      // enter/leave jitter when the card tilts away from the cursor.
      // Clamp so motion in the padding doesn't create extreme rotations.
      const mouseX = Math.min(width, Math.max(0, e.clientX - left));
      const mouseY = Math.min(height, Math.max(0, e.clientY - top));

      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;

      applyTransform({
        xPct,
        yPct,
        glowX: (mouseX / width) * 100,
        glowY: (mouseY / height) * 100,
        rotationScale: 1,
        isHovered: true,
      });
    },
    [applyTransform]
  );

  const handleMouseEnter = useCallback(() => {
    setTransform((prev) => ({ ...prev, isHovered: true }));
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!lastPointerRef.current.insideViewport) {
      resetTransform();
      return;
    }

    applyViewportTransform(
      lastPointerRef.current.x * window.innerWidth,
      lastPointerRef.current.y * window.innerHeight
    );
  }, [applyViewportTransform, resetTransform]);

  const handleWindowMouseMove = useCallback(
    (e: MouseEvent) => {
      lastPointerRef.current = {
        x: Math.min(1, Math.max(0, e.clientX / window.innerWidth)),
        y: Math.min(1, Math.max(0, e.clientY / window.innerHeight)),
        insideViewport: true,
      };

      if (transform.isHovered && !trackOnWindow) {
        return;
      }

      applyViewportTransform(e.clientX, e.clientY);
    },
    [applyViewportTransform, trackOnWindow, transform.isHovered]
  );

  const handleWindowMouseLeave = useCallback(() => {
    lastPointerRef.current.insideViewport = false;
    resetTransform();
  }, [resetTransform]);

  useEffect(() => {
    window.addEventListener("mousemove", handleWindowMouseMove);
    window.addEventListener("mouseleave", handleWindowMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleWindowMouseMove);
      window.removeEventListener("mouseleave", handleWindowMouseLeave);
    };
  }, [handleWindowMouseLeave, handleWindowMouseMove]);

  const cardStyle: CSSProperties = {
    transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale3d(1, 1, 1)`,
    boxShadow: enableShadow
      ? `${transform.shadowX}px ${transform.shadowY}px ${shadowBlur}px rgba(0, 0, 0, 0.4)`
      : "none",
    transition: `transform ${transitionDuration} cubic-bezier(0.23, 1, 0.32, 1), box-shadow ${transitionDuration} cubic-bezier(0.23, 1, 0.32, 1)`,
    transformStyle: "preserve-3d",
  };

  const backgroundStyle = backgroundImage
    ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: transform.isHovered ? 1 : 0,
        transition: `opacity 0.5s ease-in-out`,
      }
    : {};

  const glowStyle = enableGlow
    ? {
        background: `radial-gradient(circle at ${transform.glowX}% ${transform.glowY}%, rgba(255, 255, 255, ${glowOpacity}), transparent)`,
        opacity: transform.isHovered ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
      }
    : {};

  const contentStyle: CSSProperties = enableParallax
    ? {
        transform: `translateZ(${parallaxOffset}px)`,
        transformStyle: "preserve-3d",
      }
    : {};

  return (
    <div
      style={{ perspective: "1000px", padding: hoverPadding }}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        id={innerId}
        style={cardStyle}
        className="relative bg-gray-800 rounded-2xl overflow-hidden"
        role="img"
        tabIndex={0}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        {backgroundImage && (
          <div
            className="absolute inset-0 rounded-2xl"
            style={backgroundStyle}
            aria-hidden="true"
          />
        )}

        <div
          className="absolute inset-0 border-2 border-white/10 rounded-2xl pointer-events-none"
          aria-hidden="true"
        />

        {enableGlow && (
          <div
            className="absolute inset-0 z-0 rounded-2xl pointer-events-none"
            style={glowStyle}
            aria-hidden="true"
          />
        )}

        <div style={contentStyle} className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ThreeDCard;
