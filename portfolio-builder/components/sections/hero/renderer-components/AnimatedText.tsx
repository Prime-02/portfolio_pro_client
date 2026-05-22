// portfolio-builder/components/sections/hero/renderer-components/AnimatedText.tsx

"use client";

import { motion } from "framer-motion";

interface AnimatedTextProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    shouldAnimate?: boolean;
}

export function AnimatedText({
    children,
    delay = 0,
    className,
    shouldAnimate = true,
}: AnimatedTextProps) {
    return (
        <div className={`overflow-hidden ${className ?? ""}`}>
            <motion.div
                initial={{ y: "110%" }}
                animate={shouldAnimate ? { y: "0%" } : { y: "110%" }}
                transition={{ duration: 0.7, ease: [0.0, 0.0, 0.2, 1], delay }}
            >
                {children}
            </motion.div>
        </div>
    );
}