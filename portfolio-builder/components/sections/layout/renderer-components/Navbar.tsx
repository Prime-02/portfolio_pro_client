// portfolio-builder/components/sections/layout/renderer-components/Navbar.tsx

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NavbarData } from "@/portfolio-builder/types/layout";
import { getBackgroundStyle } from "@/portfolio-builder/lib/sectionBackground";
import { CTAButton } from "@/portfolio-builder/components/sections/bio/renderer-components/CTAButton";
import { BioCTA } from "@/portfolio-builder/types/bio";
import ThemeToggle from "@/portfolio-builder/components/shared/ui/ThemeToggle";

interface NavbarProps {
    data: NavbarData;
}

// ── Scroll container helper (same as used in Footer) ─────────────────────────
function getScrollContainer(el: HTMLElement): HTMLElement {
    let node: HTMLElement | null = el.parentElement;
    while (node && node !== document.body) {
        const { overflowY, overflow } = window.getComputedStyle(node);
        if (/(auto|scroll)/.test(overflowY + overflow) && node.scrollHeight > node.clientHeight) return node;
        node = node.parentElement;
    }
    return document.documentElement;
}

// ── Hamburger icon ────────────────────────────────────────────────────────────
function HamburgerIcon({ open }: { open: boolean }) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <rect
                x="2" y={open ? "9" : "4"}
                width="16" height="2" rx="1"
                fill="currentColor"
                className="transition-all duration-300 origin-center"
                style={{ transform: open ? "rotate(45deg)" : "none" }}
            />
            <rect
                x="2" y="9"
                width="16" height="2" rx="1"
                fill="currentColor"
                className="transition-all duration-200"
                style={{ opacity: open ? 0 : 1 }}
            />
            <rect
                x="2" y={open ? "9" : "14"}
                width="16" height="2" rx="1"
                fill="currentColor"
                className="transition-all duration-300 origin-center"
                style={{ transform: open ? "rotate(-45deg)" : "none" }}
            />
        </svg>
    );
}

