// portfolio-builder/components/sections/hero/renderer-components/ScrollIndicator.tsx

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

const RADIUS = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const NEAR_BOTTOM_THRESHOLD = 0.96;

function ScrollIndicatorInner() {
    const { scrollYProgress } = useScroll();
    const [isNearBottom, setIsNearBottom] = useState(false);

    const progress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const strokeDashoffset = useTransform(progress, [0, 1], [CIRCUMFERENCE, 0]);

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (v) => {
            setIsNearBottom(v >= NEAR_BOTTOM_THRESHOLD);
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    const handleClick = () => {
        window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
    };

    return (
        <motion.button
            type="button"
            onClick={handleClick}
            aria-label="Scroll progress"
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-center h-12 w-12 rounded-full cursor-pointer group"
        >
            <svg width="48" height="48" viewBox="0 0 48 48" className="absolute -rotate-90">
                <circle
                    cx="24"
                    cy="24"
                    r={RADIUS}
                    fill="none"
                    stroke="var(--pb-foreground-20)"
                    strokeWidth="2"
                />
                <motion.circle
                    cx="24"
                    cy="24"
                    r={RADIUS}
                    fill="none"
                    stroke="var(--pb-accent, var(--pb-foreground-60))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    style={{ strokeDashoffset }}
                />
            </svg>

            <motion.svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--pb-foreground-60)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:stroke-[var(--pb-foreground)] transition-colors"
                animate={isNearBottom ? { y: 0 } : { y: [0, 4, 0] }}
                transition={
                    isNearBottom
                        ? { duration: 0.2 }
                        : { repeat: Infinity, duration: 1.4, ease: "easeInOut" }
                }
            >
                <path d="M12 5v14M5 12l7 7 7-7" />
            </motion.svg>
        </motion.button>
    );
}

export function ScrollIndicator() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return createPortal(<ScrollIndicatorInner />, document.body);
}