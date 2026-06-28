"use client";

import { useState, useEffect, useRef, useContext, createContext } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ThemeMode = "light" | "dark" | "system";

// ---------------------------------------------------------------------------
// Context — the toggle is a pure UI control; it owns no theme state.
// The provider receives the current value and a setter from PortfolioMainInner
// so ThemeToggle stays in sync with ThemeTab (and any other editor) automatically.
// ---------------------------------------------------------------------------

interface ThemeToggleContextValue {
    themeVariant: ThemeMode;
    setThemeVariant: (mode: ThemeMode) => void;
}

const ThemeToggleContext = createContext<ThemeToggleContextValue | null>(null);

interface ThemeToggleProviderProps {
    themeVariant: ThemeMode;
    setThemeVariant: (mode: ThemeMode) => void;
    children: React.ReactNode;
}

/**
 * Wrap the portfolio root with this provider.
 * Pass the current themeVariant (from saved layout data) and the setter
 * (which should persist the change, e.g. via handleLayoutSave).
 * The toggle will always reflect whatever themeVariant is passed in.
 */
export function ThemeToggleProvider({
    themeVariant,
    setThemeVariant,
    children,
}: ThemeToggleProviderProps) {
    return (
        <ThemeToggleContext.Provider value={{ themeVariant, setThemeVariant }}>
            {children}
        </ThemeToggleContext.Provider>
    );
}

// ---------------------------------------------------------------------------
// Hook — must be used inside ThemeToggleProvider
// ---------------------------------------------------------------------------

export function useThemeToggle(): ThemeToggleContextValue {
    const ctx = useContext(ThemeToggleContext);
    if (!ctx) {
        throw new Error("useThemeToggle must be used within a ThemeToggleProvider");
    }
    return ctx;
}

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function SunIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
        </svg>
    );
}

function MoonIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
    );
}

function MonitorIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <rect width="20" height="14" x="2" y="3" rx="2" />
            <line x1="8" x2="16" y1="21" y2="21" />
            <line x1="12" x2="12" y1="17" y2="21" />
        </svg>
    );
}

const MODE_ICONS: Record<ThemeMode, React.FC<{ className?: string }>> = {
    light: SunIcon,
    dark: MoonIcon,
    system: MonitorIcon,
};

const MODE_LABELS: Record<ThemeMode, string> = {
    light: "Light",
    dark: "Dark",
    system: "System",
};

// ---------------------------------------------------------------------------
// Component — pure controlled UI; icon and active state always reflect the
// themeVariant passed down from PortfolioMainInner via context.
// ---------------------------------------------------------------------------

interface ThemeToggleProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const SIZE_CLASSES: Record<string, { btn: string; icon: string; menu: string }> = {
    sm: { btn: "w-7 h-7", icon: "w-3.5 h-3.5", menu: "w-36" },
    md: { btn: "w-8 h-8", icon: "w-4 h-4", menu: "w-40" },
    lg: { btn: "w-9 h-9", icon: "w-5 h-5", menu: "w-44" },
};

export default function ThemeToggle({ size = "md", className = "" }: ThemeToggleProps) {
    const { themeVariant, setThemeVariant } = useThemeToggle();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md;
    const CurrentIcon = MODE_ICONS[themeVariant];

    return (
        <div className={`relative inline-block ${className}`} ref={menuRef}>
            <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                className={`
                    ${sizeClass.btn} rounded-lg
                    flex items-center justify-center
                    transition-all duration-200
                    hover:scale-105 active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-[var(--pb-accent)] focus:ring-offset-1
                    focus:ring-offset-[var(--pb-background)]
                    text-[var(--pb-text-secondary)]
                    hover:text-[var(--pb-text-primary)]
                    hover:bg-[var(--pb-surface-hover)]
                `}
                aria-label={`Current theme: ${MODE_LABELS[themeVariant]}. Click to change.`}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
            >
                <CurrentIcon className={sizeClass.icon} />
            </button>

            {menuOpen && (
                <div
                    className={`
                        absolute top-full mt-2 right-0
                        ${sizeClass.menu}
                        bg-[var(--pb-background)]
                        border border-[var(--pb-border)]
                        rounded-xl shadow-xl
                        py-1.5 px-1
                        flex flex-col gap-0.5
                        z-50
                    `}
                    role="menu"
                >
                    {(["light", "dark", "system"] as ThemeMode[]).map((m) => {
                        const Icon = MODE_ICONS[m];
                        const isActive = themeVariant === m;
                        return (
                            <button
                                key={m}
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                    setThemeVariant(m);
                                    setMenuOpen(false);
                                }}
                                className={`
                                    flex items-center gap-2.5 w-full px-3 py-2 rounded-lg
                                    text-sm transition-colors
                                    ${isActive
                                        ? "bg-[var(--pb-foreground-10)] text-[var(--pb-text-primary)] font-medium"
                                        : "text-[var(--pb-text-secondary)] hover:bg-[var(--pb-surface-hover)]"
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4 shrink-0" />
                                <span>{MODE_LABELS[m]}</span>
                                {isActive && (
                                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--pb-foreground)]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}