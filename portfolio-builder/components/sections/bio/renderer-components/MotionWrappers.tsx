"use client";

import { motion, MotionValue } from "framer-motion";
import type { BioAnimations } from "@/portfolio-builder/types/bio";
import { buildContainerVariants, buildVariants } from "./animations";

interface MotionContainerProps {
  children: React.ReactNode;
  isAnimated: boolean;
  shouldAnimate: boolean;
  anim: BioAnimations;
  parallax?: boolean;
  parallaxY?: MotionValue<number>;
  className?: string;
  /** Changing this key forces Framer Motion to replay the entrance animation */
  motionKey?: string | number;
}

export function MotionContainer({
  children,
  isAnimated,
  shouldAnimate,
  anim,
  parallax,
  parallaxY,
  className,
  motionKey,
}: MotionContainerProps) {
  const containerVariants = buildContainerVariants(anim);

  return (
    <motion.div
      key={motionKey}
      variants={containerVariants}
      initial={isAnimated ? "hidden" : false}
      animate={shouldAnimate ? "visible" : "hidden"}
      className={className}
      style={parallax ? { y: parallaxY } : undefined}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Hover effect helpers
// ---------------------------------------------------------------------------

function getHoverProps(anim: BioAnimations) {
  const effect = anim.hoverEffect ?? "none";
  const scale = anim.hoverScale ?? 1.03;

  switch (effect) {
    case "scale":
      return { whileHover: { scale }, whileTap: { scale: 0.98 } };
    case "lift":
      return { whileHover: { y: -4 }, whileTap: { y: -2 } };
    case "glow":
      return {
        whileHover: {
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
        },
      };
    case "none":
    default:
      return {};
  }
}

interface MotionItemProps {
  children: React.ReactNode;
  isAnimated: boolean;
  shouldAnimate: boolean;
  anim: BioAnimations;
  className?: string;
  /** Changing this key forces Framer Motion to replay the entrance animation */
  motionKey?: string | number;
}

export function MotionItem({
  children,
  isAnimated,
  shouldAnimate,
  anim,
  className,
  motionKey,
}: MotionItemProps) {
  const itemVariants = isAnimated ? buildVariants(anim) : {};
  const hoverProps = isAnimated ? getHoverProps(anim) : {};

  if (!isAnimated) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      key={motionKey}
      variants={itemVariants}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      className={className}
      {...hoverProps}
    >
      {children}
    </motion.div>
  );
}