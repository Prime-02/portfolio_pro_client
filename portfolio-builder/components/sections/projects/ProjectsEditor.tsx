// portfolio-builder/components/sections/projects/ProjectsEditor.tsx

"use client";

import { useState, useMemo } from "react";
import { RefreshCw, Check } from "lucide-react";
import { ProjectsData, getEmptyProjectsData } from "@/portfolio-builder/types/projects";
import type { BioAnimations } from "@/portfolio-builder/types/bio";
import {
  ProjectsFilterTab,
  ProjectsCardLayoutTab,
  ProjectsLayoutTab,
  ProjectsBackgroundTab,
  ProjectsAnimationsTab,
  ProjectsCTATab,
  ProjectsEditorTabs,
} from "./editor-components";
import ProjectsRenderer from "./ProjectsRenderer";

// ---------------------------------------------------------------------------
// Deep merge with defaults to handle missing/legacy keys
// ---------------------------------------------------------------------------
function mergeWithDefaults(partial: ProjectsData): ProjectsData {
  const defaults = getEmptyProjectsData();

  return {
    ...defaults,
    ...partial,
    // Deep merge nested objects to preserve new default fields
    filters: { ...defaults.filters, ...partial.filters },
    padding: partial.padding
      ? { ...defaults.padding, ...partial.padding }
      : defaults.padding,
    background: partial.background
      ? { ...defaults.background, ...partial.background }
      : defaults.background,
    animations: partial.animations
      ? { ...defaults.animations, ...partial.animations }
      : defaults.animations,
    // Arrays are preserved as-is (no merge needed)
    cardOverrides: partial.cardOverrides ?? defaults.cardOverrides,
    ctaButtons: partial.ctaButtons ?? defaults.ctaButtons,
  };
}

interface ProjectsEditorProps {
  // Fully controlled: `data` is the live value owned by PortfolioMain (via
  // the store). Every field updater below computes the next value and
  // hands it straight back via onChange. PortfolioMain's autosave flush is
  // what eventually persists it.
  data: ProjectsData;
  onChange: (data: ProjectsData) => void;
  onDone: () => void;
  username: string;
}

export default function ProjectsEditor({
  data,
  onChange,
  onDone,
  username,
}: ProjectsEditorProps) {
  const resolved = useMemo(() => mergeWithDefaults(data), [data]);

  const [activeTab, setActiveTab] = useState<
    "filters" | "card-layout" | "layout" | "background" | "animations" | "cta"
  >("filters");

  // ── Animation replay counter — purely a preview concern, stays local ────
  const [animationKey, setAnimationKey] = useState(0);

  // ── Field updaters ───────────────────────────────────────────────────────
  const updateField = <K extends keyof ProjectsData>(key: K, value: ProjectsData[K]) => {
    onChange({ ...resolved, [key]: value });
  };

  const updateFilters = (value: Partial<ProjectsData["filters"]>) => {
    onChange({ ...resolved, filters: { ...resolved.filters, ...value } });
  };

  const updateBackground = (value: Partial<ProjectsData["background"]>) => {
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
        return <ProjectsFilterTab data={resolved} onUpdate={updateFilters} />;
      case "card-layout":
        return <ProjectsCardLayoutTab data={resolved} onChange={updateField} />;
      case "layout":
        return <ProjectsLayoutTab data={resolved} onChange={updateField} />;
      case "background":
        return (
          <ProjectsBackgroundTab
            data={resolved}
            onUpdate={updateBackground}
          />
        );
      case "animations":
        return <ProjectsAnimationsTab data={resolved} onUpdate={updateAnimations} />;
      case "cta":
        return <ProjectsCTATab data={resolved} onChange={updateField} />;
      default:
        return null;
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Editor panel */}
      <div className="h-fit flex-1 flex bg-[var(--pb-background)] flex-col min-w-0 border border-[var(--pb-border)] rounded-xl overflow-hidden">
        <ProjectsEditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

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
          <ProjectsRenderer
            data={resolved}
            username={username}
            animationKey={animationKey}
          />
        </div>
      </div>
    </div>
  );
}