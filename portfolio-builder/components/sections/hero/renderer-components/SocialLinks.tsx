// portfolio-builder/components/sections/hero/renderer-components/SocialLinks.tsx

"use client";

import { motion } from "framer-motion";
import { SocialLink } from "@/portfolio-builder/types/hero";
import { socialMediaPlatforms } from "@/lib/utilities/indices/DropDownItems";

// Extended type to support color preferences (matching the editor)
interface HeroSocialLink extends SocialLink {
    useIconColor?: boolean;
    customColor?: string;
}

interface SocialLinksProps {
    links: SocialLink[];
    className?: string;
    alignment?: "center" | "left";
    isAnimated?: boolean;
    shouldAnimate?: boolean;
    anim?: {
        duration?: number;
        delay?: number;
        easing?: string;
        staggerChildren?: boolean;
        staggerDelay?: number;
    };
}

export default function SocialLinks({
    links,
    className = "",
    alignment = "center",
    isAnimated = false,
    shouldAnimate = false,
    anim,
}: SocialLinksProps) {
    const validLinks = links.filter((link) => {
        const platform = socialMediaPlatforms.find((p) => p.id === link.platformId);
        return platform && link.url?.trim();
    }) as HeroSocialLink[];

    if (validLinks.length === 0) return null;

    const alignClass = alignment === "left" ? "justify-start" : "justify-center";

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: anim?.staggerChildren ? (anim?.staggerDelay ?? 0.12) : 0,
                delayChildren: (anim?.delay ?? 0.1) + 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: anim?.duration ?? 0.4,
                ease: "easeOut",
            },
        },
    };

    const Wrapper = isAnimated && shouldAnimate ? motion.div : "div";
    const wrapperProps = isAnimated && shouldAnimate
        ? {
            variants: containerVariants,
            initial: "hidden",
            animate: "visible",
        }
        : {};

    return (
        <Wrapper className={`flex flex-wrap items-center gap-3 ${alignClass} ${className}`} {...wrapperProps}>
            {validLinks.map((link) => {
                const platform = socialMediaPlatforms.find((p) => p.id === link.platformId)!;

                // Determine icon color based on preferences
                const iconColor = link.useIconColor !== false
                    ? platform.color
                    : (link.customColor || "#ffffff");

                const ItemWrapper = isAnimated && shouldAnimate ? motion.a : "a";
                const itemProps = isAnimated && shouldAnimate
                    ? { variants: itemVariants }
                    : {};

                return (
                    <ItemWrapper
                        key={link.platformId}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-neutral-800/50 border border-neutral-700/50 hover:bg-neutral-700/50 hover:border-neutral-500/50 transition-all duration-300"
                        title={platform.code}
                        {...itemProps}
                    >
                        <platform.icon
                            className="w-5 h-5 transition-colors duration-300"
                            style={{ color: iconColor }}
                        />
                        {/* Tooltip */}
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-neutral-800 text-neutral-300 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {platform.code}
                        </span>
                    </ItemWrapper>
                );
            })}
        </Wrapper>
    );
}