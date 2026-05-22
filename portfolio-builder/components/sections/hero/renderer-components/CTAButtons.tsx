// portfolio-builder/components/sections/hero/renderer-components/CTAButtons.tsx

import type { HeroData, CTAColorOverride } from "@/portfolio-builder/types/hero";

interface CTAButtonsProps {
    buttons: NonNullable<HeroData["ctaButtons"]>;
    className?: string;
    alignment?: string;
}

export function CTAButtons({ buttons, className, alignment }: CTAButtonsProps) {
    const justifyClass = alignment === "left" ? "justify-start" : "justify-start";
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
    const base =
        "inline-flex items-center px-6 py-3 rounded-lg font-medium text-sm transition-colors";
    switch (variant) {
        case "secondary":
            return `${base} bg-neutral-700 text-white hover:bg-neutral-600`;
        case "outline":
            return `${base} border border-neutral-500 text-white hover:bg-neutral-800`;
        case "ghost":
            return `${base} text-neutral-300 hover:text-white hover:bg-neutral-800`;
        case "link":
            return `${base} text-neutral-300 hover:text-white underline underline-offset-4`;
        case "primary":
        default:
            return `${base} bg-white text-black hover:bg-neutral-200`;
    }
}

/**
 * Converts CTAColorOverride into a React.CSSProperties object.
 * Inline styles take precedence over Tailwind classes so overrides always win.
 * Border needs both `borderColor` and `borderStyle`/`borderWidth` set,
 * otherwise it's invisible on variants that don't have a border class.
 */
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