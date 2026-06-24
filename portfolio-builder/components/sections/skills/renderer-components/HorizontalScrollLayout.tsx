// portfolio-builder/components/sections/skills/renderer-components/HorizontalScrollLayout.tsx
import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import SkillCard from "./SkillCard";
import { resolveCardOverride } from "./resolveCardOverride";
import type { LayoutProps } from "./layoutProps";

const CARD_WIDTH = { small: "200px", medium: "260px", large: "320px" } as const;
const GAP_SIZE = { small: "12px", medium: "16px", large: "24px" } as const;

const MANUAL_SCROLL_STEP = 300;
const SCROLL_SPEED = 0.05;
const MIN_CARDS_FOR_AUTOPLAY = 3; // Minimum cards required for auto-scroll

export default function HorizontalScrollLayout({
    skills,
    data,
    isAnimated,
    shouldAnimate,
    anim,
}: LayoutProps) {
    const cardW = CARD_WIDTH[data.cardSize];
    const gap = GAP_SIZE[data.gap];

    const defaults = {
        style: data.cardStyle,
        showLogo: data.showLogo,
        showDescription: data.showDescription,
        showProficiency: data.showProficiency,
        showDifficulty: data.showDifficulty,
        showCategory: data.showCategory,
        proficiencyDisplay: data.proficiencyDisplay,
        difficultyDisplay: data.difficultyDisplay,
    } as const;

    const scrollRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const velocityRef = useRef(0);
    const lastTimestampRef = useRef<number | null>(null);

    const [isPlaying, setIsPlaying] = useState(false); // Changed to false initially
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [canAutoPlay, setCanAutoPlay] = useState(false); // New state to track if we can auto-play

    // ── Check if auto-play is possible (more than MIN_CARDS_FOR_AUTOPLAY visible) ──
    const checkAutoPlayEligibility = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return false;

        // Get the width of a single card + gap
        const cardWidthPx = el.querySelector('[class*="shrink-0"]')?.clientWidth || 0;

        if (cardWidthPx === 0) return false;

        // Calculate how many full cards can fit in the visible area
        const visibleCards = Math.floor(el.clientWidth / cardWidthPx);

        const eligible = skills.length > MIN_CARDS_FOR_AUTOPLAY && visibleCards < skills.length;
        setCanAutoPlay(eligible);
        return eligible;
    }, [skills.length]);

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
        checkAutoPlayEligibility(); // Check on mount
        el.addEventListener("scroll", updateArrows, { passive: true });
        const ro = new ResizeObserver(() => {
            updateArrows();
            checkAutoPlayEligibility(); // Recheck on resize
        });
        ro.observe(el);
        return () => {
            el.removeEventListener("scroll", updateArrows);
            ro.disconnect();
        };
    }, [updateArrows, checkAutoPlayEligibility]);

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
        // Only start if auto-play is allowed
        if (!canAutoPlay) return;

        stopAnim();
        setIsPlaying(true);
        const timeoutId = setTimeout(() => {
            animate();
        }, 50);
        return () => clearTimeout(timeoutId);
    }, [stopAnim, animate, canAutoPlay]);

    const pauseAnim = useCallback(() => {
        stopAnim();
        setIsPlaying(false);
    }, [stopAnim]);

    useEffect(() => () => stopAnim(), [stopAnim]);

    // ── Auto-start animation on mount (only if eligible) ──────────────────────
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        // Wait for layout to settle, then check eligibility
        const timeoutId = setTimeout(() => {
            if (checkAutoPlayEligibility()) {
                animate();
                setIsPlaying(true);
            }
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [animate, checkAutoPlayEligibility]);

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
        cursor: canAutoPlay ? "pointer" : "not-allowed", // Disable if can't auto-play
        opacity: canAutoPlay ? 1 : 0.3, // Dim if can't auto-play
        transition: "background 150ms, color 150ms, border-color 150ms, transform 150ms",
        backdropFilter: "blur(8px)",
        flexShrink: 0,
    };

    // Only duplicate if there are enough skills to warrant it
    const shouldDuplicate = skills.length > MIN_CARDS_FOR_AUTOPLAY;
    const duplicatedSkills = shouldDuplicate ? [...skills, ...skills] : skills;

    return (
        <div className="relative select-none w-full">
            {/* ── Scroll track ─────────────────────────────────────────── */}
            <div
                ref={scrollRef}
                className="overflow-x-auto pb-2 hide-scrollbar custom-scrollbar"
                style={{ WebkitOverflowScrolling: "touch" }}
            >
                <div
                    className="flex"
                    style={{ gap }}
                >
                    {duplicatedSkills.map((skill, index) => (
                        <div
                            key={`${skill.id || index}-${index < skills.length ? 'first' : 'second'}`}
                            className="shrink-0 flex flex-col"
                            style={{ width: cardW }}
                        >
                            <MotionItem
                                isAnimated={isAnimated}
                                shouldAnimate={shouldAnimate}
                                anim={anim}
                            >
                                <div className="h-full">
                                    <SkillCard
                                        skill={skill}
                                        config={resolveCardOverride(skill, data.cardOverrides, defaults)}
                                        cardSize={data.cardSize}
                                        fullWidth={true}
                                    />
                                </div>
                            </MotionItem>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Controls row ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between mt-3 px-1">
                {/* Left group: Play/Pause - only show if auto-play is possible */}
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

                {/* Right group: Left + Right chevrons */}
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