// portfolio-builder/components/sections/hero/renderer-components/SocialLinks.tsx

"use client";

import { motion } from "framer-motion";
import { SocialLink } from "@/portfolio-builder/types/hero";
import { socialMediaPlatforms } from "@/lib/utilities/indices/DropDownItems";

interface HeroSocialLink extends SocialLink {
    useIconColor?: boolean;
    customColor?: string;
}

interface SocialLinksProps {
    links: SocialLink[];
    className?: string;
    alignment?: "center" | "left" | "right";
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
        hidden: { opacity: isAnimated ? 0 : 1 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: anim?.staggerChildren ? (anim?.staggerDelay ?? 0.12) : 0,
                delayChildren: (anim?.delay ?? 0.1) + 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: isAnimated ? 0 : 1, y: isAnimated ? 10 : 0 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: anim?.duration ?? 0.4,
                ease: "easeOut" as const,
            },
        },
    };

    const Wrapper = isAnimated ? motion.div : "div";
    const wrapperProps = isAnimated
        ? {
            variants: containerVariants,
            initial: "hidden",
            animate: shouldAnimate ? "visible" : "hidden",
        }
        : {};

    return (
        <Wrapper className={`flex flex-wrap items-center gap-3 ${alignClass} ${className}`} {...wrapperProps}>
            {validLinks.map((link) => {
                const platform = socialMediaPlatforms.find((p) => p.id === link.platformId)!;

                const iconColor = link.useIconColor !== false
                    ? platform.color
                    : (link.customColor || "var(--pb-foreground)");

                const ItemWrapper = isAnimated ? motion.a : "a";
                const itemProps = isAnimated ? { variants: itemVariants } : {};

                return (
                    <ItemWrapper
                        key={link.platformId}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-center w-10 h-10 rounded-full 
                            bg-[var(--pb-surface-elevated)] 
                            border border-[var(--pb-border)] 
                            hover:bg-[var(--pb-surface-hover)] 
                            hover:border-[var(--pb-foreground-30)] 
                            transition-all duration-300
                            shadow-sm"
                        title={platform.code}
                        {...itemProps}
                    >
                        {platform.icon && (
                            <platform.icon
                                className="w-5 h-5 transition-colors duration-300"
                                style={{
                                    color: iconColor,
                                    minWidth: "1.25rem",
                                    minHeight: "1.25rem",
                                }}
                            />
                        )}

                        {!platform.icon && (
                            <span className="text-xs font-bold text-[var(--pb-text-primary)]">
                                {platform.code?.charAt(0) || "?"}
                            </span>
                        )}

                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 
                            bg-[var(--pb-surface-elevated)] 
                            text-[var(--pb-text-secondary)] 
                            text-xs rounded 
                            opacity-0 group-hover:opacity-100 
                            transition-opacity whitespace-nowrap pointer-events-none 
                            border border-[var(--pb-border)]
                            shadow-lg">
                            {platform.code}
                        </span>
                    </ItemWrapper>
                );
            })}
        </Wrapper>
    );
}