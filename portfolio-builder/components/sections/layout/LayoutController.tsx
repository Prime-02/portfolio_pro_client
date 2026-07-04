// portfolio-builder/components/sections/layout/LayoutController.tsx

"use client";

import { useState, useCallback, useMemo, useEffect, Children } from "react";
import { LayoutData, getEmptyLayoutData, SectionLink, syncSectionLinks } from "@/portfolio-builder/types/layout";
import LayoutEditor from "./LayoutEditor";
import LayoutRenderer from "./LayoutRenderer";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { ScrollIndicator } from "@/portfolio-builder/components/sections/hero/renderer-components/ScrollIndicator";

interface LayoutControllerProps {
    layoutData: LayoutData | null;
    onSave: (updated: LayoutData) => Promise<void>;
    availableSections: string[];
    sectionLinks: SectionLink[];
    missingSections: string[];
    onAddSection: (sectionType: string) => void;
    onRemoveSection: (sectionType: string) => void;
    children: React.ReactNode;
    viewOnly: boolean
}

export default function LayoutController({
    layoutData,
    onSave,
    availableSections,
    sectionLinks,
    missingSections,
    onAddSection,
    onRemoveSection,
    children,
    viewOnly
}: LayoutControllerProps) {
    const [isEditing, setIsEditing] = useState(false);
    const { router } = useRouting()

    const populateLayoutData = useCallback((data: LayoutData | null, links: SectionLink[]): LayoutData => {
        const populated = data ?? getEmptyLayoutData();
        const navbar = populated.navbar ?? getEmptyLayoutData().navbar!;

        if (!navbar.sectionLinks || navbar.sectionLinks.length === 0) {
            const synced = syncSectionLinks(links, availableSections);
            return {
                ...populated,
                navbar: { ...navbar, sectionLinks: synced },
            };
        }

        return populated;
    }, [availableSections]);

    const [draftData, setDraftData] = useState<LayoutData>(() =>
        populateLayoutData(layoutData, sectionLinks)
    );

    // Keep draftData's sectionLinks in sync when availableSections changes
    // (e.g. a new section was just added, or one was removed upstream).
    useEffect(() => {
        setDraftData((prev) => {
            const currentLinks = prev.navbar?.sectionLinks ?? [];
            const synced = syncSectionLinks(currentLinks, availableSections);
            const unchanged =
                synced.length === currentLinks.length &&
                synced.every((l, i) => l.sectionType === currentLinks[i]?.sectionType);
            if (unchanged) return prev;
            return {
                ...prev,
                navbar: { ...(prev.navbar ?? getEmptyLayoutData().navbar!), sectionLinks: synced },
            };
        });
    }, [availableSections]);

    // Toggle editor visibility with Ctrl + .
    useEffect(() => {
        if (viewOnly) return
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === ".") {
                e.preventDefault();
                setIsEditing(prev => !prev);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleOpen = () => {
        setIsEditing(true);
    }

    const handleGoBack = () => {
        router.back()
    }

    const handleEditorChange = useCallback((updated: LayoutData) => {
        setDraftData(updated);
    }, []);

    const handleSave = useCallback(async () => {
        await onSave(draftData);
        setIsEditing(false);
    }, [draftData, onSave]);

    const handleClose = useCallback(() => {
        setIsEditing(false);
    }, []);

    const orderedVisibleLinks = useMemo(() => {
        return (draftData.navbar?.sectionLinks ?? sectionLinks).filter((l) => l.visible);
    }, [draftData.navbar?.sectionLinks, sectionLinks]);

    const childrenArray = useMemo(() => {
        return Children.toArray(children);
    }, [children]);

    const visibleOrderedChildren = useMemo(() => {
        const childMap = new Map<string, React.ReactNode>();

        childrenArray.forEach((child) => {
            if (child && typeof child === "object" && "props" in child) {
                const sectionId = (child.props as { id?: string })?.id;
                if (sectionId) childMap.set(sectionId, child);
            }
        });

        const result: React.ReactNode[] = [];
        for (const link of orderedVisibleLinks) {
            const child = childMap.get(link.sectionType);
            if (child) result.push(child);
        }

        return result;
    }, [childrenArray, orderedVisibleLinks]);

    return (
        <>
            <LayoutRenderer data={draftData}>
                {visibleOrderedChildren}
            </LayoutRenderer>

            <ScrollIndicator />

            {!isEditing && !viewOnly && (
                <button
                    onClick={handleOpen}
                    title="Edit Layout (Ctrl + .)"
                    className="fixed bottom-6 left-6 z-[120] flex items-center gap-2 px-4 py-2.5 bg-[var(--pb-foreground-10)] backdrop-blur text-[var(--pb-text-primary)] border border-[var(--pb-border)] rounded-lg font-medium text-sm hover:bg-[var(--pb-foreground-20)] transition-colors shadow-lg"
                >
                    <span className="text-xs">⚙</span>
                    Edit Layout
                </button>
            )}

            {!isEditing && !viewOnly && (
                <button
                    onClick={handleGoBack}
                    className="absolute bottom-6 right-6 z-[120] flex items-center gap-2 px-4 py-2.5 bg-[var(--pb-foreground-10)] backdrop-blur text-[var(--pb-text-primary)] border border-[var(--pb-border)] rounded-lg font-medium text-sm hover:bg-[var(--pb-foreground-20)] transition-colors shadow-lg"
                >
                    Go Back
                </button>
            )}


            <LayoutEditor
                data={draftData}
                onChange={handleEditorChange}
                onSave={handleSave}
                onClose={handleClose}
                availableSections={availableSections}
                sectionLinks={sectionLinks}
                missingSections={missingSections}
                onAddSection={onAddSection}
                onRemoveSection={onRemoveSection}
                visible={isEditing}
            />
        </>
    );
}