"use client";

import { HeroAnimations } from "@/portfolio-builder/types/hero";
import { motion } from "framer-motion";
import { buildVariants } from "./animations";

interface AnimatedTextProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    shouldAnimate?: boolean;
    anim?: HeroAnimations;
}

export function AnimatedText({
    children,
    delay = 0,
    className,
    shouldAnimate = true,
    anim,
}: AnimatedTextProps) {
    // If an anim config is provided, combine the selected preset with the clip-mask reveal.
    // The preset determines HOW the text animates (slide, scale, blur, etc.),
    // while the overflow-hidden container provides the clip-mask effect.
    if (anim) {
        const variants = buildVariants(anim);
        const visibleWithDelay = {
            ...variants.visible,
            transition: {
                ...((variants.visible as Record<string, unknown>).transition as object),
                delay,
            },
        };

        return (
            <div className={`overflow-hidden w-full ${className ?? ""}`}>
                <motion.div
                    variants={{ hidden: variants.hidden, visible: visibleWithDelay }}
                    initial="hidden"
                    animate={shouldAnimate ? "visible" : "hidden"}
                    className="w-full"
                >
                    {children}
                </motion.div>
            </div>
        );
    }

    // Legacy fallback — hardcoded clip-mask reveal (used when no anim config available)
    return (
        <div className={`overflow-hidden w-full ${className ?? ""}`}>
            <motion.div
                initial={{ y: "110%" }}
                animate={shouldAnimate ? { y: "0%" } : { y: "110%" }}
                transition={{ duration: 0.7, ease: [0.0, 0.0, 0.2, 1], delay }}
                className="w-full"
            >
                {children}
            </motion.div>
        </div>
    );
}