import { motion } from "framer-motion";

interface StarRatingProps {
    rating: number;
    maxStars?: number;
    size?: "sm" | "md" | "lg";
    interactive?: boolean;
    onChange?: (rating: number) => void;
}

const sizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
};

export function StarRating({
    rating,
    maxStars = 5,
    size = "md",
    interactive = false,
    onChange,
}: StarRatingProps) {
    const sizeClass = sizeMap[size];

    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: maxStars }, (_, i) => {
                const starValue = i + 1;
                const isFilled = starValue <= rating;

                return (
                    <motion.button
                        key={i}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && onChange?.(starValue)}
                        className={`${sizeClass} ${interactive ? "cursor-pointer" : "cursor-default"} relative`}
                        whileHover={interactive ? { scale: 1.2 } : {}}
                        whileTap={interactive ? { scale: 0.9 } : {}}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                    >
                        <svg
                            className={`${sizeClass} transition-colors duration-200`}
                            fill={isFilled ? "var(--warning-500)" : "none"}
                            stroke={isFilled ? "var(--warning-500)" : "var(--text-muted)"}
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                            />
                        </svg>
                    </motion.button>
                );
            })}
        </div>
    );
}