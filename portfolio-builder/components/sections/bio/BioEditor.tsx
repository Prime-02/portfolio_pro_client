// portfolio-builder/components/sections/bio/BioEditor.tsx

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AlertTriangle, Loader2, Maximize } from "lucide-react";
import { BioData } from "@/portfolio-builder/types/bio";
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
import BioRenderer from "./BioRenderer";
import BackgroundTab from "@/portfolio-builder/components/shared/background/editor/BackgroundTab";

interface BioEditorProps {
  initialData: BioData;
  onSave: (data: BioData) => Promise<void>;
  onCancel: () => void;
  setFullScreen: (latestData: BioData) => void;
}

export default function BioEditor({ initialData, onSave, onCancel, setFullScreen }: BioEditorProps) {
  const [data, setData] = useState<BioData>(() => structuredClone(initialData));
  const [activeTab, setActiveTab] = useState<
    "content" | "layout" | "background" | "cta" | "animations"
  >("content");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // ── Stable serialised baseline ───────────────────────────────────────────
  const savedSnapshotRef = useRef(JSON.stringify(initialData));
  const hasChanges = JSON.stringify(data) !== savedSnapshotRef.current;

  // ── Save orchestration refs ──────────────────────────────────────────────
  const isSavingRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<BioData | null>(null);
  const savedStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Core save executor ───────────────────────────────────────────────────
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
          savedSnapshotRef.current = JSON.stringify(nextData);
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

  // ── Debounced auto-save ──────────────────────────────────────────────────
  const scheduleSave = useCallback(
    (nextData: BioData) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => executeSave(nextData), 800);
    },
    [executeSave]
  );

  useEffect(() => {
    if (hasChanges) {
      scheduleSave(data);
    }
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // ── Prevent accidental page unload ───────────────────────────────────────
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasChanges && saveStatus !== "saving" && saveStatus !== "error") return;

      const message =
        saveStatus === "saving"
          ? "Changes are still being saved. Please wait..."
          : saveStatus === "error"
            ? "Save failed! You have unsaved changes. Leave anyway?"
            : "You have unsaved changes. Are you sure you want to leave?";

      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges, saveStatus]);

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
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    executeSave(data);
  };

  // ── Cancel ───────────────────────────────────────────────────────────────
  const handleCancel = () => {
    if (saveStatus === "saving") {
      alert("Cannot cancel while saving is in progress. Please wait...");
      return;
    }

    if (saveStatus === "error") {
      const confirmed = window.confirm(
        "Save failed and you have unsaved changes. Are you sure you want to discard your changes?"
      );
      if (!confirmed) return;
    } else if (hasChanges) {
      const confirmed = window.confirm("You have unsaved changes. Discard them?");
      if (!confirmed) return;
    }

    onCancel();
  };

  // ── Fullscreen ───────────────────────────────────────────────────────────
  // Pass current editor data to the controller so it can update its optimistic
  // state.  We do NOT call onSave here — preview is not persistence.
  const handleFullscreen = () => {
    setFullScreen(data);
  };

  // ── Save status display ──────────────────────────────────────────────────
  const saveStatusText = {
    idle: hasChanges ? "Unsaved changes" : "Saved",
    saving: "Saving...",
    saved: "Saved",
    error: "Save failed",
  };

  const saveStatusColor = {
    idle: hasChanges ? "text-[var(--pb-warning)]" : "text-[var(--pb-text-muted)]",
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
          hasChanges={hasChanges}
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
            disabled={saveStatus === "saving"}
            className="text-xs text-[var(--pb-text-secondary)] hover:text-[var(--pb-text-primary)] transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[var(--pb-text-secondary)]"
            title={saveStatus === "saving" ? "Cannot open fullscreen while saving" : "Hide editor for fullscreen preview"}
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