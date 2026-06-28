// portfolio-builder/components/sections/layout/LayoutController.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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

    // Helper to populate empty sectionLinks — has access to availableSections from props
    const populateLayoutData = useCallback((data: LayoutData | null, links: SectionLink[]): LayoutData => {
        const populated = data ?? getEmptyLayoutData();
        const navbar = populated.navbar ?? getEmptyLayoutData().navbar!;

        // If navbar sectionLinks is empty, populate from the pre-synced sectionLinks
        if (!navbar.sectionLinks || navbar.sectionLinks.length === 0) {
            const synced = syncSectionLinks(links, availableSections);
            return {
                ...populated,
                navbar: {
                    ...navbar,
                    sectionLinks: synced,
                },
            };
        }

        return populated;
    }, [availableSections]);

    // Initialize draftData with populated sectionLinks if empty
    const initialDraft = useMemo(() => {
        return populateLayoutData(layoutData, sectionLinks);
    }, [layoutData, sectionLinks, populateLayoutData]);

    const [draftData, setDraftData] = useState<LayoutData>(initialDraft);

    // Update draftData when layoutData changes from store (but preserve user edits if editing)
    useEffect(() => {
        if (layoutData && !isEditing) {
            setDraftData(populateLayoutData(layoutData, sectionLinks));
        }
    }, [layoutData, sectionLinks, isEditing, populateLayoutData]);

    const handleEditorChange = useCallback((updated: LayoutData) => {
        setDraftData(updated);
    }, []);

    const handleSave = async () => {
        await onSave(draftData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setDraftData(populateLayoutData(layoutData, sectionLinks)); // rollback
        setIsEditing(false);
    };

    // Get ordered and visible section links from draft navbar
    const orderedVisibleLinks = useMemo(() => {
        return (draftData.navbar?.sectionLinks ?? sectionLinks)
            .filter((l) => l.visible);
    }, [draftData.navbar?.sectionLinks, sectionLinks]);

    // Build a map of sectionType -> child element for reordering
    const childrenArray = useMemo(() => {
        return Array.isArray(children) ? children : [children];
    }, [children]);

    // Filter and reorder children based on sectionLinks
    const visibleOrderedChildren = useMemo(() => {
        const childMap = new Map<string, React.ReactNode>();

        childrenArray.forEach((child) => {
            if (child && typeof child === "object" && "props" in child) {
                const sectionId = (child.props as { id?: string })?.id;
                if (sectionId) {
                    childMap.set(sectionId, child);
                }
            }
        });

        // Order by sectionLinks, filter invisible
        const result: React.ReactNode[] = [];
        for (const link of orderedVisibleLinks) {
            const child = childMap.get(link.sectionType);
            if (child) {
                result.push(child);
            }
        }

        return result;
    }, [childrenArray, orderedVisibleLinks]);

    return (
        <>
            {/* Main content — always full width, editor overlays on top */}
            <LayoutRenderer data={draftData}>
                {visibleOrderedChildren}
            </LayoutRenderer>

            {/* Floating "Edit Layout" trigger button — visible when not editing */}
            {!isEditing && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="fixed bottom-6 left-6 z-[120] flex items-center gap-2 px-4 py-2.5 bg-[var(--pb-foreground-10)] backdrop-blur text-[var(--pb-text-primary)] border border-[var(--pb-border)] rounded-lg font-medium text-sm hover:bg-[var(--pb-foreground-20)] transition-colors shadow-lg"
                    style={{
                        bottom: "1.5rem",
                    }}
                >
                    <span className="text-xs">⚙</span>
                    Edit Layout
                </button>
            )}

            {/* Slide-in editor panel — overlays content, does NOT displace it */}
            {isEditing && (
                <LayoutEditor
                    data={draftData}
                    onChange={handleEditorChange}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    availableSections={availableSections}
                    sectionLinks={sectionLinks}
                />
            )}
        </>
    );
}