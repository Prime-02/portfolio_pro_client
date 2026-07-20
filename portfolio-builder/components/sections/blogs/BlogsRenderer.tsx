// portfolio-builder/components/sections/blogs/BlogsRenderer.tsx
"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import type { BlogsData } from "@/portfolio-builder/types/blogs";
import type { BioAnimations } from "@/portfolio-builder/types/bio";
import { MotionContainer, MotionItem } from "../bio/renderer-components/MotionWrappers";
import { SectionBackgroundRenderer } from "@/portfolio-builder/components/shared/background/renderer/SectionBackground";
import { CTAButton } from "../bio/renderer-components/CTAButton";
import {
  TimelineLayout,
  MagazineGridLayout,
  NewspaperLayout,
  ReadingListLayout,
  FeaturedCarouselLayout,
  sortBlogs,
  useDebouncedBlogsFetch,
} from "./renderer-components";
import { useTypewriter } from "../hero/renderer-components/useTypewriter";

interface BlogsRendererProps {
  data: BlogsData;
  username: string;
  animationKey?: string | number;
}

const DEFAULT_ANIM: BioAnimations = {
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

function TypewriterCursor({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <span className="inline-block w-[2px] h-[1em] bg-[var(--pb-foreground)] ml-0.5 animate-pulse align-middle" />
  );
}

export default function BlogsRenderer({ data, username, animationKey }: BlogsRendererProps) {
  // ── Destructure with proper defaults ─────────────────────────────────────
  const {
    layout = "timeline",
    alignment = "left",
    columns = 2,
    gap = "medium",
    maxWidth = 1200,
    padding,
    headline,
    subheadline,
    background,
    animations,
    ctaButtons,
    filters,
    cardStyle = "standard",
    cardSize = "medium",
    showImage = true,
    showTitle = true,
    showExcerpt = true,
    showBody = false,
    showAuthor = true,
    showDates = true,
    dateDisplay = "relative",
    showStatus = true,
    statusDisplay = "badge",
    showTags = true,
    showCategory = true,
    showReactions = true,
    reactionDisplay = "icons",
    showComments = true,
    showViews = true,
    showReadTime = true,
    showShare = false,
    showBookmark = false,
    showUrl = true,
    cardOverrides = [],
  } = data;

  // ── Safe defaults for nested objects ─────────────────────────────────────
  const safeFilters: BlogsData["filters"] = {
    ...filters,
    _sortBy: filters?._sortBy ?? "default",
  };

  const safeBackground = background ?? { type: "none" as const };

  const anim: BioAnimations = animations
    ? { ...DEFAULT_ANIM, ...animations }
    : DEFAULT_ANIM;

  const isAnimated = anim.preset !== "none";

  // ── Blogs fetch ──────────────────────────────────────────────────────────
  const { rendererBlogs, isLoadingBlogs } = useDebouncedBlogsFetch(username, safeFilters);
  const sortedBlogs = sortBlogs(rendererBlogs, safeFilters._sortBy || "default");

  // ── Scroll / parallax refs ────────────────────────────────────────────────
  const sectionRef = useRef<HTMLElement>(null);

  const isInView = useInView(sectionRef, { once: anim.scrollOnce, amount: 0.15 });

  const { scrollYProgress } = useScroll({
    target: anim.parallax ? sectionRef : undefined,
    offset: ["start start", "end start"],
  });

  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -(anim.parallaxIntensity ?? 15)]
  );

  const shouldAnimate = isAnimated ? (anim.scrollTrigger ? isInView : true) : false;

  // ── Typewriter hooks ──────────────────────────────────────────────────────
  const headlineTypewriter = useTypewriter({
    text: headline || "",
    enabled: isAnimated && !!anim.textReveal && !!headline && shouldAnimate,
    speed: 40,
    delay: Math.round((anim.textRevealDelay ?? 0.2) * 1000),
  });

  const subheadlineTypewriter = useTypewriter({
    text: subheadline || "",
    enabled: isAnimated && !!anim.textReveal && !!subheadline && shouldAnimate,
    speed: 30,
    delay: Math.round((anim.textRevealDelay ?? 0.2) * 1000) + (headline?.length || 0) * 40,
  });

  // ── Derived styles ────────────────────────────────────────────────────────
  const alignClass =
    alignment === "center"
      ? "text-center items-center"
      : alignment === "right"
        ? "text-right items-end"
        : "text-left items-start";

  const paddingStyle: React.CSSProperties = {
    paddingTop: padding?.top != null ? `${padding.top}px` : "5rem",
    paddingBottom: padding?.bottom != null ? `${padding.bottom}px` : "5rem",
  };

  const contentStyle: React.CSSProperties = { maxWidth: `${maxWidth}px` };

  const layoutProps = {
    blogs: sortedBlogs,
    data: {
      ...data,
      filters: safeFilters,
      background: safeBackground,
      animations: anim,
      layout,
      alignment,
      columns,
      gap,
      maxWidth,
      cardStyle,
      cardSize,
      showImage,
      showTitle,
      showExcerpt,
      showBody,
      showAuthor,
      showDates,
      dateDisplay,
      showStatus,
      statusDisplay,
      showTags,
      showCategory,
      showReactions,
      reactionDisplay,
      showComments,
      showViews,
      showReadTime,
      showShare,
      showBookmark,
      showUrl,
      cardOverrides,
    },
    isAnimated,
    shouldAnimate,
    anim,
  };

  const renderLayout = () => {
    switch (layout) {
      case "magazine-grid": return <MagazineGridLayout {...layoutProps} />;
      case "newspaper": return <NewspaperLayout {...layoutProps} />;
      case "reading-list": return <ReadingListLayout {...layoutProps} />;
      case "featured-carousel": return <FeaturedCarouselLayout {...layoutProps} />;
      case "timeline":
      default: return <TimelineLayout {...layoutProps} />;
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (isLoadingBlogs) {
    return (
      <section ref={sectionRef} className="relative" style={paddingStyle}>
        <SectionBackgroundRenderer background={safeBackground} />
        <div
          className={`relative z-10 mx-auto w-full px-4 sm:px-6 lg:px-8 ${alignClass}`}
          style={contentStyle}
        >
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--pb-foreground)] border-t-transparent" />
          </div>
        </div>
      </section>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (sortedBlogs.length === 0) return null;

  const showTypewriter = isAnimated && !!anim.textReveal;
  const headlineText = showTypewriter ? headlineTypewriter.displayed : headline;
  const subheadlineText = showTypewriter ? subheadlineTypewriter.displayed : subheadline;
  const showHeadlineCursor = showTypewriter && !headlineTypewriter.isDone;
  const showSubCursor = showTypewriter && headlineTypewriter.isDone && !subheadlineTypewriter.isDone;

  return (
    <section ref={sectionRef} className="relative overflow-hidden" style={paddingStyle}>
      <SectionBackgroundRenderer background={safeBackground} />

      <MotionContainer
        motionKey={animationKey}
        isAnimated={isAnimated}
        shouldAnimate={shouldAnimate}
        anim={anim}
        className="relative z-10 w-full"
      >
        <motion.div
          className="w-full"
          style={anim.parallax ? { y: parallaxY } : undefined}
        >
          <div
            className={`mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col ${alignClass}`}
            style={contentStyle}
          >
            {(headline || subheadline) && (
              <div className={`mb-8 lg:mb-12 flex flex-col gap-3 ${alignClass}`}>
                {headline && (
                  <MotionItem
                    motionKey={animationKey ? `${animationKey}-headline` : undefined}
                    isAnimated={isAnimated}
                    shouldAnimate={shouldAnimate}
                    anim={anim}
                  >
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--pb-foreground)]">
                      {headlineText}
                      <TypewriterCursor visible={showHeadlineCursor} />
                    </h2>
                  </MotionItem>
                )}
                {subheadline && (
                  <MotionItem
                    motionKey={animationKey ? `${animationKey}-sub` : undefined}
                    isAnimated={isAnimated}
                    shouldAnimate={shouldAnimate}
                    anim={anim}
                  >
                    <p className="text-base md:text-lg text-[var(--pb-foreground-60)] max-w-2xl">
                      {subheadlineText}
                      <TypewriterCursor visible={showSubCursor} />
                    </p>
                  </MotionItem>
                )}
              </div>
            )}

            {renderLayout()}

            {ctaButtons && ctaButtons.length > 0 && (
              <MotionItem
                motionKey={animationKey ? `${animationKey}-cta` : undefined}
                isAnimated={isAnimated}
                shouldAnimate={shouldAnimate}
                anim={anim}
              >
                <div className="flex flex-wrap gap-3 mt-8 lg:mt-10 justify-center">
                  {ctaButtons.map((btn, index) => (
                    <CTAButton
                      key={index}
                      label={btn.label}
                      url={btn.url}
                      variant={btn.variant}
                      openInNewTab={btn.openInNewTab}
                    />
                  ))}
                </div>
              </MotionItem>
            )}
          </div>
        </motion.div>
      </MotionContainer>
    </section>
  );
}