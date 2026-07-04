// portfolio-builder/components/sections/hero/HeroRenderer.tsx

"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { HeroData } from "@/portfolio-builder/types/hero";
import type { HeroAnimations } from "@/portfolio-builder/types/hero";
import { AnimatedText } from "./renderer-components/AnimatedText";
import { MediaDisplay } from "./renderer-components/MediaDisplay";
import { CTAButtons } from "./renderer-components/CTAButtons";
import { ScrollIndicator } from "./renderer-components/ScrollIndicator";
import { MotionContainer, MotionItem } from "./renderer-components/MotionWrappers";
import { resolveEasing } from "./renderer-components/animations";
import SocialLinks from "./renderer-components/SocialLinks";
import { useTypewriter } from "./renderer-components/useTypewriter";
import { loadGoogleFont } from "./editor-components/fonts";
import { ResolvedTheme } from "@/portfolio-builder/hooks/usePortfolioTheme";
import { SectionBackgroundRenderer } from "@/portfolio-builder/components/shared/background/renderer/SectionBackground";

interface HeroRendererProps {
    data: HeroData;
    theme: ResolvedTheme;
}

export default function HeroRenderer({ data, theme }: HeroRendererProps) {
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
                    if (prev.has(family)) return prev;
                    const next = new Set(prev);
                    next.add(family);
                    return next;
                });
            });
        });
    }, [fonts.greeting, fonts.name, fonts.title]);

    const isAnimated = anim.preset !== "none";

    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, {
        once: anim.scrollTrigger ? anim.scrollOnce : false,
        amount: 0.2,
    });

    const animKey = `${anim.preset}-${anim.duration}-${anim.delay}-${anim.easing}-${anim.staggerChildren}-${anim.staggerDelay}`;

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

    const heightClass =
        height === "auto" ? "" :
            height === "min-screen" ? "min-h-screen" :
                "h-screen";

    const verticalAlignClass =
        verticalAlignment === "top" ? "items-start" :
            verticalAlignment === "bottom" ? "items-end" :
                "items-center";

    const paddingStyle: React.CSSProperties =
        height === "auto" && !padding?.top && !padding?.bottom
            ? {}
            : {
                paddingTop: padding?.top != null ? `${padding.top}px` : height === "auto" ? "5rem" : undefined,
                paddingBottom: padding?.bottom != null ? `${padding.bottom}px` : height === "auto" ? "7rem" : undefined,
            };

    const alignClass =
        alignment === "left" ? "text-left items-start" :
            alignment === "right" ? "text-right items-end" :
                "text-center items-center";

    const justifyClass = layout !== "split" ? "justify-center" : "";

    const getTextStyle = (fontKey: "greeting" | "name" | "title") => {
        const fieldTypography = typography[fontKey];
        const family = fonts[fontKey];

        const style: React.CSSProperties = {};

        if (family && readyFonts.has(family)) {
            style.fontFamily = family;
        }

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
                <React.Fragment key={`${animKey}-greeting`}>
                    {anim.textReveal ? (
                        <AnimatedText delay={anim.textRevealDelay} className="mb-4" shouldAnimate={shouldAnimate} anim={anim}>
                            <p
                                className="text-sm md:text-base font-mono text-[var(--pb-foreground-60)]"
                                style={getTextStyle("greeting")}
                            >
                                {greeting}
                            </p>
                        </AnimatedText>
                    ) : (
                        <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                            <p
                                className="text-sm md:text-base font-mono text-[var(--pb-foreground-60)] mb-4"
                                style={getTextStyle("greeting")}
                            >
                                {`${greeting}`}
                            </p>
                        </MotionItem>
                    )}
                </React.Fragment>
            )}

            {name && (
                <React.Fragment key={`${animKey}-name`}>
                    {anim.textReveal ? (
                        <AnimatedText delay={(anim.textRevealDelay ?? 0.2) + 0.1} className="mb-4" shouldAnimate={shouldAnimate} anim={anim}>
                            <h1
                                className="text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--pb-foreground)]"
                                style={getTextStyle("name")}
                            >
                                {`${effects?.typewriter ? typewriterName : name}`}
                                {effects?.typewriter && !typewriterDone && (
                                    <span className="inline-block w-[3px] h-[0.85em] bg-[var(--pb-foreground)] ml-1 align-middle animate-pulse" />
                                )}
                            </h1>
                        </AnimatedText>
                    ) : (
                        <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                            <h1
                                className="text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--pb-foreground)] mb-4"
                                style={getTextStyle("name")}
                            >
                                {effects?.typewriter ? typewriterName : name}
                                {effects?.typewriter && !typewriterDone && (
                                    <span className="inline-block w-[3px] h-[0.85em] bg-[var(--pb-foreground)] ml-1 align-middle animate-pulse" />
                                )}
                            </h1>
                        </MotionItem>
                    )}
                </React.Fragment>
            )}

            {title && (
                <React.Fragment key={`${animKey}-title`}>
                    {anim.textReveal ? (
                        <AnimatedText delay={(anim.textRevealDelay ?? 0.2) + 0.2} shouldAnimate={shouldAnimate} anim={anim}>
                            <p
                                className="text-lg md:text-xl text-[var(--pb-foreground-80)]"
                                style={getTextStyle("title")}
                            >
                                {`${title}`}
                            </p>
                        </AnimatedText>
                    ) : (
                        <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                            <p
                                className="text-lg md:text-xl text-[var(--pb-foreground-80)]"
                                style={getTextStyle("title")}
                            >
                                {`${title}`}
                            </p>
                        </MotionItem>
                    )}
                </React.Fragment>
            )}

            {ctaButtons && ctaButtons.length > 0 && (
                <MotionItem key={`${animKey}-cta`} isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                    <CTAButtons buttons={ctaButtons} className="mt-8" alignment={alignment} theme={theme} />
                </MotionItem>
            )}

            {data.socialLinks && data.socialLinks.length > 0 && (
                <MotionItem key={`${animKey}-social`} isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim} className="w-fit">
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
            style={paddingStyle}
        >
            <SectionBackgroundRenderer background={background} />

            {/* Centered Layout */}
            {layout === "centered" && (
                <MotionContainer
                    key={animKey}
                    isAnimated={isAnimated}
                    shouldAnimate={shouldAnimate}
                    anim={anim}
                    parallax={anim.parallax}
                    parallaxY={parallaxY}
                    className={`relative z-10 flex flex-col w-full ${alignment === "left" ? "items-start" : alignment === "right" ? "items-end" : "items-center"}`}
                >
                    {media && media.type !== "none" && (
                        <MotionItem key={`${animKey}-media`} isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
                            <MediaDisplay media={media} size="md" className="mb-8" />
                        </MotionItem>
                    )}

                    <div key={animKey} className={`max-w-4xl mx-auto px-6 flex flex-col ${alignClass}`}>{textContent}</div>
                </MotionContainer>
            )}

            {/* Split Layout */}
            {layout === "split" && (
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-6 w-full">
                    <MotionContainer
                        key={animKey}
                        isAnimated={isAnimated}
                        shouldAnimate={shouldAnimate}
                        anim={anim}
                        parallax={anim.parallax}
                        parallaxY={parallaxY}
                        className={`flex flex-col ${alignClass} ${mediaPosition === "left" ? "md:order-2" : ""}`}
                    >
                        <div key={animKey}>{textContent}</div>
                    </MotionContainer>

                    <motion.div
                        key={`${animKey}-media`}
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
                    key={animKey}
                    isAnimated={isAnimated}
                    shouldAnimate={shouldAnimate}
                    anim={anim}
                    parallax={anim.parallax}
                    parallaxY={parallaxY}
                    className={`relative z-10 max-w-3xl mx-auto px-6 flex flex-col ${alignClass}`}
                >
                    <div key={animKey}>{textContent}</div>
                </MotionContainer>
            )}
        </section>
    );
}