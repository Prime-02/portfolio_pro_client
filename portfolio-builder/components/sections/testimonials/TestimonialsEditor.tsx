// portfolio-builder/components/sections/testimonials/TestimonialsEditor.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AlertTriangle, RefreshCw, Maximize, Loader2 } from "lucide-react";
import { TestimonialsData, getEmptyTestimonialsData } from "@/portfolio-builder/types/testimonials";
import type { BioAnimations } from "@/portfolio-builder/types/bio";
import {
  TestimonialsFilterTab,
  TestimonialsCardLayoutTab,
  TestimonialsLayoutTab,
  TestimonialsBackgroundTab,
  TestimonialsAnimationsTab,
  TestimonialsCTATab,
  TestimonialsEditorTabs,
  TestimonialsEditorActions,
} from "./editor-components";
import TestimonialsRenderer from "./TestimonialsRenderer";

interface TestimonialsEditorProps {
  initialData: TestimonialsData;
  onSave: (data: TestimonialsData) => Promise<void>;
  onCancel: () => void;
  setFullScreen: (latestData: TestimonialsData) => void;
  username: string;
}

export default function TestimonialsEditor({
  initialData,
  onSave,
  onCancel,
  setFullScreen,
  username,
}: TestimonialsEditorProps) {
  const [data, setData] = useState<TestimonialsData>(() => structuredClone(initialData));
  const [activeTab, setActiveTab] = useState<
    "filters" | "card-layout" | "layout" | "background" | "animations" | "cta"
  >("filters");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const [animationKey, setAnimationKey] = useState(0);

  const savedSnapshotRef = useRef(JSON.stringify(initialData));
  const hasChanges = JSON.stringify(data) !== savedSnapshotRef.current;

  const isSavingRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<TestimonialsData | null>(null);
  const savedStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executeSave = useCallback(
    (nextData: TestimonialsData) => {
      if (isSavingRef.current) {
        pendingSaveRef.current = nextData;
        return;
      }

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

  const scheduleSave = useCallback(
    (nextData: TestimonialsData) => {
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

  const updateField = <K extends keyof TestimonialsData>(key: K, value: TestimonialsData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const updateFilters = (value: Partial<TestimonialsData["filters"]>) => {
    setData((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...value },
    }));
  };

  const updateBackground = (value: Partial<TestimonialsData["background"]>) => {
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

  const handleSave = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    executeSave(data);
  };

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

  const handleFullscreen = () => {
    setFullScreen(data);
  };

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

  const renderTabContent = () => {
    switch (activeTab) {
      case "filters":
        return <TestimonialsFilterTab data={data} onUpdate={updateFilters} />;
      case "card-layout":
        return <TestimonialsCardLayoutTab data={data} onChange={updateField} />;
      case "layout":
        return <TestimonialsLayoutTab data={data} onChange={updateField} />;
      case "background":
        return (
          <TestimonialsBackgroundTab
            data={data}
            onUpdate={updateBackground}
            allowedTypes={["none", "solid", "gradient"]}
          />
        );
      case "animations":
        return <TestimonialsAnimationsTab data={data} onUpdate={updateAnimations} />;
      case "cta":
        return <TestimonialsCTATab data={data} onChange={updateField} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full bg-[var(--pb-background)]">
      {(saveStatus === "saving" || saveStatus === "error") && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
            saveStatus === "saving"
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

      <div className="h-fit flex-1 flex flex-col min-w-0 border border-[var(--pb-border)] rounded-xl overflow-hidden bg-[var(--pb-surface)]">
        <TestimonialsEditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-[var(--pb-background)]">
          {renderTabContent()}
        </div>

        <TestimonialsEditorActions
          hasChanges={hasChanges}
          saveStatus={saveStatusText[saveStatus]}
          saveStatusColor={saveStatusColor[saveStatus]}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>

      <div className="flex-1 min-w-0 bg-[var(--pb-background)] border border-[var(--pb-border)] rounded-xl overflow-hidden transition-all duration-300">
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
              disabled={saveStatus === "saving"}
              className="text-xs text-[var(--pb-text-secondary)] hover:text-[var(--pb-text-primary)] transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-[var(--pb-text-secondary)]"
              title={saveStatus === "saving" ? "Cannot open fullscreen while saving" : "Hide editor for fullscreen preview"}
            >
              <Maximize className="w-3.5 h-3.5" />
              Fullscreen
            </button>
          </div>
        </div>
        <div className="h-[calc(100%-37px)] overflow-y-auto">
          <TestimonialsRenderer
            data={data}
            username={username}
            animationKey={animationKey}
          />
        </div>
      </div>
    </div>
  );
}
