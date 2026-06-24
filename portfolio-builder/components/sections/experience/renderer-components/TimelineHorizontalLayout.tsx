// portfolio-builder/components/sections/experience/renderer-components/TimelineHorizontalLayout.tsx

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import ExperienceCard from "./ExperienceCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const CARD_WIDTH = { small: "280px", medium: "340px", large: "400px" } as const;
const GAP_SIZE = { small: "16px", medium: "24px", large: "32px" } as const;
const CARD_HEIGHT = { small: "160px", medium: "200px", large: "240px" } as const;

const MANUAL_SCROLL_STEP = 340;
const SCROLL_SPEED = 0.05;

export default function TimelineHorizontalLayout({
  experiences,
  data,
  isAnimated,
  shouldAnimate,
  anim,
}: LayoutProps) {
  const cardW = CARD_WIDTH[data.cardSize];
  const cardH = CARD_HEIGHT[data.cardSize];
  const gap = GAP_SIZE[data.gap];

  const defaults = {
    style: data.cardStyle,
    showCompanyLogo: data.showCompanyLogo,
    showDescription: data.showDescription,
    showEmploymentType: data.showEmploymentType,
    showLocationType: data.showLocationType,
    showDuration: data.showDuration,
    showSkills: data.showSkills,
    showCompanyName: data.showCompanyName,
    showJobTitle: data.showJobTitle,
    dateDisplayFormat: data.dateDisplayFormat,
  } as const;

  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const velocityRef = useRef(0);
  const lastTimestampRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Duplicate experiences for seamless loop
  const duplicatedExperiences = useMemo(() => [...experiences, ...experiences], [experiences]);

  // ── Arrow visibility ──────────────────────────────────────────────────────
  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows]);

  // ── Continuous loop animation ─────────────────────────────────────────────
  const stopAnim = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTimestampRef.current = null;
  }, []);

  const animate = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const step = (timestamp: number) => {
      const el = scrollRef.current;
      if (!el) return;

      if (lastTimestampRef.current !== null) {
        const delta = timestamp - lastTimestampRef.current;
        const halfWidth = el.scrollWidth / 2;

        el.scrollLeft += velocityRef.current * delta;

        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
        if (el.scrollLeft < 0) {
          el.scrollLeft += halfWidth;
        }
      }

      lastTimestampRef.current = timestamp;
      rafRef.current = requestAnimationFrame(step);
    };

    velocityRef.current = SCROLL_SPEED;
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const startAnim = useCallback(() => {
    stopAnim();
    setIsPlaying(true);
    const timeoutId = setTimeout(() => {
      animate();
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [stopAnim, animate]);

  const pauseAnim = useCallback(() => {
    stopAnim();
    setIsPlaying(false);
  }, [stopAnim]);

  useEffect(() => () => stopAnim(), [stopAnim]);

  // ── Auto-start animation on mount ─────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const timeoutId = setTimeout(() => {
      if (el.scrollWidth <= el.clientWidth * 2) return;
      animate();
      setIsPlaying(true);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [animate]);

  // ── Manual scroll (cancels auto-scroll) ───────────────────────────────────
  const manualScroll = useCallback((direction: "left" | "right") => {
    if (isPlaying) {
      stopAnim();
      setIsPlaying(false);
    }
    const el = scrollRef.current;
    if (!el) return;

    const halfWidth = el.scrollWidth / 2;
    const newScrollLeft = direction === "right"
      ? el.scrollLeft + MANUAL_SCROLL_STEP
      : el.scrollLeft - MANUAL_SCROLL_STEP;

    if (newScrollLeft >= halfWidth) {
      el.scrollLeft = newScrollLeft - halfWidth;
    } else if (newScrollLeft < 0) {
      el.scrollLeft = halfWidth + newScrollLeft;
    } else {
      el.scrollBy({
        left: direction === "right" ? MANUAL_SCROLL_STEP : -MANUAL_SCROLL_STEP,
        behavior: "smooth",
      });
    }
  }, [isPlaying, stopAnim]);

  // ── Shared button base styles ─────────────────────────────────────────────
  const chevronStyle = (enabled: boolean): React.CSSProperties => ({
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    border: "1px solid var(--pb-border-hover)",
    background: "var(--pb-surface-elevated)",
    color: "var(--pb-text-secondary)",
    cursor: enabled ? "pointer" : "not-allowed",
    opacity: enabled ? 1 : 0.3,
    transition: "background 150ms, color 150ms, opacity 150ms, transform 150ms",
    backdropFilter: "blur(8px)",
    flexShrink: 0,
  });

  const playPauseStyle: React.CSSProperties = {
    width: 28,
    height: 28,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    border: isPlaying
      ? "1px solid var(--pb-accent-30)"
      : "1px solid var(--pb-border-hover)",
    background: isPlaying
      ? "var(--pb-accent-10)"
      : "var(--pb-surface-elevated)",
    color: isPlaying
      ? "var(--pb-accent)"
      : "var(--pb-text-secondary)",
    cursor: "pointer",
    transition: "background 150ms, color 150ms, border-color 150ms, transform 150ms",
    backdropFilter: "blur(8px)",
    flexShrink: 0,
  };

  return (
    <div className="relative select-none w-full">
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-4 hide-scrollbar custom-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {/* Spine container */}
        <div
          className="relative inline-flex flex-col min-w-full"
          style={{ "--card-h": cardH } as React.CSSProperties}
        >
          {/* Spine line - using a div that spans full width with min-w-full on parent */}
          <div
            className="absolute left-0 w-full h-px bg-[var(--pb-border)] z-0 pointer-events-none"
            style={{ top: `calc(${cardH} + 8px)` }}
          />

          <div className="flex" style={{ gap }}>
            {duplicatedExperiences.map((exp, index) => {
              const isAbove = index % 2 === 0;
              const card = (
                <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                  <ExperienceCard
                    experience={exp}
                    config={resolveCardOverride(exp, data.cardOverrides, defaults)}
                    cardSize={data.cardSize}
                    fullWidth={true}
                  />
                </MotionItem>
              );

              return (
                <div
                  key={`${exp.id || index}-${index < experiences.length ? 'first' : 'second'}`}
                  className="shrink-0 flex flex-col"
                  style={{ width: cardW }}
                >
                  {/* Above slot */}
                  <div
                    className="flex flex-col justify-end pb-3"
                    style={{ height: cardH }}
                  >
                    {isAbove && card}
                  </div>

                  {/* Node — sits over the spine line */}
                  <div className="flex justify-center items-center shrink-0 z-10 relative" style={{ height: "16px" }}>
                    <div
                      className={`w-3 h-3 rounded-full border-2 border-[var(--pb-background)] ${exp.is_current ? "bg-[var(--pb-success)]" : "bg-[var(--pb-foreground)]"
                        }`}
                    />
                  </div>

                  {/* Below slot */}
                  <div
                    className="flex flex-col justify-start pt-3"
                    style={{ height: cardH }}
                  >
                    {!isAbove && card}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-3 px-1">
        {/* Left group: Play/Pause */}
        <button
          aria-label={isPlaying ? "Pause auto-scroll" : "Start auto-scroll"}
          onClick={() => isPlaying ? pauseAnim() : startAnim()}
          style={playPauseStyle}
          onMouseEnter={e => {
            if (isPlaying) {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--pb-accent-20)";
            } else {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--pb-surface-hover)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--pb-text-primary)";
            }
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = isPlaying
              ? "var(--pb-accent-10)"
              : "var(--pb-surface-elevated)";
            (e.currentTarget as HTMLButtonElement).style.color = isPlaying
              ? "var(--pb-accent)"
              : "var(--pb-text-secondary)";
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
          }}
        >
          {isPlaying
            ? <Pause size={13} style={{ fill: "currentColor" }} />
            : <Play size={13} style={{ fill: "currentColor", transform: "translateX(1px)" }} />
          }
        </button>

        {/* Right group: Left + Right chevrons */}
        <div className="flex items-center gap-2">
          <button
            aria-label="Scroll left"
            onClick={() => manualScroll("left")}
            style={chevronStyle(canScrollLeft)}
            onMouseEnter={(e) => {
              if (canScrollLeft) {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--pb-surface-hover)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--pb-text-primary)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--pb-surface-elevated)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--pb-text-secondary)";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            <ChevronLeft size={14} />
          </button>

          <button
            aria-label="Scroll right"
            onClick={() => manualScroll("right")}
            style={chevronStyle(canScrollRight)}
            onMouseEnter={(e) => {
              if (canScrollRight) {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--pb-surface-hover)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--pb-text-primary)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--pb-surface-elevated)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--pb-text-secondary)";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}