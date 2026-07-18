// portfolio-builder/components/sections/hero/renderer-components/CTAButtons.tsx

import type { HeroData, CTAColorOverride } from "@/portfolio-builder/types/hero";
import { ResolvedTheme } from "@/portfolio-builder/hooks/usePortfolioTheme";

interface CTAButtonsProps {
    buttons: NonNullable<HeroData["ctaButtons"]>;
    className?: string;
    alignment?: string;
    theme: ResolvedTheme;
}

export function CTAButtons({ buttons, className, alignment, theme }: CTAButtonsProps) {
    const justifyClass =
        alignment === "right" ? "justify-end" :
            alignment === "center" ? "justify-center" :
                "justify-start";
    return (
        <div className={`flex flex-wrap gap-4 ${justifyClass} ${className ?? ""}`}>
            {buttons.map((btn, index) => (
                <a
                    key={index}
                    href={btn.url}
                    target={btn.openInNewTab ? "_blank" : undefined}
                    rel={btn.openInNewTab ? "noopener noreferrer" : undefined}
                    className={getCTAButtonClass(btn.variant)}
                    style={resolveColorOverride(btn.colorOverride)}
                >
                    {btn.label}
                </a>
            ))}
        </div>
    );
}

function getCTAButtonClass(variant?: string): string {
    const base = "inline-flex items-center px-6 py-3 rounded-lg font-medium text-sm transition-colors";

    switch (variant) {
        case "secondary":
            return `${base} bg-[var(--pb-accent-10)] text-[var(--pb-accent)] hover:bg-[var(--pb-accent-20)]`;
        case "outline":
            return `${base} border border-[var(--pb-accent-30)] text-[var(--pb-accent)] hover:bg-[var(--pb-accent-10)]`;
        case "ghost":
            return `${base} text-[var(--pb-accent)] hover:bg-[var(--pb-accent-10)]`;
        case "link":
            return `${base} text-[var(--pb-accent)] hover:underline underline-offset-4 px-0 py-0`;
        case "primary":
        default:
            return `${base} bg-[var(--pb-accent)] text-white hover:opacity-90`;
    }
}

function resolveColorOverride(
    override?: CTAColorOverride,
): React.CSSProperties | undefined {
    if (!override || (!override.bg && !override.text && !override.border)) {
        return undefined;
    }

    const style: React.CSSProperties = {};

    if (override.bg) style.backgroundColor = override.bg;
    if (override.text) style.color = override.text;
    if (override.border) {
        style.borderColor = override.border;
        style.borderWidth = "1px";
        style.borderStyle = "solid";
    }

    return style;
}