// portfolio-builder/components/sections/skills/SkillsEditor.tsx

"use client";

import { useState, useMemo } from "react";
import { RefreshCw, Check } from "lucide-react";
import { SkillsData, getEmptySkillsData } from "@/portfolio-builder/types/skills";
import type { BioAnimations } from "@/portfolio-builder/types/bio";
import {
  CardLayoutTab,
  SkillsLayoutTab,
  SkillsBackgroundTab,
  SkillsAnimationsTab,
  SkillsCTATab,
  SkillsFilterTab,
  SkillsEditorTabs,
} from "./editor-components";
import SkillsRenderer from "./SkillsRenderer";

// Field-level merge so missing/legacy keys fall back to defaults, whether
// data is absent entirely or just missing newer fields.
function mergeWithDefaults(partial?: SkillsData | null): SkillsData {
  const defaults = getEmptySkillsData();
  if (!partial) return defaults;

  return {
    ...defaults,
    ...partial,
    filters: { ...defaults.filters, ...partial.filters },
    background: { ...defaults.background, ...partial.background },
    animations: { ...defaults.animations, ...partial.animations },
    padding: { ...defaults.padding, ...partial.padding },
    cardOverrides: partial.cardOverrides ?? defaults.cardOverrides,
  };
}

interface SkillsEditorProps {
  // Fully controlled: `data` is the live value owned by PortfolioMain (via
  // the store). Every field updater below computes the next value and
  // hands it straight back via onChange. PortfolioMain's autosave flush is
  // what eventually persists it.
  data?: SkillsData | null;
  onChange: (data: SkillsData) => void;
  onDone: () => void;
  username: string;
}

export default function SkillsEditor({
  data,
  onChange,
  onDone,
  username,
}: SkillsEditorProps) {
  const resolved = useMemo(() => mergeWithDefaults(data), [data]);

  const [activeTab, setActiveTab] = useState<
    "filters" | "card-layout" | "layout" | "background" | "animations" | "cta"
  >("filters");

  // ── Animation replay counter — purely a preview concern, stays local ────
  const [animationKey, setAnimationKey] = useState(0);

  // ── Field updaters ───────────────────────────────────────────────────────
  const updateField = <K extends keyof SkillsData>(key: K, value: SkillsData[K]) => {
    onChange({ ...resolved, [key]: value });
  };

  const updateFilters = (value: Partial<SkillsData["filters"]>) => {
    onChange({ ...resolved, filters: { ...resolved.filters, ...value } });
  };

  const updateBackground = (value: Partial<SkillsData["background"]>) => {
    onChange({ ...resolved, background: { ...resolved.background, ...value } });
  };

  const updateAnimations = (value: Partial<BioAnimations>) => {
    onChange({ ...resolved, animations: { ...resolved.animations, ...value } });
    setAnimationKey((k) => k + 1);
  };

  // ── Tab content ──────────────────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case "filters":
        return <SkillsFilterTab data={resolved} onUpdate={updateFilters} />;
      case "card-layout":
        return <CardLayoutTab data={resolved} onChange={updateField} />;
      case "layout":
        return <SkillsLayoutTab data={resolved} onChange={updateField} />;
      case "background":
        return (
          <SkillsBackgroundTab
            data={resolved}
            onUpdate={updateBackground}
          />
        );
      case "animations":
        return <SkillsAnimationsTab data={resolved} onUpdate={updateAnimations} />;
      case "cta":
        return <SkillsCTATab data={resolved} onChange={updateField} />;
      default:
        return null;
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Editor panel */}
      <div className="h-fit flex-1 flex flex-col min-w-0 border border-[var(--pb-border)] rounded-xl overflow-hidden bg-[var(--pb-background)]">
        <SkillsEditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Preview panel */}
      <div className="flex-1 min-w-0 border border-[var(--pb-border)] rounded-xl overflow-hidden transition-all duration-300">
        <div className="px-4 py-2 border-b border-[var(--pb-border)] flex items-center justify-between">
          <span className="text-xs text-[var(--pb-text-muted)] uppercase tracking-wide">Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAnimationKey((k) => k + 1)}
              className="text-xs text-[var(--pb-text-secondary)] hover:text-[var(--pb-text-primary)] transition-colors flex items-center gap-1 px-2 py-1 rounded-md hover:bg-[var(--pb-surface-hover)]"
              title="Replay animation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replay
            </button>
            <button
              onClick={onDone}
              className="text-xs text-[var(--pb-text-secondary)] hover:text-[var(--pb-text-primary)] transition-colors flex items-center gap-1"
              title="Exit editing — changes autosave in the background"
            >
              <Check className="w-3.5 h-3.5" />
              Done
            </button>
          </div>
        </div>
        <div className="h-[calc(100%-37px)] overflow-y-auto">
          <SkillsRenderer
            data={resolved}
            username={username}
            animationKey={animationKey}
          />
        </div>
      </div>
    </div>
  );
}