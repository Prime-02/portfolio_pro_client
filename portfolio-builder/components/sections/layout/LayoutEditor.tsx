// portfolio-builder/components/sections/layout/LayoutEditor.tsx

"use client";

import { useState, useCallback } from "react";
import {
    LayoutData,
    getEmptyNavbarData,
    getEmptyFooterData,
    getEmptyPageBackgroundData,
    SectionLink,
} from "@/portfolio-builder/types/layout";
import {
    NavbarTab,
    FooterTab,
    PageBackgroundTab,
    LayoutEditorTabs,
    LayoutEditorActions,
    LayoutTab,
} from "./editor-components";
import SectionLinksTab from "./editor-components/SectionLinksTab";
import PortfolioThemePicker, { PortfolioThemeValues } from "@/src/app/components/portfolio/PortfolioThemePicker";
import { usePortfolioStore } from "@/portfolio-builder/store/usePortfolioStore";
import {
    injectThemeCSS,
    resolveTheme,
    PortfolioThemeData,
} from "@/portfolio-builder/hooks/usePortfolioTheme";

interface LayoutEditorProps {
    data: LayoutData;
    onChange: (updated: LayoutData) => void;
    onSave: () => Promise<void>;
    onCancel: () => void;
    availableSections: string[];
    sectionLinks: SectionLink[];
}

