// portfolio-builder/components/sections/hero/renderer-components/MotionWrappers.tsx

"use client";

import { motion, MotionValue, type TargetAndTransition } from "framer-motion";
import type { HeroAnimations } from "@/portfolio-builder/types/hero";
import {
    buildContainerVariants,
    buildVariants,
    getHoverProps,
} from "./animations";

interface MotionContainerProps {
    children: React.ReactNode;
    isAnimated: boolean;
    shouldAnimate: boolean;
    anim: HeroAnimations;
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
    const hoverProps = getHoverProps(anim);

    // When not animated, render as a plain div (no parallax motion value needed)
    if (!isAnimated) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={shouldAnimate ? "visible" : "hidden"}
            className={className}
            style={parallax ? { y: parallaxY } : undefined}
            {...hoverProps}
        >
            {children}
        </motion.div>
    );
}

interface MotionItemProps {
    children: React.ReactNode;
    isAnimated: boolean;
    shouldAnimate: boolean;
    anim: HeroAnimations;
    className?: string;
}

export function MotionItem({
    children,
    isAnimated,
    shouldAnimate,
    anim,
    className,
}: MotionItemProps) {
    if (!isAnimated) {
        return <div className={`w-fit ${className ?? ""}`}>{children}</div>;
    }

    const itemVariants = buildVariants(anim);
    const hidden = itemVariants.hidden as TargetAndTransition;
    const visible = itemVariants.visible as TargetAndTransition;

    // Extract transition from the visible variant
    const transition = visible.transition;

    // Use initial/animate directly instead of variants to avoid relying on
    // parent variant propagation (which breaks when regular DOM nodes are in between).
    return (
        <motion.div
            initial={hidden}
            animate={shouldAnimate ? { ...visible, transition } : hidden}
            className={`w-fit ${className ?? ""}`}
        >
            {children}
        </motion.div>
    );
}