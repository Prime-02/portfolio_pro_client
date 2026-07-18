// portfolio-builder/components/sections/education/EducationEditor.tsx

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AlertTriangle, RefreshCw, Maximize, Loader2 } from "lucide-react";
import { EducationData, getEmptyEducationData } from "@/portfolio-builder/types/education";
import type { BioAnimations } from "@/portfolio-builder/types/bio";
import {
  CardLayoutTab,
  EducationLayoutTab,
  EducationBackgroundTab,
  EducationAnimationsTab,
  EducationCTATab,
  EducationFilterTab,
  EducationEditorTabs,
  EducationEditorActions,
} from "./editor-components";
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore";
import EducationRenderer from "./EducationRenderer";

// ---------------------------------------------------------------------------
// Deep merge with defaults to handle missing/legacy keys
// ---------------------------------------------------------------------------
function mergeWithDefaults(partial: EducationData): EducationData {
  const defaults = getEmptyEducationData();

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

// Fixed interval for the periodic background save (ms).
const SAVE_INTERVAL_MS = 30_000;

interface EducationEditorProps {
  initialData: EducationData;
  onSave: (data: EducationData) => Promise<void>;
  onCancel: () => void;
  setFullScreen: (latestData: EducationData) => void;
  username: string;
}

export default function EducationEditor({
  initialData,
  onSave,
  onCancel,
  setFullScreen,
  username,
}: EducationEditorProps) {
  // ── Resolve data with defaults ─────────────────────────────────────────
  const resolvedInitialData = mergeWithDefaults(initialData);

  const [data, setData] = useState<EducationData>(() => structuredClone(resolvedInitialData));
  const [activeTab, setActiveTab] = useState<
    "filters" | "card-layout" | "layout" | "background" | "animations" | "cta"
  >("filters");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // True while this editor OR any other portfolio save is in flight.
  const isPortfolioSaving = usePortfolioStore((state) => state.isLoading);
  const isSaving = saveStatus === "saving" || isPortfolioSaving;

  // ── Animation replay counter ─────────────────────────────────────────────
  const [animationKey, setAnimationKey] = useState(0);

  // ── Latest data ref (so timers/unmount/unload always save current data) ──
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // ── Save orchestration refs ──────────────────────────────────────────────
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef<EducationData | null>(null);
  const savedStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Core save executor ───────────────────────────────────────────────────
  // No "has changes" tracking - callers trigger this whenever a save should
  // happen, and duplicate saves are fine (better than stale state).
  const executeSave = useCallback(
    (nextData: EducationData) => {
      if (isSavingRef.current) {
        pendingSaveRef.current = nextData;
        return;
      }

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

  // ── Save on unmount ──────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      executeSave(dataRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save on page reload/close ─────────────────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      executeSave(dataRef.current);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [executeSave]);

  // ── Field updaters ───────────────────────────────────────────────────────
  const updateField = <K extends keyof EducationData>(key: K, value: EducationData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const updateFilters = (value: Partial<EducationData["filters"]>) => {
    setData((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...value },
    }));
  };

  const updateBackground = (value: Partial<EducationData["background"]>) => {
    setData((prev) => ({
      ...prev,
      background: { ...prev.background, ...value },
    }));
  };

  const updateAnimations = (value: Partial<BioAnimations>) => {
    setData((prev) => ({
      ...prev,
      animations: { ...prev.animations, ...value },
    }));
    setAnimationKey((k) => k + 1);
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
  // Preview only, but also triggers a save so the fullscreen view (and
  // whatever consumes it) reflects the latest edits.
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
      case "filters":
        return <EducationFilterTab data={data} onUpdate={updateFilters} />;
      case "card-layout":
        return <CardLayoutTab data={data} onChange={updateField} />;
      case "layout":
        return <EducationLayoutTab data={data} onChange={updateField} />;
      case "background":
        return (
          <EducationBackgroundTab
            data={data}
            onUpdate={updateBackground}
          />
        );
      case "animations":
        return <EducationAnimationsTab data={data} onUpdate={updateAnimations} />;
      case "cta":
        return <EducationCTATab data={data} onChange={updateField} />;
      default:
        return null;
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full ">
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
      <div className="h-fit  flex-1 flex flex-col bg-[var(--pb-background)] min-w-0 border border-[var(--pb-border)] rounded-xl overflow-hidden">
        <EducationEditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="p-6 overflow-y-auto flex-1 space-y-6 ">
          {renderTabContent()}
        </div>

        <EducationEditorActions
          hasChanges={true}
          isSaving={isSaving}
          saveStatus={saveStatusText[saveStatus]}
          saveStatusColor={saveStatusColor[saveStatus]}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>

      {/* Preview panel */}
      <div className="flex-1 min-w-0  border border-[var(--pb-border)] rounded-xl overflow-hidden transition-all duration-300">
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
              onClick={handleFullscreen}
              disabled={isSaving}
              className="text-xs text-[var(--pb-text-secondary)] hover:text-[var(--pb-text-primary)] transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[var(--pb-text-secondary)]"
              title={isSaving ? "Cannot open fullscreen while saving" : "Hide editor for fullscreen preview"}
            >
              <Maximize className="w-3.5 h-3.5" />
              Fullscreen
            </button>
          </div>
        </div>
        <div className="h-[calc(100%-37px)] overflow-y-auto">
          <EducationRenderer
            data={data}
            username={username}
            animationKey={animationKey}
          />
        </div>
      </div>
    </div>
  );
}