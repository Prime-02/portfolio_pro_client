// portfolio-builder/components/sections/hero/HeroEditor.tsx

"use client";

import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import { HeroData, HeroCTA, getEmptyHeroData, getDefaultAnimations } from "@/portfolio-builder/types/hero";
import type { HeroAnimations, SocialLink } from "@/portfolio-builder/types/hero";
import {
    ContentTab,
    CTATab,
    EditorTabs,
    AnimationsTab,
    EffectsTab,
} from "./editor-components";
import LayoutMediaTab from "./editor-components/LayoutMediaTab";
import HeroRenderer from "./HeroRenderer";
import SocialLinksTab from "./editor-components/SocialLinksTab";
import { ResolvedTheme } from "@/portfolio-builder/hooks/usePortfolioTheme";
import BackgroundTab from "@/portfolio-builder/components/shared/background/editor/BackgroundTab";

// ---------------------------------------------------------------------------
// Deep merge with defaults to handle missing/legacy keys
// ---------------------------------------------------------------------------
function mergeWithDefaults(partial: HeroData): HeroData {
    const defaults = getEmptyHeroData();

    return {
        ...defaults,
        ...partial,
        // Deep merge nested objects to preserve new default fields
        media: partial.media
            ? { ...defaults.media, ...partial.media }
            : defaults.media,
        background: partial.background
            ? { ...defaults.background, ...partial.background }
            : defaults.background,
        effects: partial.effects
            ? { ...defaults.effects, ...partial.effects }
            : defaults.effects,
        animations: partial.animations
            ? { ...getDefaultAnimations(), ...partial.animations }
            : getDefaultAnimations(),
        padding: partial.padding
            ? { ...defaults.padding, ...partial.padding }
            : defaults.padding,
        // Arrays are simply preserved as-is (no merge needed)
        ctaButtons: partial.ctaButtons ?? defaults.ctaButtons,
        socialLinks: partial.socialLinks ?? defaults.socialLinks,
        fonts: partial.fonts ?? defaults.fonts,
        typography: partial.typography ?? defaults.typography,
    };
}

interface HeroEditorProps {
    // Fully controlled: `data` is the live value owned by PortfolioMain (via
    // the store). Every field updater below computes the next value and
    // hands it straight back via onChange — there is no local state, no
    // save button, no cancel/rollback. PortfolioMain's autosave flush is
    // what eventually persists it.
    data: HeroData;
    onChange: (data: HeroData) => void;
    theme: ResolvedTheme;
    onDone: () => void;
}

export default function HeroEditor({ data, onChange, theme, onDone }: HeroEditorProps) {
    const resolved = useMemo(() => mergeWithDefaults(data), [data]);

    const [activeTab, setActiveTab] = useState<
        "content" | "layout" | "background" | "cta" | "effects" | "animations" | "social"
    >("content");

    // ── Field updaters ────────────────────────────────────────────────────
    const updateField = <K extends keyof HeroData>(key: K, value: HeroData[K]) => {
        onChange({ ...resolved, [key]: value });
    };

    const updateBackground = (value: Partial<HeroData["background"]>) => {
        onChange({
            ...resolved,
            background: { ...resolved.background, type: resolved.background?.type || "solid", ...value },
        });
    };

    const updateEffects = (value: Partial<HeroData["effects"]>) => {
        onChange({
            ...resolved,
            effects: { ...resolved.effects, ...value },
        });
    };

    const updateAnimations = (value: Partial<HeroAnimations>) => {
        onChange({
            ...resolved,
            animations: {
                ...getDefaultAnimations(),
                ...resolved.animations,
                ...value,
            },
        });
    };

    const updateSocialLinks = (links: SocialLink[]) => {
        onChange({ ...resolved, socialLinks: links });
    };

    // ── CTA helpers ───────────────────────────────────────────────────────
    const addCTA = () => {
        const newCTA: HeroCTA = { label: "", url: "", variant: "primary" };
        onChange({
            ...resolved,
            ctaButtons: [...(resolved.ctaButtons || []), newCTA],
        });
    };

    const updateCTA = (index: number, value: Partial<HeroCTA>) => {
        const updated = [...(resolved.ctaButtons || [])];
        updated[index] = { ...updated[index], ...value };
        onChange({ ...resolved, ctaButtons: updated });
    };

    const removeCTA = (index: number) => {
        onChange({
            ...resolved,
            ctaButtons: (resolved.ctaButtons || []).filter((_, i) => i !== index),
        });
    };

    const reorderCTA = (from: number, to: number) => {
        const buttons = [...(resolved.ctaButtons || [])];
        if (to < 0 || to >= buttons.length) return;
        const [moved] = buttons.splice(from, 1);
        buttons.splice(to, 0, moved);
        onChange({ ...resolved, ctaButtons: buttons });
    };

    // ── Tab content ───────────────────────────────────────────────────────
    const renderTabContent = () => {
        switch (activeTab) {
            case "content": return <ContentTab data={resolved} onChange={updateField} />;
            case "layout": return <LayoutMediaTab data={resolved} onChange={updateField} />;
            case "background": return <BackgroundTab data={resolved} onUpdate={updateBackground} />;
            case "cta": return <CTATab data={resolved} onAdd={addCTA} onUpdate={updateCTA} onRemove={removeCTA} onReorder={reorderCTA} />;
            case "social": return <SocialLinksTab data={resolved} onUpdate={updateSocialLinks} />;
            case "effects": return <EffectsTab data={resolved} onUpdate={updateEffects} />;
            case "animations": return <AnimationsTab data={resolved} onUpdate={updateAnimations} />;
            default: return null;
        }
    };

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col lg:flex-row gap-6 h-full ">
            {/* Editor panel */}
            <div className="flex-1 flex flex-col h-fit min-w-0 border bg-[var(--pb-background)] border-[var(--pb-border)] rounded-xl overflow-hidden">
                <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />

                <div className="p-6 overflow-y-auto flex-1 space-y-6 ">
                    {renderTabContent()}
                </div>
            </div>

            {/* Preview panel */}
            <div className={`flex-1 min-w-0  border border-[var(--pb-border)] rounded-xl overflow-hidden transition-all duration-300`}>
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
                    <HeroRenderer data={resolved} theme={theme} />
                </div>
            </div>
        </div>
    );
}