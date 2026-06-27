// portfolio-builder/components/sections/testimonials/renderer-components/MarqueeLayout.tsx

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import TestimonialCard from "./TestimonialCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const CARD_WIDTH = { small: "320px", medium: "380px", large: "440px" } as const;
const GAP_SIZE = { small: "16px", medium: "20px", large: "28px" } as const;

const MANUAL_SCROLL_STEP = 340;
const SCROLL_SPEED = 0.05;
const MIN_CARDS_FOR_AUTOPLAY = 3;

export default function MarqueeLayout({
  testimonials,
  data,
  isAnimated,
  shouldAnimate,
  anim,
}: LayoutProps) {
  const cardW = CARD_WIDTH[data.cardSize];
  const gap = GAP_SIZE[data.gap];

  const defaults = {
    style: data.cardStyle,
    showAvatar: data.showAvatar,
    avatarDisplay: data.avatarDisplay,
    showAuthorName: data.showAuthorName,
    showAuthorTitle: data.showAuthorTitle,
    showAuthorCompany: data.showAuthorCompany,
    showAuthorRelationship: data.showAuthorRelationship,
    showContent: data.showContent,
    showRating: data.showRating,
    ratingDisplay: data.ratingDisplay,
    showDate: data.showDate,
    dateDisplay: data.dateDisplay,
    showFeaturedBadge: data.showFeaturedBadge,
  } as const;

  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [canAutoPlay, setCanAutoPlay] = useState(false);

  const checkAutoPlayEligibility = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return false;
    const cardWidthPx = el.querySelector('[class*="shrink-0"]')?.clientWidth || 0;
    if (cardWidthPx === 0) return false;
    const visibleCards = Math.floor(el.clientWidth / cardWidthPx);
    const eligible = testimonials.length > MIN_CARDS_FOR_AUTOPLAY && visibleCards < testimonials.length;
    setCanAutoPlay(eligible);
    return eligible;
  }, [testimonials.length]);

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
        el.scrollLeft += SCROLL_SPEED * delta;

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

    rafRef.current = requestAnimationFrame(step);
  }, []);

  const startAnim = useCallback(() => {
    if (!canAutoPlay) return;
    stopAnim();
    setIsPlaying(true);
    setTimeout(() => animate(), 50);
  }, [stopAnim, animate, canAutoPlay]);

  const pauseAnim = useCallback(() => {
    stopAnim();
    setIsPlaying(false);
  }, [stopAnim]);

  useEffect(() => () => stopAnim(), [stopAnim]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const timeoutId = setTimeout(() => {
      if (checkAutoPlayEligibility()) {
        animate();
        setIsPlaying(true);
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [animate, checkAutoPlayEligibility]);

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
    cursor: canAutoPlay ? "pointer" : "not-allowed",
    opacity: canAutoPlay ? 1 : 0.3,
    transition: "background 150ms, color 150ms, border-color 150ms, transform 150ms",
    backdropFilter: "blur(8px)",
    flexShrink: 0,
  };

  const shouldDuplicate = testimonials.length > MIN_CARDS_FOR_AUTOPLAY;
  const duplicatedTestimonials = shouldDuplicate ? [...testimonials, ...testimonials] : testimonials;

  return (
    <div className="relative select-none w-full">
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-2 hide-scrollbar custom-scrollbar"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex" style={{ gap }}>
          {duplicatedTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.id || index}-${index < testimonials.length ? 'first' : 'second'}`}
              className="shrink-0 flex flex-col"
              style={{ width: cardW }}
            >
              <MotionItem
                isAnimated={isAnimated}
                shouldAnimate={shouldAnimate}
                anim={anim}
              >
                <div className="h-full">
                  <TestimonialCard
                    testimonial={testimonial}
                    config={resolveCardOverride(testimonial, data.cardOverrides, defaults)}
                    cardSize={data.cardSize}
                    fullWidth={true}
                  />
                </div>
              </MotionItem>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 px-1">
        {canAutoPlay && (
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
        )}

        <div className={`flex items-center gap-2 ${!canAutoPlay ? 'ml-auto' : ''}`}>
          <button
            aria-label="Scroll left"
            onClick={() => manualScroll("left")}
            style={chevronStyle(true)}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--pb-surface-hover)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--pb-text-primary)";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
            }}
            onMouseLeave={e => {
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
            style={chevronStyle(true)}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--pb-surface-hover)";
              (e.currentTarget as HTMLButtonElement).style.color = "var(--pb-text-primary)";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
            }}
            onMouseLeave={e => {
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
