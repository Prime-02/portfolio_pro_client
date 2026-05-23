// portfolio-builder/components/sections/bio/BioRenderer.tsx

"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { BioData } from "@/portfolio-builder/types/bio";
import type { BioAnimations } from "@/portfolio-builder/types/bio";
import { MotionContainer, MotionItem } from "./renderer-components/MotionWrappers";
import { getBackgroundStyle } from "./renderer-components/backgroundUtils";
import { resolveEasing } from "./renderer-components/animations";
import { StatusBadge } from "./renderer-components/StatusBadge";
import { LanguageList } from "./renderer-components/LanguageList";
import { ContactList } from "./renderer-components/ContactList";
import { MetadataGrid } from "./renderer-components/MetadataGrid";
import { CTAButton } from "./renderer-components/CTAButton";
import { loadGoogleFont } from "../hero/editor-components/fonts";
import MarkdownRenderer from "@/src/app/components/markdown/MarkdownRenderer";

interface BioRendererProps {
  data: BioData;
}

export default function BioRenderer({ data }: BioRendererProps) {
  const {
    layout = "standard",
    alignment = "left",
    spacing = "normal",
    maxWidth = 800,
    padding,
    headline,
    bio,
    location,
    yearsExperience,
    status,
    languages,
    contacts,
    metadata,
    background,
    fonts,
    typography,
    animations,
    cta,
  } = data;

  const anim: BioAnimations = {
    preset: "fadeIn",
    duration: 0.6,
    delay: 0.1,
    easing: "easeOut",
    staggerChildren: true,
    staggerDelay: 0.12,
    scrollTrigger: true,
    scrollOnce: true,
    parallax: false,
    parallaxIntensity: 20,
    hoverEffect: "none",
    hoverScale: 1.03,
    textReveal: false,
    textRevealDelay: 0.2,
    ...animations,
  };

  const fontsConfig = fonts ?? {};
  const typographyConfig = typography ?? {};

  // Track font loading
  const [readyFonts, setReadyFonts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fontsToLoad = [
      { key: "headline", family: fontsConfig.headline },
      { key: "bio", family: fontsConfig.bio },
      { key: "location", family: fontsConfig.location },
      { key: "metadata", family: fontsConfig.metadata },
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
  }, [fontsConfig.headline, fontsConfig.bio, fontsConfig.location, fontsConfig.metadata]);

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

  const shouldAnimate = isAnimated
    ? anim.scrollTrigger
      ? isInView
      : true
    : false;

  // ── Background ───────────────────────────────────────────────────────────
  const bgStyle = getBackgroundStyle(background);

  // ── Alignment ────────────────────────────────────────────────────────────
  const alignClass = alignment === "center" ? "text-center items-center" : "text-left items-start";

  // ── Spacing ──────────────────────────────────────────────────────────────
  const spacingClasses = {
    tight: "space-y-4",
    normal: "space-y-6",
    loose: "space-y-8",
  };

  // ── Layout classes ───────────────────────────────────────────────────────
  const layoutClasses = {
    standard: "max-w-4xl mx-auto px-6",
    compact: "max-w-2xl mx-auto px-6",
    card: "max-w-3xl mx-auto px-8 py-12 rounded-2xl bg-neutral-900/50 border border-neutral-800",
  };

  // ── Padding ──────────────────────────────────────────────────────────────
  const paddingStyle: React.CSSProperties = {
    paddingTop: padding?.top != null ? `${padding.top}px` : "5rem",
    paddingBottom: padding?.bottom != null ? `${padding.bottom}px` : "5rem",
  };

  // ── Text style builder ───────────────────────────────────────────────────
  const getTextStyle = (fontKey: "headline" | "bio" | "location" | "metadata") => {
    const fieldTypography = typographyConfig[fontKey];
    const family = fontsConfig[fontKey];

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

  // ── Render content ───────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ ...bgStyle, ...paddingStyle }}
    >
      <MotionContainer
        isAnimated={isAnimated}
        shouldAnimate={shouldAnimate}
        anim={anim}
        parallax={anim.parallax}
        parallaxY={parallaxY}
        className={`relative z-10 ${layoutClasses[layout]} ${alignClass}`}
      >
        <div className={`flex flex-col ${alignClass} ${spacingClasses[spacing]}`}>
          {/* Status Badge */}
          {status && (
            <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
              <StatusBadge status={status} />
            </MotionItem>
          )}

          {/* Headline */}
          {headline && (
            <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
              <h2
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-white"
                style={getTextStyle("headline")}
              >
                {headline}
              </h2>
            </MotionItem>
          )}

          {/* Bio / Description */}
          {bio && (
            <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
              <div
                className="text-base md:text-lg"
                style={getTextStyle("bio")}
              >
                <MarkdownRenderer markdown={bio} />
              </div>
            </MotionItem>
          )}

          {/* Location & Experience row */}
          {(location || (yearsExperience && yearsExperience > 0)) && (
            <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                {location && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    {location}
                  </span>
                )}
                {yearsExperience && yearsExperience > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {yearsExperience} {yearsExperience === 1 ? "year" : "years"} of experience
                  </span>
                )}
              </div>
            </MotionItem>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
              <LanguageList languages={languages} />
            </MotionItem>
          )}

          {/* Contact Methods */}
          {contacts && contacts.length > 0 && (
            <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
              <ContactList contacts={contacts} />
            </MotionItem>
          )}

          {/* Metadata / Fun Facts */}
          {metadata && metadata.length > 0 && (
            <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
              <MetadataGrid metadata={metadata} />
            </MotionItem>
          )}

          {/* CTA Button */}
          {cta && (
            <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
              <CTAButton
                label={cta.label}
                url={cta.url}
                variant={cta.variant}
                openInNewTab={cta.openInNewTab}
                className="mt-2"
              />
            </MotionItem>
          )}
        </div>
      </MotionContainer>
    </section>
  );
}
