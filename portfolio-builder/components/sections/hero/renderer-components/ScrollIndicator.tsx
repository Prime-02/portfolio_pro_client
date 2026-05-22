// portfolio-builder/components/sections/hero/renderer-components/ScrollIndicator.tsx

"use client";

import { motion } from "framer-motion";

export function ScrollIndicator() {
    return (
        <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
        >
            <div className="w-5 h-8 border-2 border-neutral-500 rounded-full flex justify-center">
                <motion.div
                    className="w-1 h-2 bg-neutral-400 rounded-full mt-1"
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                />
            </div>
        </motion.div>
    );
}