// portfolio-builder/components/sections/bio/BioEditor.tsx

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { BioData, } from "@/portfolio-builder/types/bio";
import { getDefaultAnimations, } from "@/portfolio-builder/types/hero";
import type { BioAnimations } from "@/portfolio-builder/types/bio";
import {
  ContentTab,
  LayoutTab,
  BackgroundTab,
  CTATab,
  EditorTabs,
  EditorActions,
  AnimationsTab,
} from "./editor-components";
import BioRenderer from "./BioRenderer";

interface BioEditorProps {
  initialData: BioData;
  onSave: (data: BioData) => void;
  onCancel: () => void;
}

export default function BioEditor({ initialData, onSave, onCancel }: BioEditorProps) {
  const [data, setData] = useState<BioData>(() => structuredClone(initialData));
  const [activeTab, setActiveTab] = useState<
    "content" | "layout" | "background" | "cta" | "animations"
  >("content");
  const [isEditorVisible, setIsEditorVisible] = useState(true);
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

  const toggleEditor = () => setIsEditorVisible((prev) => !prev);

  // ── Save status display ──────────────────────────────────────────────────
  const saveStatusText = {
    idle: hasChanges ? "Unsaved changes" : "Saved",
    saving: "Saving...",
    saved: "Saved",
    error: "Save failed",
  };

  const saveStatusColor = {
    idle: hasChanges ? "text-amber-400" : "text-neutral-500",
    saving: "text-blue-400",
    saved: "text-emerald-400",
    error: "text-red-400",
  };

  // ── Tab content ──────────────────────────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        return <ContentTab data={data} onChange={updateField} />;
      case "layout":
        return <LayoutTab data={data} onChange={updateField} />;
      case "background":
        return <BackgroundTab data={data} onUpdate={updateBackground} />;
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
    <div className="flex flex-col lg:flex-row gap-6 h-full bg-(--background)">
      {/* Save status banner */}
      {(saveStatus === "saving" || saveStatus === "error") && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${saveStatus === "saving"
            ? "bg-blue-900/90 text-blue-200 border border-blue-700"
            : "bg-red-900/90 text-red-200 border border-red-700"
            }`}
        >
          <div className="flex items-center gap-2">
            {saveStatus === "saving" ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-transparent" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            )}
            <span className="text-sm font-medium">
              {saveStatus === "saving" ? "Saving..." : "Save failed! Don't close the page"}
            </span>
          </div>
        </div>
      )}

      {/* Editor panel */}
      {isEditorVisible && (
        <div className="flex-1 flex flex-col min-w-0 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
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
      )}

      {/* Preview panel */}
      <div
        className={`${isEditorVisible ? "flex-1" : "flex-[2]"
          } min-w-0 bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden transition-all duration-300`}
      >
        <div className="px-4 py-2 border-b border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-500 uppercase tracking-wide">Preview</span>
          <button
            onClick={toggleEditor}
            className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
            title={isEditorVisible ? "Hide editor for fullscreen preview" : "Show editor"}
          >
            {isEditorVisible ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
                Fullscreen
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4v14h14v-7" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 2.5l5 5M8 13l5-5 5 5" />
                </svg>
                Show Editor
              </>
            )}
          </button>
        </div>
        <div className="h-[calc(100%-37px)] overflow-y-auto">
          <BioRenderer data={data} />
        </div>
      </div>
    </div>
  );
}
