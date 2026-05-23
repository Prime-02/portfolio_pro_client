// portfolio-builder/components/sections/bio/renderer-components/MotionWrappers.tsx

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
}

export function MotionContainer({
  children,
  isAnimated,
  shouldAnimate,
  anim,
  parallax,
  parallaxY,
  className,
}: MotionContainerProps) {
  const containerVariants = buildContainerVariants(anim);

  return (
    <motion.div
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

interface MotionItemProps {
  children: React.ReactNode;
  isAnimated: boolean;
  shouldAnimate: boolean;
  anim: BioAnimations;
  className?: string;
}

export function MotionItem({
  children,
  isAnimated,
  shouldAnimate,
  anim,
  className,
}: MotionItemProps) {
  const itemVariants = isAnimated ? buildVariants(anim) : {};

  if (!isAnimated) {
    return <div className={`w-fit ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      className={`w-fit ${className}`}
    >
      {children}
    </motion.div>
  );
}
