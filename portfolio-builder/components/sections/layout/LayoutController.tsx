// portfolio-builder/components/sections/layout/LayoutController.tsx

"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { LayoutData, getEmptyLayoutData, SectionLink, syncSectionLinks } from "@/portfolio-builder/types/layout";
import LayoutEditor from "./LayoutEditor";
import LayoutRenderer from "./LayoutRenderer";

interface LayoutControllerProps {
    layoutData: LayoutData | null;
    onSave: (updated: LayoutData) => Promise<void>;
    availableSections: string[];
    sectionLinks: SectionLink[];
    children: React.ReactNode;
}

export default function LayoutController({
    layoutData,
    onSave,
    availableSections,
    sectionLinks,
    children,
}: LayoutControllerProps) {
    const [isEditing, setIsEditing] = useState(false);

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

    const handleOpen = () => {
        setIsEditing(true);
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
        return Array.isArray(children) ? children : [children];
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

            {!isEditing && (
                <button
                    onClick={handleOpen}
                    className="fixed bottom-6 left-6 z-[120] flex items-center gap-2 px-4 py-2.5 bg-[var(--pb-foreground-10)] backdrop-blur text-[var(--pb-text-primary)] border border-[var(--pb-border)] rounded-lg font-medium text-sm hover:bg-[var(--pb-foreground-20)] transition-colors shadow-lg"
                >
                    <span className="text-xs">⚙</span>
                    Edit Layout
                </button>
            )}

            {isEditing && (
                <LayoutEditor
                    data={draftData}
                    onChange={handleEditorChange}
                    onSave={handleSave}
                    onClose={handleClose}
                    availableSections={availableSections}
                    sectionLinks={sectionLinks}
                />
            )}
        </>
    );
}