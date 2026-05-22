// portfolio-builder/components/sections/hero/HeroRenderer.tsx

"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { HeroData } from "@/portfolio-builder/types/hero";
import type { HeroAnimations } from "@/portfolio-builder/types/hero";
import { MeshBackground } from "./renderer-components/MeshBackground";
import { ParticlesBackground } from "./renderer-components/ParticlesBackground";
import { AnimatedText } from "./renderer-components/AnimatedText";
import { MediaDisplay } from "./renderer-components/MediaDisplay";
import { CTAButtons } from "./renderer-components/CTAButtons";
import { ScrollIndicator } from "./renderer-components/ScrollIndicator";
import { MotionContainer, MotionItem } from "./renderer-components/MotionWrappers";
import { getBackgroundStyle } from "./renderer-components/backgroundUtils";
import { resolveEasing } from "./renderer-components/animations";
import SocialLinks from "./renderer-components/SocialLinks";
import { useTypewriter } from "./renderer-components/useTypewriter";
import { loadGoogleFont } from "./editor-components/fonts";

interface HeroRendererProps {
    data: HeroData;
}

export default function HeroRenderer({ data }: HeroRendererProps) {
    const {
        layout = "centered",
        height = "screen",
        alignment = "center",
        verticalAlignment = "center",
        mediaPosition = "right",
        padding,
        name,
        greeting,
        title,
        media,
        ctaButtons,
        background,
        effects,
        animations,
    } = data;

    const anim: HeroAnimations = {
        preset: "fadeIn",
        duration: 0.6,
        delay: 0.1,
        easing: "easeOut",
        staggerChildren: true,
        staggerDelay: 0.12,
        scrollTrigger: false,
        scrollOnce: true,
        parallax: false,
        parallaxIntensity: 20,
        hoverEffect: "none",
        hoverScale: 1.03,
        textReveal: false,
        textRevealDelay: 0.2,
        ...animations,
    };

    const { displayed: typewriterName, isDone: typewriterDone } = useTypewriter({
        text: name ?? "",
        speed: effects?.typewriterSpeed ?? 50,
        enabled: !!(effects?.typewriter && name),
        delay: ((anim.delay ?? 0.1) + (anim.staggerChildren ? (anim.staggerDelay ?? 0.12) : 0)) * 1000,
    });

    const fonts = data.fonts ?? {};
    const typography = data.typography ?? {};

    // Track which fonts are actually ready to render
    const [readyFonts, setReadyFonts] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fontsToLoad = [
            { key: "greeting", family: fonts.greeting },
            { key: "name", family: fonts.name },
            { key: "title", family: fonts.title },
        ].filter((f): f is { key: string; family: string } => !!f.family);

        if (fontsToLoad.length === 0) return;

        fontsToLoad.forEach(({ family }) => {
            loadGoogleFont(family).then(() => {
                setReadyFonts((prev) => {
                    if (prev.has(family)) return prev; // no-op if already added
                    const next = new Set(prev);
                    next.add(family);
                    return next;
                });
            });
        });
    }, [fonts.greeting, fonts.name, fonts.title]);
    const isAnimated = anim.preset !== "none";

    // ── Refs & hooks ─────────────────────────────────────────────────────────
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, {
        once: anim.scrollOnce,
        amount: 0.2,
    });

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    const parallaxY = useTransform(
        scrollYProgress,
        [0, 1],
        [0, -(anim.parallaxIntensity ?? 20)]
    );
    const parallaxYSlow = useTransform(
        scrollYProgress,
        [0, 1],
        [0, -(anim.parallaxIntensity ?? 20) * 0.5]
    );

    const shouldAnimate = isAnimated
        ? anim.scrollTrigger
            ? isInView
            : true
        : false;

    // ── Height ───────────────────────────────────────────────────────────────
    const heightClass =
        height === "auto" ? "" :
            height === "min-screen" ? "min-h-screen" :
                "h-screen";

    // ── Vertical alignment ───────────────────────────────────────────────────
    const verticalAlignClass =
        verticalAlignment === "top" ? "items-start" :
            verticalAlignment === "bottom" ? "items-end" :
                "items-center";

    // ── Padding ──────────────────────────────────────────────────────────────
    // height="auto" uses py-20 baseline; custom padding overrides it entirely.
    const paddingStyle: React.CSSProperties =
        height === "auto" && !padding?.top && !padding?.bottom
            ? {} // let heightClass py-20 handle spacing
            : {
                paddingTop: padding?.top != null ? `${padding.top}px` : height === "auto" ? "5rem" : undefined,
                paddingBottom: padding?.bottom != null ? `${padding.bottom}px` : height === "auto" ? "7rem" : undefined,
            };

    // ── Background ───────────────────────────────────────────────────────────
    const bgStyle = getBackgroundStyle(background);

    // ── Alignment ────────────────────────────────────────────────────────────
    const alignClass =
        alignment === "left" ? "text-left items-start" : "text-center items-center";

    // Tailwind class for horizontal justify on the section itself
    const justifyClass = layout !== "split" ? "justify-center" : "";

    // Helper: build complete style object for a text field
    const getTextStyle = (fontKey: "greeting" | "name" | "title") => {
        const fieldTypography = typography[fontKey];
        const family = fonts[fontKey];

        const style: React.CSSProperties = {};

        // Font family (only if loaded)
        if (family && readyFonts.has(family)) {
            style.fontFamily = family;
        }

        // Typography overrides
        if (fieldTypography) {
            if (fieldTypography.size !== undefined) style.fontSize = `${fieldTypography.size}px`;
            if (fieldTypography.weight !== undefined) style.fontWeight = fieldTypography.weight;
            if (fieldTypography.lineHeight !== undefined) style.lineHeight = fieldTypography.lineHeight;
            if (fieldTypography.letterSpacing !== undefined) style.letterSpacing = `${fieldTypography.letterSpacing}px`;
            if (fieldTypography.transform !== undefined) style.textTransform = fieldTypography.transform;
        }

        return style;
    };

    // ── Common text content ──────────────────────────────────────────────────
    const textContent = (
        <>
            {greeting && (
                anim.textReveal ? (
                    <AnimatedText delay={anim.textRevealDelay} className="mb-4" shouldAnimate={shouldAnimate}>
                        <p
                            className="text-sm md:text-base font-mono text-neutral-400"
                            style={getTextStyle("greeting")}
                        >
                            {greeting}
                        </p>
                    </AnimatedText>
                ) : (
                    <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                        <p
                            className="text-sm md:text-base font-mono text-neutral-400 mb-4"
                            style={getTextStyle("greeting")}
                        >
                            {greeting}
                        </p>
                    </MotionItem>
                )
            )}

            {name && (
                anim.textReveal ? (
                    <AnimatedText delay={(anim.textRevealDelay ?? 0.2) + 0.1} className="mb-4" shouldAnimate={shouldAnimate}>
                        <h1
                            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white"
                            style={getTextStyle("name")}
                        >
                            {effects?.typewriter ? typewriterName : name}
                            {effects?.typewriter && !typewriterDone && (
                                <span className="inline-block w-[3px] h-[0.85em] bg-white ml-1 align-middle animate-pulse" />
                            )}
                        </h1>
                    </AnimatedText>
                ) : (
                    <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                        <h1
                            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4"
                            style={getTextStyle("name")}
                        >
                            {effects?.typewriter ? typewriterName : name}
                            {effects?.typewriter && !typewriterDone && (
                                <span className="inline-block w-[3px] h-[0.85em] bg-white ml-1 align-middle animate-pulse" />
                            )}
                        </h1>
                    </MotionItem>
                )
            )}

            {title && (
                anim.textReveal ? (
                    <AnimatedText delay={(anim.textRevealDelay ?? 0.2) + 0.2} shouldAnimate={shouldAnimate}>
                        <p
                            className="text-lg md:text-xl text-neutral-300"
                            style={getTextStyle("title")}
                        >
                            {title}
                        </p>
                    </AnimatedText>
                ) : (
                    <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                        <p
                            className="text-lg md:text-xl text-neutral-300"
                            style={getTextStyle("title")}
                        >
                            {title}
                        </p>
                    </MotionItem>
                )
            )}

            {ctaButtons && ctaButtons.length > 0 && (
                <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                    <CTAButtons buttons={ctaButtons} className="mt-8" alignment={alignment} />
                </MotionItem>
            )}

            {data.socialLinks && data.socialLinks.length > 0 && (
                <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim} className="w-fit">
                    <SocialLinks
                        links={data.socialLinks}
                        alignment={alignment}
                        className="mt-6"
                        isAnimated={isAnimated}
                        shouldAnimate={shouldAnimate}
                        anim={anim}
                    />
                </MotionItem>
            )}
        </>
    );

    // ── RENDER ───────────────────────────────────────────────────────────────
    return (
        <section
            ref={sectionRef}
            className={`relative flex overflow-hidden ${heightClass} ${verticalAlignClass} ${justifyClass}`}
            style={{ ...bgStyle, ...paddingStyle }}
        >
            {/* Background Layers */}

            {/* Shared overlay — image, video, mesh (particles handles its own overlay on canvas) */}
            {(() => {
                const overlayTypes = ["image", "video", "mesh"];
                const opacity = background?.overlayOpacity ?? 0;
                if (!background || !overlayTypes.includes(background.type) || opacity <= 0) return null;
                return (
                    <div
                        className="absolute inset-0 z-[1] pointer-events-none"
                        style={{
                            backgroundColor: background.overlayColor || "#000000",
                            opacity: opacity / 100,
                        }}
                    />
                );
            })()}

            {background?.type === "mesh" && (
                <MeshBackground
                    color1={background.meshColor1 || "#7c3aed"}
                    color2={background.meshColor2 || "#2563eb"}
                    color3={background.meshColor3 || "#0891b2"}
                    color4={background.meshColor4 || "#0a0a0a"}
                    speed={background.meshSpeed ?? 6}
                    blur={background.meshBlur ?? 80}
                    size={background.meshSize ?? 60}
                    base={background.meshBase || "#050510"}
                    opacity={background.meshOpacity ?? 1}
                />
            )}

            {background?.type === "particles" && (
                <ParticlesBackground
                    color={background.particleColor || "#ffffff"}
                    count={background.particleCount ?? 80}
                    size={background.particleSize ?? 2}
                    speed={background.particleSpeed ?? 0.5}
                    opacity={background.particleOpacity ?? 0.6}
                    lines={background.particleLines ?? true}
                    lineDist={background.particleLineDist ?? 120}
                    bgColor={background.particleBg || "#050510"}
                    overlayColor={background.overlayColor || "#000000"}
                    overlayOpacity={background.overlayOpacity ?? 0}
                />
            )}

            {background?.type === "video" && background.videoUrl && (
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    style={{ objectPosition: background.backgroundPosition ?? "center" }}
                    src={background.videoUrl}
                />
            )}

            {/* Centered Layout */}
            {layout === "centered" && (
                <MotionContainer
                    isAnimated={isAnimated}
                    shouldAnimate={shouldAnimate}
                    anim={anim}
                    parallax={anim.parallax}
                    parallaxY={parallaxY}
                    className={`relative z-10 flex flex-col w-full ${alignment === "left" ? "items-start" : "items-center"}`}
                >
                    {media && media.type !== "none" && (
                        <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                            <MediaDisplay media={media} size="md" className="mb-8" />
                        </MotionItem>
                    )}

                    <div className={`max-w-4xl mx-auto px-6 flex flex-col ${alignClass}`}>{textContent}</div>
                </MotionContainer>
            )}

            {/* Split Layout */}
            {layout === "split" && (
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-6 w-full">
                    {/* Text column — order-2 when media is on the left */}
                    <MotionContainer
                        isAnimated={isAnimated}
                        shouldAnimate={shouldAnimate}
                        anim={anim}
                        parallax={anim.parallax}
                        parallaxY={parallaxY}
                        className={mediaPosition === "left" ? "md:order-2" : undefined}
                    >
                        {textContent}
                    </MotionContainer>

                    {/* Media column — order-1 when media is on the left */}
                    <motion.div
                        className={`flex justify-center ${mediaPosition === "left" ? "md:order-1" : ""}`}
                        style={anim.parallax ? { y: parallaxYSlow } : undefined}
                        initial={isAnimated ? { opacity: 0, x: mediaPosition === "left" ? -40 : 40 } : false}
                        animate={
                            shouldAnimate
                                ? { opacity: 1, x: 0 }
                                : { opacity: 0, x: mediaPosition === "left" ? -40 : 40 }
                        }
                        transition={{
                            duration: anim.duration ?? 0.6,
                            delay:
                                (anim.delay ?? 0.1) +
                                (anim.staggerChildren ? (anim.staggerDelay ?? 0.12) * 4 : 0),
                            ease: resolveEasing(anim.easing ?? "easeOut") as any,
                        }}
                    >
                        <MediaDisplay media={media} size="lg" />
                    </motion.div>
                </div>
            )}

            {/* Minimal Layout */}
            {layout === "minimal" && (
                <MotionContainer
                    isAnimated={isAnimated}
                    shouldAnimate={shouldAnimate}
                    anim={anim}
                    parallax={anim.parallax}
                    parallaxY={parallaxY}
                    className={`relative z-10 max-w-3xl mx-auto px-6 flex flex-col ${alignClass}`}
                >
                    {textContent}
                </MotionContainer>
            )}

            {/* Scroll Indicator */}
            {effects?.scrollIndicator && <ScrollIndicator />}
        </section>
    );
}