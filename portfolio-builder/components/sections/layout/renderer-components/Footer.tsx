// portfolio-builder/components/sections/layout/renderer-components/Footer.tsx

"use client";

import { useCallback } from "react";
import Image from "@/src/app/components/ui/Image";
import { FooterData, NavbarData } from "@/portfolio-builder/types/layout";
import { getBackgroundStyle } from "@/portfolio-builder/components/shared/background/lib/sectionBackground";
import { socialMediaPlatforms } from "@/lib/utilities/indices/DropDownItems";
import ThemeToggle from "@/portfolio-builder/components/shared/ui/ThemeToggle";

interface FooterProps {
    data: FooterData;
    navbarData?: NavbarData;
}

interface FooterSocialLinkExtended {
    platformId: string;
    url: string;
    useIconColor?: boolean;
    customColor?: string;
}

function resolveCopyright(text?: string, showYear?: boolean): string {
    if (!text) return "";
    const year = new Date().getFullYear().toString();
    return showYear ? text.replace("{year}", year) : text.replace(" {year}", "").replace("{year}", "");
}

function getScrollContainer(el: HTMLElement): HTMLElement {
    let node: HTMLElement | null = el.parentElement;
    while (node && node !== document.body) {
        const { overflowY, overflow } = window.getComputedStyle(node);
        const isScrollable = /(auto|scroll)/.test(overflowY + overflow);
        if (isScrollable && node.scrollHeight > node.clientHeight) return node;
        node = node.parentElement;
    }
    return document.documentElement;
}

