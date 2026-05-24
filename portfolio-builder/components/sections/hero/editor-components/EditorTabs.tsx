// portfolio-builder/components/sections/hero/editor-components/EditorTabs.tsx

interface EditorTabsProps {
    activeTab: string;
    onTabChange: (
        tab: "content" | "layout" | "media" | "background" | "cta" | "effects" | "animations" | "social"
    ) => void;
}

const tabs = [
    { key: "content", label: "Content" },
    { key: "layout", label: "Layout" },
    { key: "media", label: "Media" },
    { key: "background", label: "Background" },
    { key: "cta", label: "CTA Buttons" },
    { key: "social", label: "Social Links" },
    { key: "effects", label: "Effects" },
    { key: "animations", label: "✦ Animations" },
] as const;

export default function EditorTabs({ activeTab, onTabChange }: EditorTabsProps) {
    return (
        <div className="flex border-b border-[var(--pb-border)] overflow-x-auto bg-[var(--pb-surface)]">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onTabChange(tab.key)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.key
                        ? "text-[var(--pb-text-primary)] border-b-2 border-[var(--pb-foreground)]"
                        : "text-[var(--pb-text-secondary)] hover:text-[var(--pb-text-primary)]"
                        }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}