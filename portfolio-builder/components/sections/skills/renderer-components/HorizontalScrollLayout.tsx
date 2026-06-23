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

    const [isPlaying, setIsPlaying] = useState(true);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

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
        return () => { el.removeEventListener("scroll", updateArrows); ro.disconnect(); };
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
                // Read fresh on every frame so stale closures can't cause
                // early/late resets if layout settles after animate() is called
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

    const duplicatedSkills = [...skills, ...skills];

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