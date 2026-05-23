// portfolio-builder/components/sections/hero/renderer-components/MotionWrappers.tsx

"use client";

import { motion, MotionValue } from "framer-motion";
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

    return (
        <motion.div
            variants={containerVariants}
            initial={isAnimated ? "hidden" : false}
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
            className={`w-fit ${className}`}
        >
            {children}
        </motion.div>
    );
}