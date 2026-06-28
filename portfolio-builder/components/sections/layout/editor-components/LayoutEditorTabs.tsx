// portfolio-builder/components/sections/layout/editor-components/LayoutEditorTabs.tsx

"use client";

type LayoutTab = "navbar" | "footer" | "background" | "theme" | "links";

interface LayoutEditorTabsProps {
    activeTab: LayoutTab;
    onChange: (tab: LayoutTab) => void;
}

const TABS: { id: LayoutTab; label: string; icon: string }[] = [
    { id: "navbar", label: "Navbar", icon: "☰" },
    { id: "footer", label: "Footer", icon: "▬" },
    { id: "links", label: "Links", icon: "🔗" },
    { id: "background", label: "Background", icon: "◈" },
    { id: "theme", label: "Theme", icon: "◐" },
];

export default function LayoutEditorTabs({ activeTab, onChange }: LayoutEditorTabsProps) {
    return (
        <div className="flex border-b border-[var(--pb-border)] bg-[var(--pb-surface)]">
            {TABS.map(({ id, label, icon }) => (
                <button
                    key={id}
                    type="button"
                    onClick={() => onChange(id)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === id
                        ? "border-[var(--pb-foreground)] text-[var(--pb-text-primary)]"
                        : "border-transparent text-[var(--pb-text-muted)] hover:text-[var(--pb-text-secondary)] hover:bg-[var(--pb-surface-hover)]"
                        }`}
                >
                    <span className="text-xs">{icon}</span>
                    {label}
                </button>
            ))}
        </div>
    );
}

export type { LayoutTab };