export default function LayoutEditor({
    data,
    onChange,
    onSave,
    onCancel,
    availableSections,
    sectionLinks,
}: LayoutEditorProps) {
    const [activeTab, setActiveTab] = useState<LayoutTab>("links");
    const [isSaving, setIsSaving] = useState(false);
    const [isPreview, setIsPreview] = useState(false);

    const { currentPortfolio } = usePortfolioStore();

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave();
            setIsPreview(false);
        } finally {
            setIsSaving(false);
        }
    };

    // On cancel, revert the live CSS to whatever is saved in the store
    const handleCancel = () => {
        setIsPreview(false);
        const savedTheme = (
            currentPortfolio?.layout as Record<string, unknown> | null
        )?.theme as PortfolioThemeData | null ?? null;
        injectThemeCSS(resolveTheme(savedTheme));
        onCancel();
    };

    const handleSectionLinksChange = useCallback((links: SectionLink[]) => {
        onChange({
            ...data,
            navbar: { ...(data.navbar ?? getEmptyNavbarData()), sectionLinks: links },
        });
    }, [data, onChange]);

    const handleScrollBehaviorChange = useCallback((behavior: ScrollBehavior) => {
        onChange({
            ...data,
            navbar: { ...(data.navbar ?? getEmptyNavbarData()), scrollBehavior: behavior },
        });
    }, [data, onChange]);

    const handleNavbarChange = useCallback((navbar: LayoutData["navbar"]) => {
        onChange({ ...data, navbar });
    }, [data, onChange]);

    const handleFooterChange = useCallback((footer: LayoutData["footer"]) => {
        onChange({ ...data, footer });
    }, [data, onChange]);

    const handleBackgroundChange = useCallback((pageBackground: LayoutData["pageBackground"]) => {
        onChange({ ...data, pageBackground });
    }, [data, onChange]);

    // Update layout data state AND inject CSS live, same as ThemeToggle does
    const handleThemeChange = useCallback((theme: PortfolioThemeValues) => {
        const themeData: PortfolioThemeData = {
            themeVariant: theme.themeVariant,
            lightTheme: { background: theme.lightBg, foreground: theme.lightFg },
            darkTheme: { background: theme.darkBg, foreground: theme.darkFg },
            accent: theme.accent,
        };
        onChange({ ...data, theme: themeData });
        injectThemeCSS(resolveTheme(themeData));
    }, [data, onChange]);

    // Reset to defaults and inject those defaults live
    const handleResetToCurrent = useCallback(() => {
        const defaults: PortfolioThemeData = {
            themeVariant: "system",
            lightTheme: { background: "#ffffff", foreground: "#0a0a0a" },
            darkTheme: { background: "#0a0a0a", foreground: "#ededed" },
            accent: "#737373",
        };
        onChange({ ...data, theme: defaults });
        injectThemeCSS(resolveTheme(defaults));
    }, [data, onChange]);

    // When in preview mode, render a minimal toggle button instead of the full panel
    if (isPreview) {
        return (
            <button
                type="button"
                onClick={() => setIsPreview(false)}
                className="fixed left-0 top-1/2 -translate-y-1/2 z-[150] bg-[var(--pb-background)] border border-l-0 border-[var(--pb-border)] rounded-r-lg px-3 py-4 shadow-lg hover:shadow-xl transition-all pointer-events-auto group"
                title="Show Layout Editor"
            >
                <span className="flex flex-col items-center gap-2 text-[var(--pb-text-muted)] group-hover:text-[var(--pb-text-primary)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-xs font-medium [writing-mode:vertical-lr] rotate-180">Layout</span>
                </span>
            </button>
        );
    }

    return (
        <div className="fixed inset-y-0 left-0 z-[150] w-full max-w-md lg:max-w-[33vw] xl:max-w-[28vw] bg-[var(--pb-background)] border-r border-[var(--pb-border)] flex flex-col shadow-2xl pointer-events-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--pb-border)] shrink-0">
                <h2 className="text-base font-semibold text-[var(--pb-text-primary)]">Layout Settings</h2>
                <div className="flex items-center gap-2">
                    {/* Preview toggle button */}
                    <button
                        type="button"
                        onClick={() => setIsPreview(true)}
                        className="text-[var(--pb-text-muted)] hover:text-[var(--pb-text-primary)] transition-colors p-1 rounded hover:bg-[var(--pb-border)]"
                        title="Preview"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="text-[var(--pb-text-muted)] hover:text-[var(--pb-text-primary)] transition-colors text-lg leading-none"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <LayoutEditorTabs activeTab={activeTab} onChange={setActiveTab} />

            {/* Scrollable tab content */}
            <div className="flex-1 overflow-y-auto p-5">
                {activeTab === "navbar" && (
                    <NavbarTab
                        data={data.navbar ?? getEmptyNavbarData()}
                        onChange={handleNavbarChange}
                        availableSections={availableSections}
                        sectionLinks={data.navbar?.sectionLinks ?? sectionLinks}
                    />
                )}

                {activeTab === "footer" && (
                    <FooterTab
                        data={data.footer ?? getEmptyFooterData()}
                        onChange={handleFooterChange}
                        sectionLinks={data.navbar?.sectionLinks ?? sectionLinks}
                        onSectionLinksChange={handleSectionLinksChange}
                    />
                )}

                {activeTab === "links" && (
                    <SectionLinksTab
                        sectionLinks={data.navbar?.sectionLinks ?? sectionLinks}
                        availableSections={availableSections}
                        scrollBehavior={data.navbar?.scrollBehavior ?? "smooth"}
                        onChange={handleSectionLinksChange}
                        onScrollBehaviorChange={handleScrollBehaviorChange}
                    />
                )}

                {activeTab === "background" && (
                    <PageBackgroundTab
                        data={data.pageBackground ?? getEmptyPageBackgroundData()}
                        onChange={handleBackgroundChange}
                    />
                )}

                {activeTab === "theme" && (
                    <PortfolioThemePicker
                        values={{
                            themeVariant: data.theme?.themeVariant ?? "system",
                            lightBg: data.theme?.lightTheme?.background ?? "#ffffff",
                            lightFg: data.theme?.lightTheme?.foreground ?? "#0a0a0a",
                            darkBg: data.theme?.darkTheme?.background ?? "#0a0a0a",
                            darkFg: data.theme?.darkTheme?.foreground ?? "#ededed",
                            accent: data.theme?.accent ?? "#737373",
                        }}
                        onChange={handleThemeChange}
                        onResetToCurrent={handleResetToCurrent}
                        description="Customize the colors and mode of your portfolio."
                    />
                )}
            </div>

            {/* Actions */}
            <LayoutEditorActions isSaving={isSaving} onSave={handleSave} onCancel={handleCancel} />
        </div>
    );
}