// portfolio-builder/components/sections/bio/BioRenderer.tsx

"use client";

import { useRef, useEffect, useState, JSX } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { BioData } from "@/portfolio-builder/types/bio";
import type { BioAnimations } from "@/portfolio-builder/types/bio";
import { MotionContainer, MotionItem } from "./renderer-components/MotionWrappers";
import { StatusBadge } from "./renderer-components/StatusBadge";
import { LanguageList } from "./renderer-components/LanguageList";
import { ContactList } from "./renderer-components/ContactList";
import { MetadataGrid } from "./renderer-components/MetadataGrid";
import { CTAButton } from "./renderer-components/CTAButton";
import { loadGoogleFont } from "../hero/editor-components/fonts";
import MarkdownRenderer from "@/src/app/components/markdown/MarkdownRenderer";
import { SectionBackgroundRenderer } from "@/portfolio-builder/components/shared/SectionBackground";

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
    ctaButtons,
  } = data;

  const defaultAnim: BioAnimations = {
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
  };

  const anim: BioAnimations = {
    ...defaultAnim,
    ...(animations ?? {}),
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

  // ── Alignment helpers ────────────────────────────────────────────────────
  const alignClass = alignment === "center" ? "text-center items-center" : "text-left items-start";
  const alignJustify = alignment === "center" ? "justify-center" : "justify-start";

  // ── Spacing ──────────────────────────────────────────────────────────────
  const spacingClasses = {
    tight: "space-y-4",
    normal: "space-y-6",
    loose: "space-y-8",
  };

  // ── Layout max-width containers (all centered on large screens) ──────────
  const layoutContainer = (widthClass: string) =>
    `${widthClass} mx-auto w-full px-4 sm:px-6 lg:px-8`;

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

  // ── Shared content blocks ────────────────────────────────────────────────
  const StatusBlock = status ? (
    <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
      <StatusBadge status={status} />
    </MotionItem>
  ) : null;

  const HeadlineBlock = headline ? (
    <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
      <h2
        className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--pb-foreground)]"
        style={getTextStyle("headline")}
      >
        {headline}
      </h2>
    </MotionItem>
  ) : null;

  const BioBlock = bio ? (
    <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
      <div className="text-base md:text-lg text-[var(--pb-foreground-80)]" style={getTextStyle("bio")}>
        <MarkdownRenderer markdown={bio} />
      </div>
    </MotionItem>
  ) : null;

  const LocationExpBlock = (location || (yearsExperience && yearsExperience > 0)) ? (
    <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
      <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--pb-foreground-60)]">
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
  ) : null;

  const LanguagesBlock = languages && languages.length > 0 ? (
    <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
      <LanguageList languages={languages} />
    </MotionItem>
  ) : null;

  const ContactsBlock = contacts && contacts.length > 0 ? (
    <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
      <ContactList contacts={contacts} />
    </MotionItem>
  ) : null;

  const MetadataBlock = metadata && metadata.length > 0 ? (
    <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
      <MetadataGrid metadata={metadata} />
    </MotionItem>
  ) : null;

  // ── CTA Block ────
  const CTABlock = ctaButtons && ctaButtons.length > 0 ? (
    <MotionItem isAnimated={isAnimated} shouldAnimate={shouldAnimate} anim={anim}>
      <div className="flex flex-wrap gap-3 mt-2">
        {ctaButtons.map((btn, index) => (
          <CTAButton
            key={index}
            label={btn.label}
            url={btn.url}
            variant={btn.variant}
            openInNewTab={btn.openInNewTab}
            className=""
          />
        ))}
      </div>
    </MotionItem>
  ) : null;

  // ── Helper: alignment-aware wrapper ──────────────────────────────────────
  const AlignWrap = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`${alignment === "center" ? "text-center items-center" : "text-left items-start"} ${className}`}>
      {children}
    </div>
  );

  // ── Layout renderers ─────────────────────────────────────────────────────

  const renderStandard = () => (
    <AlignWrap className={`flex flex-col ${spacingClasses[spacing]}`}>
      {StatusBlock}
      {HeadlineBlock}
      {BioBlock}
      {LocationExpBlock}
      {LanguagesBlock}
      {ContactsBlock}
      {MetadataBlock}
      {CTABlock}
    </AlignWrap>
  );

  const renderSplit = () => (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 ${alignJustify}`}>
      <AlignWrap className={`flex flex-col ${spacingClasses[spacing]}`}>
        {StatusBlock}
        {HeadlineBlock}
        {LocationExpBlock}
      </AlignWrap>
      <AlignWrap className={`flex flex-col ${spacingClasses[spacing]}`}>
        {BioBlock}
        {LanguagesBlock}
        {ContactsBlock}
        {MetadataBlock}
        {CTABlock}
      </AlignWrap>
    </div>
  );

  const renderMagazine = () => (
    <AlignWrap className="flex flex-col">
      <div className={`mb-8 lg:mb-12 ${spacingClasses[spacing]}`}>
        {StatusBlock}
        {HeadlineBlock}
        {LocationExpBlock}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
        <AlignWrap className={`flex flex-col ${spacingClasses[spacing]}`}>
          {BioBlock}
          {LanguagesBlock}
        </AlignWrap>
        <AlignWrap className={`flex flex-col ${spacingClasses[spacing]}`}>
          {ContactsBlock}
          {MetadataBlock}
          {CTABlock}
        </AlignWrap>
      </div>
    </AlignWrap>
  );

  const renderFeatured = () => (
    <AlignWrap className="flex flex-col">
      <div className={`mb-8 lg:mb-12 ${spacingClasses[spacing]}`}>
        {StatusBlock}
        <div className={alignment === "center" ? "max-w-3xl mx-auto" : "max-w-3xl"}>
          {HeadlineBlock}
        </div>
      </div>
      {BioBlock && (
        <div className={`mb-8 lg:mb-12 ${alignment === "center" ? "max-w-3xl mx-auto" : "max-w-2xl"}`}>
          <div className="pl-4 md:pl-6 border-l-2 border-[var(--pb-border)]">
            {BioBlock}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {LocationExpBlock && (
          <div className="p-4 lg:p-5 rounded-xl bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)]">
            {LocationExpBlock}
          </div>
        )}
        {LanguagesBlock && (
          <div className="p-4 lg:p-5 rounded-xl bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)]">
            {LanguagesBlock}
          </div>
        )}
        {ContactsBlock && (
          <div className="p-4 lg:p-5 rounded-xl bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)]">
            {ContactsBlock}
          </div>
        )}
        {MetadataBlock && (
          <div className="p-4 lg:p-5 rounded-xl bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)]">
            {MetadataBlock}
          </div>
        )}
      </div>
      {CTABlock && <div className="mt-8 lg:mt-10">{CTABlock}</div>}
    </AlignWrap>
  );

  const renderSidebar = () => (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 ${alignJustify}`}>
      <AlignWrap className={`lg:col-span-4 flex flex-col ${spacingClasses[spacing]}`}>
        {StatusBlock}
        {HeadlineBlock}
        <div className="mt-4 pt-4 border-t border-[var(--pb-border)] w-full">
          {LocationExpBlock}
        </div>
        <div className="pt-3 w-full">
          {LanguagesBlock}
        </div>
        {ContactsBlock && (
          <div className="pt-3 w-full">
            {ContactsBlock}
          </div>
        )}
      </AlignWrap>
      <AlignWrap className={`lg:col-span-8 flex flex-col ${spacingClasses[spacing]}`}>
        {BioBlock}
        {MetadataBlock}
        {CTABlock}
      </AlignWrap>
    </div>
  );

  const renderMinimal = () => (
    <AlignWrap className="py-8 md:py-16 lg:py-20">
      <div className={`max-w-2xl mx-auto w-full ${alignment === "center" ? "" : "lg:mx-0"}`}>
        <div className={`flex flex-col ${spacingClasses[spacing]}`}>
          {StatusBlock}
          {HeadlineBlock}
          {BioBlock}
          {LocationExpBlock}
          {LanguagesBlock}
          {ContactsBlock}
          {MetadataBlock}
          {CTABlock}
        </div>
      </div>
    </AlignWrap>
  );

  const renderBento = () => (
    <AlignWrap className="flex flex-col">
      <div className={`mb-8 lg:mb-10 ${spacingClasses[spacing]}`}>
        {StatusBlock}
        {HeadlineBlock}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {BioBlock && (
          <div className="sm:col-span-2 lg:col-span-2 p-5 lg:p-6 rounded-2xl bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            {BioBlock}
          </div>
        )}
        {LocationExpBlock && (
          <div className="p-5 lg:p-6 rounded-2xl bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            {LocationExpBlock}
          </div>
        )}
        {LanguagesBlock && (
          <div className="p-5 lg:p-6 rounded-2xl bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            {LanguagesBlock}
          </div>
        )}
        {ContactsBlock && (
          <div className="sm:col-span-2 lg:col-span-2 p-5 lg:p-6 rounded-2xl bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            {ContactsBlock}
          </div>
        )}
        {MetadataBlock && (
          <div className="p-5 lg:p-6 rounded-2xl bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            {MetadataBlock}
          </div>
        )}
        {CTABlock && (
          <div className="sm:col-span-2 lg:col-span-3 p-5 lg:p-6 rounded-2xl bg-[var(--pb-surface)] border border-[var(--pb-border)]">
            {CTABlock}
          </div>
        )}
      </div>
    </AlignWrap>
  );

  const renderShowcase = () => (
    <AlignWrap className="flex flex-col">
      <div className={`mb-10 lg:mb-16 ${spacingClasses[spacing]}`}>
        {StatusBlock}
        <div className={alignment === "center" ? "max-w-4xl mx-auto" : "max-w-4xl"}>
          {HeadlineBlock}
        </div>
        {BioBlock && (
          <div className={`mt-6 ${alignment === "center" ? "max-w-2xl mx-auto" : "max-w-2xl"}`}>
            {BioBlock}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
        {LocationExpBlock && (
          <div className="p-5 lg:p-6 rounded-xl bg-[var(--pb-surface)] border border-[var(--pb-border)] backdrop-blur-sm">
            {LocationExpBlock}
          </div>
        )}
        {LanguagesBlock && (
          <div className="p-5 lg:p-6 rounded-xl bg-[var(--pb-surface)] border border-[var(--pb-border)] backdrop-blur-sm">
            {LanguagesBlock}
          </div>
        )}
        {ContactsBlock && (
          <div className="p-5 lg:p-6 rounded-xl bg-[var(--pb-surface)] border border-[var(--pb-border)] backdrop-blur-sm">
            {ContactsBlock}
          </div>
        )}
        {MetadataBlock && (
          <div className="p-5 lg:p-6 rounded-xl bg-[var(--pb-surface)] border border-[var(--pb-border)] backdrop-blur-sm">
            {MetadataBlock}
          </div>
        )}
      </div>
      {CTABlock && <div className="mt-10 lg:mt-14">{CTABlock}</div>}
    </AlignWrap>
  );

  const layoutRenderers: Record<string, () => JSX.Element> = {
    standard: renderStandard,
    split: renderSplit,
    magazine: renderMagazine,
    featured: renderFeatured,
    sidebar: renderSidebar,
    minimal: renderMinimal,
    bento: renderBento,
    showcase: renderShowcase,
  };

  const renderLayout = layoutRenderers[layout] || renderStandard;

  // ── Container widths per layout (all centered) ─────────────────────────────
  const layoutWidthClasses: Record<string, string> = {
    standard: "max-w-4xl",
    split: "max-w-6xl",
    magazine: "max-w-5xl",
    featured: "max-w-5xl",
    sidebar: "max-w-6xl",
    minimal: "max-w-3xl",
    bento: "max-w-5xl",
    showcase: "max-w-6xl",
  };

  // ── Render content ───────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={paddingStyle}
    >
      <SectionBackgroundRenderer background={background} />

      <MotionContainer
        isAnimated={isAnimated}
        shouldAnimate={shouldAnimate}
        anim={anim}
        parallax={anim.parallax}
        parallaxY={parallaxY}
        className={`relative z-10 ${layoutContainer(layoutWidthClasses[layout] || "max-w-4xl")} ${alignClass}`}
      >
        {renderLayout()}
      </MotionContainer>
    </section>
  );
}