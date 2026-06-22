"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInfiniteScroll } from "@/src/app/components/blogs/useInfiniteScroll";
import { LoaderComponent } from "../loaders/Loader";

interface InfiniteScrollTriggerProps {
    hasMore: boolean;
    isLoading: boolean;
    onLoadMore: () => void;
    title?: string
}

export function InfiniteScrollTrigger({
    hasMore,
    isLoading,
    onLoadMore,
    title = "Loading more posts…"
}: InfiniteScrollTriggerProps) {
    const sentinelRef = useInfiniteScroll({ hasMore, isLoading, onLoadMore });

    return (
        <div ref={sentinelRef} className="w-full flex justify-center py-8">
            <AnimatePresence>
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full
              bg-[var(--foreground)]/5 border border-[var(--foreground)]/10"
                    >
                        <LoaderComponent size={20} />
                        <span className="text-xs text-[var(--foreground)]/40">
                            {title}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}