export default function Footer({ data, navbarData }: FooterProps) {
    if (!data.enabled) return null;

    const bgStyle = data.background ? getBackgroundStyle(data.background) : {};

    const containerStyle: React.CSSProperties = {
        ...bgStyle,
        position: "relative",
        isolation: "isolate",
        paddingLeft: data.paddingX ?? 24,
        paddingRight: data.paddingX ?? 24,
        paddingTop: data.paddingY ?? 40,
        paddingBottom: data.paddingY ?? 40,
        borderTop: data.borderTop
            ? `1px solid ${data.borderColor ?? "var(--pb-border)"}`
            : undefined,
        color: data.textColor ?? "var(--pb-text-secondary)",
        backdropFilter: data.blur ? "blur(12px)" : undefined,
    };

    const copyright = resolveCopyright(data.copyrightText, data.showYear);
    const visibleLinks = (navbarData?.sectionLinks ?? []).filter((l) => l.visible);
    const socialLinks = (data.socialLinks ?? []) as FooterSocialLinkExtended[];

    const handleLinkClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>, sectionType: string) => {
            e.preventDefault();
            const element = document.getElementById(sectionType);
            if (!element) return;

            const navbarHeight =
                navbarData?.position === "fixed" || navbarData?.position === "absolute"
                    ? (navbarData.paddingY ?? 16) * 2 + 24 + (navbarData.marginY ?? 0) * 2
                    : 0;

            const behavior = (navbarData?.scrollBehavior ?? "smooth") as ScrollBehavior;
            const scrollContainer = getScrollContainer(element);

            if (scrollContainer === document.documentElement || scrollContainer === document.body) {
                window.scrollTo({
                    top: element.getBoundingClientRect().top + window.scrollY - navbarHeight,
                    behavior,
                });
            } else {
                scrollContainer.scrollTo({
                    top: element.offsetTop - navbarHeight,
                    behavior,
                });
            }

            window.history.replaceState(null, "", `#${sectionType}`);
            const clearHash = () => window.history.replaceState(null, "", window.location.pathname);
            if (behavior === "instant" || behavior === "auto") {
                clearHash();
            } else {
                setTimeout(clearHash, 600);
            }
        },
        [navbarData?.scrollBehavior, navbarData?.paddingY, navbarData?.position, navbarData?.marginY]
    );

    const scopedVars = data.background
        ? ({
            "--pb-text-primary": data.textColor ?? "inherit",
            "--pb-text-secondary": data.textColor ?? "inherit",
            "--pb-text-muted": data.mutedColor ?? data.textColor ?? "inherit",
        } as React.CSSProperties)
        : {};

    // ── Logo renderer ─────────────────────────────────────────────────────────
    const renderLogo = () => {
        if (!data.showLogo) return null;
        const logoHeight = data.logoSize ?? 32;
        return (
            <a href="#hero" onClick={(e) => handleLinkClick(e, "hero")} className="flex items-center shrink-0">
                {data.logoType === "image" && data.logoImageUrl ? (
                    <Image
                        src={data.logoImageUrl}
                        alt={data.logoText ?? "Logo"}
                        width={logoHeight * 3} // Assuming typical logo aspect ratio of 3:1
                        height={logoHeight}
                        style={{ height: logoHeight, width: 'auto' }}
                        className="object-contain"
                    />
                ) : (
                    <span className="font-semibold text-lg" style={{ color: data.textColor ?? "var(--pb-text-primary)" }}>
                        {data.logoText ?? "Portfolio"}
                    </span>
                )}
            </a>
        );
    };

    // ── Social links renderer ───────────────────────────────────────────────
    const renderSocialLinks = () => {
        if (!data.showSocial || socialLinks.length === 0) return null;
        return (
            <div className="flex items-center gap-3">
                {socialLinks.map((link, i) => {
                    const platform = socialMediaPlatforms.find((p) => p.id === link.platformId);
                    if (!platform || !link.url?.trim()) return null;

                    const iconColor = link.useIconColor !== false
                        ? platform.color
                        : (link.customColor || "var(--pb-foreground)");

                    return (
                        <a
                            key={`${link.platformId}-${i}`}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative flex items-center justify-center w-9 h-9 rounded-full
                                bg-[var(--pb-surface-elevated)]
                                border border-[var(--pb-border)]
                                hover:bg-[var(--pb-surface-hover)]
                                hover:border-[var(--pb-foreground-30)]
                                transition-all duration-300"
                            title={platform.code}
                        >
                            {platform.icon && (
                                <platform.icon
                                    className="w-4 h-4 transition-colors duration-300"
                                    style={{ color: iconColor }}
                                />
                            )}
                            {!platform.icon && (
                                <span className="text-xs font-bold text-[var(--pb-text-primary)]">
                                    {platform.code?.charAt(0) || "?"}
                                </span>
                            )}
                            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5
                                bg-[var(--pb-surface-elevated)]
                                text-[var(--pb-text-secondary)]
                                text-[10px] rounded
                                opacity-0 group-hover:opacity-100
                                transition-opacity whitespace-nowrap pointer-events-none
                                border border-[var(--pb-border)]">
                                {platform.code}
                            </span>
                        </a>
                    );
                })}
            </div>
        );
    };

    // ── Navigation links renderer ─────────────────────────────────────────────
    const renderNavLinks = (className = "") => (
        visibleLinks.length > 0 ? (
            <div className={`flex items-center gap-4 flex-wrap ${className}`}>
                {visibleLinks.map((link) => (
                    <a
                        key={link.sectionType}
                        href={`#${link.sectionType}`}
                        onClick={(e) => handleLinkClick(e, link.sectionType)}
                        className="text-sm transition-colors hover:opacity-100 hover:text-[var(--pb-text-primary)]"
                        style={{ color: data.linkColor ?? "var(--pb-text-muted)" }}
                    >
                        {link.label}
                    </a>
                ))}
            </div>
        ) : null
    );

    // ── Theme toggle renderer ─────────────────────────────────────────────────
    const renderThemeToggle = () => {
        if (!data.showThemeToggle) return null;
        return <ThemeToggle size="sm" />;
    };

    // ── Copyright renderer ──────────────────────────────────────────────────────
    const renderCopyright = () => (
        <p className="text-sm" style={{ color: data.mutedColor ?? "var(--pb-text-muted)" }}>
            {copyright}
        </p>
    );

    // ── Tagline renderer ──────────────────────────────────────────────────────
    const renderTagline = () => {
        if (!data.tagline) return null;
        return (
            <p className="text-sm max-w-md" style={{ color: data.mutedColor ?? "var(--pb-text-muted)" }}>
                {data.tagline}
            </p>
        );
    };

    // ── Layout variants ─────────────────────────────────────────────────────────

    // Minimal: copyright only
    if (data.layout === "minimal") {
        return (
            <footer style={{ ...containerStyle, ...scopedVars }}>
                <div className="max-w-7xl mx-auto flex items-center justify-center">
                    {renderCopyright()}
                </div>
            </footer>
        );
    }

    // Centered: stacked, centered
    if (data.layout === "centered") {
        return (
            <footer style={{ ...containerStyle, ...scopedVars }}>
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-center">
                    {renderLogo()}
                    {renderTagline()}
                    {renderNavLinks("justify-center")}
                    {renderSocialLinks()}
                    <div className="flex items-center gap-3">
                        {renderThemeToggle()}
                        {renderCopyright()}
                    </div>
                </div>
            </footer>
        );
    }

    // Columns: multi-column grid
    if (data.layout === "columns") {
        return (
            <footer style={{ ...containerStyle, ...scopedVars }}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid gap-8 mb-10" style={{ gridTemplateColumns: `repeat(${Math.min((data.columns?.length ?? 0) + 1, 4)}, 1fr)` }}>
                        {visibleLinks.length > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold mb-3" style={{ color: data.textColor ?? "var(--pb-text-primary)" }}>
                                    Navigation
                                </h4>
                                <ul className="space-y-2">
                                    {visibleLinks.map((link) => (
                                        <li key={link.sectionType}>
                                            <a
                                                href={`#${link.sectionType}`}
                                                onClick={(e) => handleLinkClick(e, link.sectionType)}
                                                className="text-sm transition-colors hover:text-[var(--pb-text-primary)]"
                                                style={{ color: data.linkColor ?? "var(--pb-text-muted)" }}
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {data.columns?.map((col, i) => (
                            <div key={i}>
                                <h4 className="text-sm font-semibold mb-3" style={{ color: data.textColor ?? "var(--pb-text-primary)" }}>
                                    {col.heading}
                                </h4>
                                <ul className="space-y-2">
                                    {col.links.map((link, j) => (
                                        <li key={j}>
                                            <a
                                                href={link.href}
                                                target={link.openInNewTab ? "_blank" : undefined}
                                                rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                                                className="text-sm transition-colors hover:text-[var(--pb-text-primary)]"
                                                style={{ color: data.linkColor ?? "var(--pb-text-muted)" }}
                                            >
                                                {link.label}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: data.borderColor ?? "var(--pb-border)" }}>
                        {renderCopyright()}
                        <div className="flex items-center gap-3">
                            {renderSocialLinks()}
                            {renderThemeToggle()}
                        </div>
                    </div>
                </div>
            </footer>
        );
    }

    // Branded: logo + social + links (horizontal)
    if (data.layout === "branded") {
        return (
            <footer style={{ ...containerStyle, ...scopedVars }}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-8">
                        <div className="flex flex-col gap-3">
                            {renderLogo()}
                            {renderTagline()}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                            {renderNavLinks()}
                            {renderSocialLinks()}
                            {renderThemeToggle()}
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: data.borderColor ?? "var(--pb-border)" }}>
                        {renderCopyright()}
                    </div>
                </div>
            </footer>
        );
    }

    // Compact: horizontal, space-efficient
    if (data.layout === "compact") {
        return (
            <footer style={{ ...containerStyle, ...scopedVars }}>
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {renderLogo()}
                        {renderCopyright()}
                    </div>
                    <div className="flex items-center gap-4">
                        {renderNavLinks()}
                        {renderSocialLinks()}
                        {renderThemeToggle()}
                    </div>
                </div>
            </footer>
        );
    }

    // Simple (default): tagline + links + copyright + social
    return (
        <footer style={{ ...containerStyle, ...scopedVars }}>
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {renderLogo()}
                    {renderTagline()}
                </div>
                <div className="flex items-center gap-4 flex-wrap justify-center">
                    {renderNavLinks()}
                    {renderSocialLinks()}
                    {renderThemeToggle()}
                </div>
                {renderCopyright()}
            </div>
        </footer>
    );
}