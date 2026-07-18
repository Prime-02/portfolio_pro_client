// portfolio-builder/components/sections/layout/LayoutEditor.tsx

"use client";
import { useState, useCallback, useRef } from "react";
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
    ThemeTab,
} from "./editor-components";
import SectionLinksTab from "./editor-components/SectionLinksTab";

interface LayoutEditorProps {
    data: LayoutData;
    onChange: (updated: LayoutData) => void;
    onSave: () => Promise<void>;
    onClose: () => void;
    availableSections: string[];
    sectionLinks: SectionLink[];
    missingSections: string[];
    onAddSection: (sectionType: string) => void;
    onRemoveSection: (sectionType: string) => void;
    visible: boolean;
}

export default function LayoutEditor({
    data,
    onChange,
    onSave,
    onClose,
    availableSections,
    sectionLinks,
    missingSections,
    onAddSection,
    onRemoveSection,
    visible,
}: LayoutEditorProps) {
    const [activeTab, setActiveTab] = useState<LayoutTab>("links");
    const [isSaving, setIsSaving] = useState(false);
    const isSavingRef = useRef(false);

    const handleSave = useCallback(async () => {
        if (isSavingRef.current) return;
        isSavingRef.current = true;
        setIsSaving(true);
        try {
            await onSave();
        } finally {
            isSavingRef.current = false;
            setIsSaving(false);
        }           
    }, [onSave]);

    const handleClose = useCallback(() => {
        handleSave(); // Fire and forget - don't await
        onClose();    // Close immediately
    }, [handleSave, onClose]);

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

    if (!visible) return null;

    return (
        <>
            {/* Overlay - click to close */}
            <div
                className="fixed inset-0 z-[140] bg-black/50"
                onClick={handleClose}
            />

            {/* Editor panel */}
            <div className="fixed inset-y-0 left-0 z-[150] w-full max-w-md lg:max-w-[33vw] xl:max-w-[28vw] bg-[var(--pb-background)] border-r border-[var(--pb-border)] flex flex-col shadow-2xl">
                {/* Stop clicks inside from reaching the overlay */}
                <div onClick={(e) => e.stopPropagation()} className="flex flex-col h-full">
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
                                missingSections={missingSections}
                                onAddSection={onAddSection}
                                onRemoveSection={onRemoveSection}
                            />
                        )}
                        {activeTab === "background" && (
                            <PageBackgroundTab
                                data={data.pageBackground ?? getEmptyPageBackgroundData()}
                                onChange={handleBackgroundChange}
                            />
                        )}
                        {activeTab === "theme" && (
                            <ThemeTab />
                        )}
                    </div>

                    {/* Actions */}
                    <LayoutEditorActions isSaving={isSaving} onSave={handleSave} onCancel={onClose} />
                </div>
            </div>
        </>
    );
}