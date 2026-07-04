// portfolio-builder/components/sections/layout/editor-components/LayoutEditorTabs.tsx

"use client";

import { Link, PanelTop, PanelBottom, Brush, Palette } from "lucide-react";

type LayoutTab = "navbar" | "footer" | "background" | "theme" | "links";

interface LayoutEditorTabsProps {
    activeTab: LayoutTab;
    onChange: (tab: LayoutTab) => void;
}

const TABS: { id: LayoutTab; label: string; icon: React.ReactNode }[] = [
    { id: "links", label: "Links", icon: <Link size={16} /> },
    { id: "navbar", label: "Navbar", icon: <PanelTop size={16} /> },
    { id: "footer", label: "Footer", icon: <PanelBottom size={16} /> },
    { id: "theme", label: "Theme", icon: <Palette size={16} /> },
    { id: "background", label: "Background", icon: <Brush size={16} /> },
];

export default function LayoutEditorTabs({ activeTab, onChange }: LayoutEditorTabsProps) {
    return (
        <div className="flex border-b border-[var(--pb-border)] bg-[var(--pb-primary)]">
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
                    {icon}
                    {label}
                </button>
            ))}
        </div>
    );
}

export type { LayoutTab };