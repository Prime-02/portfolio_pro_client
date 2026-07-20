// portfolio-builder/components/sections/bio/BioEditor.tsx

"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import { BioData, getEmptyBioData } from "@/portfolio-builder/types/bio";
import { getDefaultAnimations } from "@/portfolio-builder/types/hero";
import type { BioAnimations } from "@/portfolio-builder/types/bio";
import {
  ContentTab,
  LayoutTab,
  CTATab,
  EditorTabs,
  AnimationsTab,
} from "./editor-components";
import BioRenderer from "@/portfolio-builder/components/sections/bio/BioRenderer";
import BackgroundTab from "@/portfolio-builder/components/shared/background/editor/BackgroundTab";

// ---------------------------------------------------------------------------
// Deep merge with defaults to handle missing/legacy keys
// ---------------------------------------------------------------------------
function mergeWithDefaults(partial: BioData): BioData {
  const defaults = getEmptyBioData();

  return {
    ...defaults,
    ...partial,
    // Deep merge nested objects to preserve new default fields
    padding: partial.padding
      ? { ...defaults.padding, ...partial.padding }
      : defaults.padding,
    status: partial.status
      ? { ...defaults.status, ...partial.status }
      : defaults.status,
    background: partial.background
      ? { ...defaults.background, ...partial.background }
      : defaults.background,
    animations: partial.animations
      ? { ...getDefaultAnimations(), ...partial.animations }
      : getDefaultAnimations(),
    fonts: partial.fonts ?? defaults.fonts,
    typography: partial.typography ?? defaults.typography,
    // Arrays are preserved as-is (no merge needed)
    languages: partial.languages ?? defaults.languages,
    contacts: partial.contacts ?? defaults.contacts,
    metadata: partial.metadata ?? defaults.metadata,
    ctaButtons: partial.ctaButtons ?? defaults.ctaButtons,
  };
}

interface BioEditorProps {
  // Fully controlled: `data` is the live value owned by PortfolioMain (via
  // the store). Every field updater below computes the next value and
  // hands it straight back via onChange — there is no local state, no
  // save button, no cancel/rollback. PortfolioMain's autosave flush is
  // what eventually persists it.
  data: BioData;
  onChange: (data: BioData) => void;
  onDone: () => void;
}

export default function BioEditor({ data, onChange, onDone }: BioEditorProps) {
  const resolved = useMemo(() => mergeWithDefaults(data), [data]);

  // `resolved` only advances once the `data` prop round-trips back down
  // from PortfolioMain (store update -> re-render -> new prop). That
  // round trip doesn't happen synchronously, so if a caller fires several
  // onChange calls back-to-back in the same event handler (e.g.
  // ContentTab's "Load Profile Data" button, which calls onChange four
  // times in a row), every one of those calls would otherwise spread from
  // the *same* stale `resolved` snapshot and clobber each other — only
  // the last call would actually survive.
  //
  // latestRef tracks the value we've most recently emitted so each
  // updater builds on top of the previous one instead of the stale prop.
  // It's resynced from `resolved` whenever a fresh prop does land, so it
  // never drifts from the source of truth between edits.
  const latestRef = useRef(resolved);
  useEffect(() => {
    latestRef.current = resolved;
  }, [resolved]);

  const [activeTab, setActiveTab] = useState<
    "content" | "layout" | "background" | "cta" | "animations"
  >("content");

  // ── Field updaters ───────────────────────────────────────────────────────
  const updateField = <K extends keyof BioData>(key: K, value: BioData[K]) => {
    const next = { ...latestRef.current, [key]: value };
    latestRef.current = next;
    onChange(next);
  };

  const updateBackground = (value: Partial<BioData["background"]>) => {
    const current = latestRef.current;
    const next = {
      ...current,
      background: { ...current.background, type: current.background?.type || "none", ...value },
    };
    latestRef.current = next;
    onChange(next);
  };

  const updateAnimations = (value: Partial<BioAnimations>) => {
    const current = latestRef.current;
    const next = {
      ...current,
      animations: {
        ...getDefaultAnimations(),
        ...current.animations,
        ...value,
      },
    };
    latestRef.current = next;
    onChange(next);
  };

  // ── Tab content ──────────────────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        return <ContentTab data={resolved} onChange={updateField} />;
      case "layout":
        return <LayoutTab data={resolved} onChange={updateField} />;
      case "background":
        return (
          <BackgroundTab
            data={resolved}
            onUpdate={updateBackground}
          />
        );
      case "cta":
        return <CTATab data={resolved} onChange={updateField} />;
      case "animations":
        return <AnimationsTab data={resolved} onUpdate={updateAnimations} />;
      default:
        return null;
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Editor panel */}
      <div className="h-fit bg-[var(--pb-background)] flex-1 flex flex-col min-w-0 border border-[var(--pb-border)] rounded-xl overflow-hidden ">
        <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Preview panel */}
      <div className="flex-1 min-w-0 border border-[var(--pb-border)] rounded-xl overflow-hidden transition-all duration-300">
        <div className="px-4 py-2 border-b border-[var(--pb-border)] flex items-center justify-between">
          <span className="text-xs text-[var(--pb-text-muted)] uppercase tracking-wide">Preview</span>
          <button
            onClick={onDone}
            className="text-xs text-[var(--pb-text-secondary)] hover:text-[var(--pb-text-primary)] transition-colors flex items-center gap-1"
            title="Exit editing — changes autosave in the background"
          >
            <Check className="w-3.5 h-3.5" />
            Done
          </button>
        </div>
        <div className="h-[calc(100%-37px)] overflow-y-auto">
          <BioRenderer data={resolved} />
        </div>
      </div>
    </div>
  );
}