// portfolio-builder/components/sections/bio/BioEditor.tsx

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AlertTriangle, Loader2, Maximize } from "lucide-react";
import { BioData, getEmptyBioData } from "@/portfolio-builder/types/bio";
import { getDefaultAnimations } from "@/portfolio-builder/types/hero";
import type { BioAnimations } from "@/portfolio-builder/types/bio";
import {
  ContentTab,
  LayoutTab,
  CTATab,
  EditorTabs,
  EditorActions,
  AnimationsTab,
} from "./editor-components";
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore";
import BioRenderer from "./BioRenderer";
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

// Fixed interval for the periodic background save (ms).
const SAVE_INTERVAL_MS = 30_000;

interface BioEditorProps {
  initialData: BioData;
  onSave: (data: BioData) => Promise<void>;
  onCancel: () => void;
  setFullScreen: (latestData: BioData) => void;
}

export default function BioEditor({ initialData, onSave, onCancel, setFullScreen }: BioEditorProps) {
  // ── Resolve data with defaults ─────────────────────────────────────────
  const resolvedInitialData = mergeWithDefaults(initialData);

  const [data, setData] = useState<BioData>(() => structuredClone(resolvedInitialData));
  const [activeTab, setActiveTab] = useState<
    "content" | "layout" | "background" | "cta" | "animations"
  >("content");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // True while this editor OR any other portfolio save is in flight.
  const isPortfolioSaving = usePortfolioStore((state) => state.isLoading);
  const isSaving = saveStatus === "saving" || isPortfolioSaving;

  // ── Latest data ref (so timers/unmount/unload always save current data) ──
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // ── Save orchestration refs ──────────────────────────────────────────────
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef<BioData | null>(null);
  const savedStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Core save executor ───────────────────────────────────────────────────
  // No "has changes" tracking - callers trigger this whenever a save should
  // happen, and duplicate saves are fine (better than stale state).
  const executeSave = useCallback(
    (nextData: BioData) => {
      if (isSavingRef.current) {
        pendingSaveRef.current = nextData;
        return;
      }

      if (!isValidData(nextData)) return;

      isSavingRef.current = true;
      setSaveStatus("saving");

      Promise.resolve(onSave(nextData))
        .then(() => {
          setSaveStatus("saved");

          if (savedStatusTimerRef.current) clearTimeout(savedStatusTimerRef.current);
          savedStatusTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);

          if (pendingSaveRef.current) {
            const queued = pendingSaveRef.current;
            pendingSaveRef.current = null;
            executeSave(queued);
          }
        })
        .catch(() => {
          setSaveStatus("error");
          pendingSaveRef.current = null;
        })
        .finally(() => {
          isSavingRef.current = false;
        });
    },
    [onSave]
  );

  // ── Fixed-interval save ────────────────────────────────────────────────────
  // Saves periodically regardless of whether anything changed - simpler and
  // safer than tracking dirty state, and duplicate saves are harmless.
  useEffect(() => {
    const interval = setInterval(() => {
      executeSave(dataRef.current);
    }, SAVE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [executeSave]);

  // ── Save on unmount ─────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      executeSave(dataRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save on page reload/close ───────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      executeSave(dataRef.current);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [executeSave]);

  // ── Field updaters ───────────────────────────────────────────────────────
  const updateField = <K extends keyof BioData>(key: K, value: BioData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const updateBackground = (value: Partial<BioData["background"]>) => {
    setData((prev) => ({
      ...prev,
      background: { ...prev.background, type: prev.background?.type || "none", ...value },
    }));
  };

  const updateAnimations = (value: Partial<BioAnimations>) => {
    setData((prev) => ({
      ...prev,
      animations: {
        ...getDefaultAnimations(),
        ...prev.animations,
        ...value,
      },
    }));
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const isValidData = (d: BioData): boolean => {
    if (!d.bio?.trim()) return false;
    return true;
  };

  // ── Manual save ──────────────────────────────────────────────────────────
  const handleSave = () => {
    if (isSaving) return;
    executeSave(data);
  };

  // ── Cancel ───────────────────────────────────────────────────────────────
  const handleCancel = () => {
    onCancel();
  };

  // ── Fullscreen ───────────────────────────────────────────────────────────
  const handleFullscreen = () => {
    if (!isSaving) executeSave(data);
    setFullScreen(data);
  };

  // ── Save status display ──────────────────────────────────────────────────
  const saveStatusText = {
    idle: "Idle",
    saving: "Saving...",
    saved: "Saved",
    error: "Save failed",
  };

  const saveStatusColor = {
    idle: "text-[var(--pb-text-muted)]",
    saving: "text-[var(--pb-info)]",
    saved: "text-[var(--pb-success)]",
    error: "text-[var(--pb-error)]",
  };

  // ── Tab content ──────────────────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        return <ContentTab data={data} onChange={updateField} />;
      case "layout":
        return <LayoutTab data={data} onChange={updateField} />;
      case "background":
        return (
          <BackgroundTab
            data={data}
            onUpdate={updateBackground}
          />
        );
      case "cta":
        return <CTATab data={data} onChange={updateField} />;
      case "animations":
        return <AnimationsTab data={data} onUpdate={updateAnimations} />;
      default:
        return null;
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Save status banner */}
      {(saveStatus === "saving" || saveStatus === "error") && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${saveStatus === "saving"
            ? "bg-[var(--pb-info-bg)] text-[var(--pb-info)] border border-[var(--pb-info-border)]"
            : "bg-[var(--pb-error-bg)] text-[var(--pb-error)] border border-[var(--pb-error-border)]"
            }`}
        >
          <div className="flex items-center gap-2">
            {saveStatus === "saving" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">
              {saveStatus === "saving" ? "Saving..." : "Save failed! Don't close the page"}
            </span>
          </div>
        </div>
      )}

      {/* Editor panel */}
      <div className="h-fit bg-[var(--pb-background)] flex-1 flex flex-col min-w-0 border border-[var(--pb-border)] rounded-xl overflow-hidden ">
        <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {renderTabContent()}
        </div>

        <EditorActions
          hasChanges={true}
          isSaving={isSaving}
          isValid={isValidData(data)}
          saveStatus={saveStatusText[saveStatus]}
          saveStatusColor={saveStatusColor[saveStatus]}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>

      {/* Preview panel */}
      <div className="flex-1 min-w-0 border border-[var(--pb-border)] rounded-xl overflow-hidden transition-all duration-300">
        <div className="px-4 py-2 border-b border-[var(--pb-border)] flex items-center justify-between">
          <span className="text-xs text-[var(--pb-text-muted)] uppercase tracking-wide">Preview</span>
          <button
            onClick={handleFullscreen}
            disabled={isSaving}
            className="text-xs text-[var(--pb-text-secondary)] hover:text-[var(--pb-text-primary)] transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[var(--pb-text-secondary)]"
            title={isSaving ? "Cannot open fullscreen while saving" : "Hide editor for fullscreen preview"}
          >
            <Maximize className="w-3.5 h-3.5" />
            Fullscreen
          </button>
        </div>
        <div className="h-[calc(100%-37px)] overflow-y-auto">
          <BioRenderer data={data} />
        </div>
      </div>
    </div>
  );
}