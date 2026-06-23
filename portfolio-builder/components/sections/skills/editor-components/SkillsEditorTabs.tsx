// portfolio-builder/components/sections/skills/editor-components/SkillsEditorTabs.tsx

interface SkillsEditorTabsProps {
  activeTab: string;
  onTabChange: (
    tab: "filters" | "card-layout" | "layout" | "background" | "animations" | "cta"
  ) => void;
}

const tabs = [
  { key: "filters", label: "Filters" },
  { key: "card-layout", label: "Card Layout" },
  { key: "layout", label: "Layout" },
  { key: "background", label: "Background" },
  { key: "animations", label: "✦ Animations" },
  { key: "cta", label: "CTA" },
] as const;

export default function SkillsEditorTabs({ activeTab, onTabChange }: SkillsEditorTabsProps) {
  return (
    <div className="flex border-b border-[var(--pb-border)] overflow-x-auto bg-[var(--pb-surface)]">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === tab.key
              ? "text-[var(--pb-text-primary)] border-b-2 border-[var(--pb-foreground)]"
              : tab.key === "animations"
              ? "text-[var(--pb-text-muted)] hover:text-[var(--pb-text-secondary)]"
              : "text-[var(--pb-text-secondary)] hover:text-[var(--pb-text-primary)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