export default function Navbar({ data }: NavbarProps) {
    if (!data.enabled) return null;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const drawerRef = useRef<HTMLDivElement>(null);

    const visibleLinks = (data.sectionLinks ?? []).filter((l) => l.visible);
    const ctaButtons: BioCTA[] = (data.ctaButtons as BioCTA[] | undefined) ?? [];
    const showMobileMenu = data.mobileMenu ?? true;

    // ── Active section via IntersectionObserver ───────────────────────────────
    useEffect(() => {
        const sectionIds = visibleLinks.map((l) => l.sectionType);
        const elements = sectionIds
            .map((id) => document.getElementById(id))
            .filter(Boolean) as HTMLElement[];

        if (elements.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                // Pick the entry that is most in view
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible.length > 0) {
                    setActiveSection(visible[0].target.id);
                }
            },
            { threshold: [0.2, 0.5], rootMargin: "-10% 0px -10% 0px" }
        );

        elements.forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [visibleLinks]);

    // ── Close drawer on outside click ─────────────────────────────────────────
    // Backdrop click handles this; no need for document listener
    // (prevents double-fire with close button onClick)

    // ── Lock body scroll when drawer is open ──────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    // ── Scroll handler ────────────────────────────────────────────────────────
    const handleNavClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>, sectionType: string) => {
            e.preventDefault();
            setMobileOpen(false);

            const element = document.getElementById(sectionType);
            if (!element) return;

            const navbarHeight =
                data.position === "fixed" || data.position === "absolute"
                    ? (data.paddingY ?? 16) * 2 + 24 + (data.marginY ?? 0) * 2
                    : 0;

            const scrollContainer = getScrollContainer(element);
            const behavior = (data.scrollBehavior ?? "smooth") as ScrollBehavior;

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
        [data.scrollBehavior, data.paddingY, data.position, data.marginY]
    );

    // ── Styles ────────────────────────────────────────────────────────────────
    const bgStyle = data.background ? getBackgroundStyle(data.background) : {};

    const containerStyle: React.CSSProperties = {
        ...bgStyle,
        backdropFilter: data.blur ? "blur(12px)" : undefined,
        WebkitBackdropFilter: data.blur ? "blur(12px)" : undefined,
        paddingLeft: data.paddingX ?? 24,
        paddingRight: data.paddingX ?? 24,
        paddingTop: data.paddingY ?? 16,
        paddingBottom: data.paddingY ?? 16,
        marginLeft: data.marginX ?? 0,
        marginRight: data.marginX ?? 0,
        marginTop: data.marginY ?? 0,
        marginBottom: data.marginY ?? 0,
        borderRadius: data.borderRadius ?? 0,
        borderBottom: data.borderBottom
            ? `1px solid ${data.borderColor ?? "var(--pb-border)"}`
            : undefined,
        color: data.textColor ?? "var(--pb-text-primary)",
        // Expose link colors as CSS vars so hover works without inline JS
        ["--navbar-link-color" as string]: data.linkColor ?? "var(--pb-text-secondary)",
        ["--navbar-link-hover" as string]: data.linkHoverColor ?? "var(--pb-text-primary)",
    };

    const positionClass =
        data.position === "fixed"
            ? "fixed top-0 left-0 right-0 z-[100]"
            : data.position === "sticky"
                ? "sticky top-0 z-[100]"
                : data.position === "absolute"
                    ? "absolute top-0 left-0 right-0 z-[100]"
                    : "relative z-10";

    // ── Link renderer ─────────────────────────────────────────────────────────
    const renderLinks = (mobile = false) =>
        visibleLinks.map((link) => {
            const isActive = activeSection === link.sectionType;
            return (
                <li key={link.sectionType} className={mobile ? "w-full" : ""}>
                    <a
                        href={`#${link.sectionType}`}
                        onClick={(e) => handleNavClick(e, link.sectionType)}
                        className={`
                            navbar-link text-sm transition-colors
                            ${mobile
                                ? "block w-full px-4 py-3 rounded-lg hover:bg-[var(--pb-surface-hover)]"
                                : "inline-block"}
                            ${isActive
                                ? "text-[var(--pb-text-primary)] font-medium"
                                : ""}
                        `}
                        style={{
                            color: isActive
                                ? (data.linkHoverColor ?? "var(--pb-text-primary)")
                                : (data.linkColor ?? "var(--pb-text-secondary)"),
                        }}
                        aria-current={isActive ? "page" : undefined}
                    >
                        {link.label}
                        {isActive && !mobile && (
                            <span className="block h-0.5 mt-0.5 rounded-full bg-current opacity-60" />
                        )}
                    </a>
                </li>
            );
        });

    // ── CTA renderer ──────────────────────────────────────────────────────────
    const renderCTAs = (mobile = false) =>
        ctaButtons.map((btn, i) => (
            <CTAButton
                key={i}
                label={btn.label}
                url={btn.url}
                variant={btn.variant}
                openInNewTab={btn.openInNewTab}
                className={mobile ? "w-full justify-center" : ""}
            />
        ));

    // ── Theme toggle renderer ───────────────────────────────────────────────
    const renderThemeToggle = () => {
        if (!data.showThemeToggle) return null;
        return <ThemeToggle size="sm" />;
    };

    // ── Logo renderer ─────────────────────────────────────────────────────────
    const renderLogo = () => {
        if (!data.showLogo) return null;
        return (
            <a
                href="#hero"
                className="flex items-center shrink-0"
                onClick={(e) => handleNavClick(e, "hero")}
            >
                {data.logoType === "image" && data.logoImageUrl ? (
                    <img
                        src={data.logoImageUrl}
                        alt={data.logoText ?? "Logo"}
                        style={{ height: data.logoSize ?? 32 }}
                        className="object-contain"
                    />
                ) : (
                    <span
                        className="font-semibold text-lg"
                        style={{ color: data.textColor ?? "var(--pb-text-primary)" }}
                    >
                        {data.logoText ?? "Portfolio"}
                    </span>
                )}
            </a>
        );
    };

    // ── Layout variants ───────────────────────────────────────────────────────

    // Centered: logo centered above links (or logo between links on desktop)
    const isCentered = data.layout === "centered";
    // Minimal: no logo, no CTA, links only
    const isMinimal = data.layout === "minimal";
    // Sidebar (logo-left links-center): logo left, links centered, CTAs right
    const isSidebar = data.layout === "sidebar";
    // Default: logo left, links + CTAs right
    const isDefault = !isCentered && !isMinimal && !isSidebar;

    return (
        <>
            <nav
                className={`${positionClass} ${(data.marginX ?? 0) > 0 ? "" : "w-full"}`}
                style={{
                    ...containerStyle,
                    width: (data.marginX ?? 0) > 0 ? `calc(100% - ${(data.marginX ?? 0) * 2}px)` : undefined,
                }}
            >
                <div className="max-w-7xl mx-auto">

                    {/* ── Centered layout ─────────────────────────────────── */}
                    {isCentered && (
                        <div className="flex items-center justify-center gap-4">
                            {renderLogo()}
                            <div className="hidden md:flex items-center gap-5">
                                {visibleLinks.length > 0 && (
                                    <ul className="flex items-center gap-5">
                                        {renderLinks()}
                                    </ul>
                                )}
                                {ctaButtons.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        {renderCTAs()}
                                    </div>
                                )}
                                {renderThemeToggle()}
                            </div>
                            <div className="flex items-center gap-2 md:hidden">
                                {renderThemeToggle()}
                                {showMobileMenu && (
                                    <button
                                        type="button"
                                        onClick={() => setMobileOpen((o) => !o)}
                                        className="p-1.5 rounded-md hover:bg-[var(--pb-surface-hover)] transition-colors"
                                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                                        aria-expanded={mobileOpen}
                                        style={{ color: data.textColor ?? "var(--pb-text-primary)" }}
                                    >
                                        <HamburgerIcon open={mobileOpen} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Minimal layout ──────────────────────────────────── */}
                    {isMinimal && (
                        <div className="flex items-center justify-center gap-5">
                            <div className="hidden md:flex items-center gap-5">
                                <ul className="flex items-center gap-5">
                                    {renderLinks()}
                                </ul>
                                {renderThemeToggle()}
                            </div>
                            <div className="flex items-center gap-2 md:hidden">
                                {renderThemeToggle()}
                                {showMobileMenu && (
                                    <button
                                        type="button"
                                        onClick={() => setMobileOpen((o) => !o)}
                                        className="p-1.5 rounded-md hover:bg-[var(--pb-surface-hover)] transition-colors"
                                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                                        aria-expanded={mobileOpen}
                                        style={{ color: data.textColor ?? "var(--pb-text-primary)" }}
                                    >
                                        <HamburgerIcon open={mobileOpen} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Sidebar layout (logo-left · links-center · cta-right) */}
                    {isSidebar && (
                        <div className="flex items-center justify-between gap-4">
                            {renderLogo()}
                            <ul className="hidden md:flex items-center gap-5 flex-1 justify-center">
                                {renderLinks()}
                            </ul>
                            <div className="hidden md:flex items-center gap-2 shrink-0">
                                {ctaButtons.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        {renderCTAs()}
                                    </div>
                                )}
                                {renderThemeToggle()}
                            </div>
                            <div className="flex items-center gap-2 md:hidden">
                                {renderThemeToggle()}
                                {showMobileMenu && (
                                    <button
                                        type="button"
                                        onClick={() => setMobileOpen((o) => !o)}
                                        className="p-1.5 rounded-md hover:bg-[var(--pb-surface-hover)] transition-colors"
                                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                                        aria-expanded={mobileOpen}
                                        style={{ color: data.textColor ?? "var(--pb-text-primary)" }}
                                    >
                                        <HamburgerIcon open={mobileOpen} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── Default layout (logo-left · links+cta-right) ─────── */}
                    {isDefault && (
                        <div className="flex items-center justify-between gap-4">
                            {renderLogo()}
                            <div className="hidden md:flex items-center gap-5">
                                <ul className="flex items-center gap-5">
                                    {renderLinks()}
                                </ul>
                                {ctaButtons.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        {renderCTAs()}
                                    </div>
                                )}
                                {renderThemeToggle()}
                            </div>
                            <div className="flex items-center gap-2 md:hidden">
                                {renderThemeToggle()}
                                {showMobileMenu && (
                                    <button
                                        type="button"
                                        onClick={() => setMobileOpen((o) => !o)}
                                        className="p-1.5 rounded-md hover:bg-[var(--pb-surface-hover)] transition-colors"
                                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                                        aria-expanded={mobileOpen}
                                        style={{ color: data.textColor ?? "var(--pb-text-primary)" }}
                                    >
                                        <HamburgerIcon open={mobileOpen} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* ── Mobile drawer ─────────────────────────────────────────────── */}
            {showMobileMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                            }`}
                        aria-hidden="true"
                        onClick={() => setMobileOpen(false)}
                    />

                    {/* Drawer panel */}
                    <div
                        ref={drawerRef}
                        onClick={(e) => e.stopPropagation()}
                        className={`fixed top-0 right-0 bottom-0 z-[101] w-72 max-w-[85vw] bg-[var(--pb-background)] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${mobileOpen ? "translate-x-0" : "translate-x-full"
                            }`}
                        style={{ color: data.textColor ?? "var(--pb-text-primary)" }}
                        aria-label="Mobile navigation"
                    >
                        {/* Drawer header */}
                        <div
                            className="flex items-center justify-between px-5 py-4 border-b border-[var(--pb-border)] shrink-0"
                            style={{
                                ...(data.background ? getBackgroundStyle(data.background) : {}),
                                backdropFilter: data.blur ? "blur(12px)" : undefined,
                            }}
                        >
                            {renderLogo()}
                            <button
                                type="button"
                                onClick={() => setMobileOpen(false)}
                                className="p-1.5 rounded-md hover:bg-[var(--pb-surface-hover)] transition-colors ml-auto"
                                aria-label="Close menu"
                                style={{ color: data.textColor ?? "var(--pb-text-primary)" }}
                            >
                                <HamburgerIcon open={true} />
                            </button>
                        </div>

                        {/* Drawer links */}
                        <nav className="flex-1 overflow-y-auto px-4 py-4">
                            <ul className="flex flex-col gap-1">
                                {renderLinks(true)}
                            </ul>
                        </nav>

                        {/* Drawer CTAs */}
                        {ctaButtons.length > 0 && (
                            <div className="px-4 py-4 border-t border-[var(--pb-border)] flex flex-col gap-2 shrink-0">
                                {renderCTAs(true)}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* CSS for hover — avoids inline JS onMouseEnter/Leave */}
            <style>{`
                .navbar-link {
                    color: var(--navbar-link-color, var(--pb-text-secondary));
                    transition: color 0.15s ease;
                }
                .navbar-link:hover {
                    color: var(--navbar-link-hover, var(--pb-text-primary));
                }
            `}</style>
        </>
    );
}