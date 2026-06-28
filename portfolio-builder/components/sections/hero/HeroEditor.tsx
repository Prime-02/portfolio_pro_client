// portfolio-builder/components/sections/hero/HeroEditor.tsx

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AlertTriangle, Loader2, Maximize } from "lucide-react";
import { HeroData, HeroCTA } from "@/portfolio-builder/types/hero";
import type { HeroAnimations, SocialLink } from "@/portfolio-builder/types/hero";
import {
    ContentTab,
    LayoutTab,
    MediaTab,
    CTATab,
    EditorTabs,
    EditorActions,
    AnimationsTab,
    EffectsTab,
} from "./editor-components";
import HeroRenderer from "./HeroRenderer";
import SocialLinksTab from "./editor-components/SocialLinksTab";
import { getDefaultAnimations } from "@/portfolio-builder/types/hero";
import { ResolvedTheme } from "@/portfolio-builder/hooks/usePortfolioTheme";
import BackgroundTab from "@/portfolio-builder/components/shared/editor/BackgroundTab";

interface HeroEditorProps {
    initialData: HeroData;
    onSave: (data: HeroData) => Promise<void>;
    onCancel: () => void;
    theme: ResolvedTheme;
    setFullScreen: (latestData: HeroData) => void;
}

export default function HeroEditor({ initialData, onSave, onCancel, theme, setFullScreen }: HeroEditorProps) {
    const [data, setData] = useState<HeroData>(() => structuredClone(initialData));
    const [activeTab, setActiveTab] = useState<
        "content" | "layout" | "media" | "background" | "cta" | "effects" | "animations" | "social"
    >("content");
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

    // ── Stable serialised baseline — only updates after a successful save ─────
    const savedSnapshotRef = useRef(JSON.stringify(initialData));
    const hasChanges = JSON.stringify(data) !== savedSnapshotRef.current;

    // ── Save orchestration refs ───────────────────────────────────────────────
    const isSavingRef = useRef(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingSaveRef = useRef<HeroData | null>(null);
    const savedStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Core save executor ───────────────────────────────────────────────────
    const executeSave = useCallback((nextData: HeroData) => {
        if (isSavingRef.current) {
            // Already saving — queue the latest data to retry after current save
            pendingSaveRef.current = nextData;
            return;
        }

        if (!isValidData(nextData)) return;

        isSavingRef.current = true;
        setSaveStatus("saving");

        Promise.resolve(onSave(nextData))
            .then(() => {
                // Advance the baseline so hasChanges resets correctly
                savedSnapshotRef.current = JSON.stringify(nextData);
                setSaveStatus("saved");

                // Clear "saved" indicator after 2s
                if (savedStatusTimerRef.current) clearTimeout(savedStatusTimerRef.current);
                savedStatusTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);

                // Flush any queued save that arrived while we were saving
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
    }, [onSave]);

    // ── Debounced auto-save ───────────────────────────────────────────────────
    const scheduleSave = useCallback((nextData: HeroData) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => executeSave(nextData), 800);
    }, [executeSave]);

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
                saveStatus === "saving" ? "Changes are still being saved. Please wait..." :
                    saveStatus === "error" ? "Save failed! You have unsaved changes. Leave anyway?" :
                        "You have unsaved changes. Are you sure you want to leave?";

            e.preventDefault();
            e.returnValue = message;
            return message;
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasChanges, saveStatus]);

    // ── Field updaters ───────────────────────────────────────────────────────
    const updateField = <K extends keyof HeroData>(key: K, value: HeroData[K]) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const updateMedia = (value: Partial<HeroData["media"]>) => {
        setData((prev) => ({
            ...prev,
            media: { ...prev.media, type: prev.media?.type || "none", ...value },
        }));
    };

    const updateBackground = (value: Partial<HeroData["background"]>) => {
        setData((prev) => ({
            ...prev,
            background: { ...prev.background, type: prev.background?.type || "solid", ...value },
        }));
    };

    const updateEffects = (value: Partial<HeroData["effects"]>) => {
        setData((prev) => ({
            ...prev,
            effects: { ...prev.effects, ...value },
        }));
    };

    const updateAnimations = (value: Partial<HeroAnimations>) => {
        setData((prev) => ({
            ...prev,
            animations: {
                ...getDefaultAnimations(),
                ...prev.animations,
                ...value,
            },
        }));
    };

    const updateSocialLinks = (links: SocialLink[]) => {
        setData((prev) => ({ ...prev, socialLinks: links }));
    };

    // ── CTA helpers ──────────────────────────────────────────────────────────
    const addCTA = () => {
        const newCTA: HeroCTA = { label: "", url: "", variant: "primary" };
        setData((prev) => ({
            ...prev,
            ctaButtons: [...(prev.ctaButtons || []), newCTA],
        }));
    };

    const updateCTA = (index: number, value: Partial<HeroCTA>) => {
        setData((prev) => {
            const updated = [...(prev.ctaButtons || [])];
            updated[index] = { ...updated[index], ...value };
            return { ...prev, ctaButtons: updated };
        });
    };

    const removeCTA = (index: number) => {
        setData((prev) => ({
            ...prev,
            ctaButtons: (prev.ctaButtons || []).filter((_, i) => i !== index),
        }));
    };

    const reorderCTA = (from: number, to: number) => {
        setData((prev) => {
            const buttons = [...(prev.ctaButtons || [])];
            if (to < 0 || to >= buttons.length) return prev;
            const [moved] = buttons.splice(from, 1);
            buttons.splice(to, 0, moved);
            return { ...prev, ctaButtons: buttons };
        });
    };

    // ── Validation ───────────────────────────────────────────────────────────
    const isValidData = (d: HeroData): boolean => {
        if (!d.name?.trim()) return false;
        if (d.ctaButtons?.some((btn) => !btn.label.trim() || !btn.url.trim())) return false;
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

    // ── Save status display ───────────────────────────────────────────────────
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
            case "content": return <ContentTab data={data} onChange={updateField} />;
            case "layout": return <LayoutTab data={data} onChange={updateField} />;
            case "media": return <MediaTab data={data} onUpdate={updateMedia} />;
            case "background": return <BackgroundTab data={data} onUpdate={updateBackground} />;
            case "cta": return <CTATab data={data} onAdd={addCTA} onUpdate={updateCTA} onRemove={removeCTA} onReorder={reorderCTA} />;
            case "social": return <SocialLinksTab data={data} onUpdate={updateSocialLinks} />;
            case "effects": return <EffectsTab data={data} onUpdate={updateEffects} />;
            case "animations": return <AnimationsTab data={data} onUpdate={updateAnimations} />;
            default: return null;
        }
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full ">
            {/* Save status banner */}
            {(saveStatus === "saving" || saveStatus === "error") && (
                <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${saveStatus === "saving"
                    ? "bg-[var(--pb-info-bg)] text-[var(--pb-info)] border border-[var(--pb-info-border)]"
                    : "bg-[var(--pb-error-bg)] text-[var(--pb-error)] border border-[var(--pb-error-border)]"
                    }`}>
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
            <div className="flex-1 flex flex-col min-w-0 border bg-[var(--pb-background)] border-[var(--pb-border)] rounded-xl overflow-hidden">
                <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="p-6 overflow-y-auto flex-1 space-y-6 ">
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
            <div className={`flex-1 min-w-0  border border-[var(--pb-border)] rounded-xl overflow-hidden transition-all duration-300`}>
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
                    <HeroRenderer data={data} theme={theme} />
                </div>
            </div>
        </div>
    );
}