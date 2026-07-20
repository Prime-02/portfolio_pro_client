// portfolio-builder/components/sections/layout/LayoutController.tsx

"use client";

import { useState, useMemo, useEffect, Children } from "react";
import { LayoutData, getEmptyLayoutData, SectionLink, syncSectionLinks } from "@/portfolio-builder/types/layout";
import LayoutEditor from "./LayoutEditor";
import LayoutRenderer from "./LayoutRenderer";

interface LayoutControllerProps {
    layoutData: LayoutData | null;
    onChange: (updated: LayoutData) => void;
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
    onChange,
    availableSections,
    sectionLinks,
    missingSections,
    onAddSection,
    onRemoveSection,
    children,
    viewOnly
}: LayoutControllerProps) {
    const [isEditing, setIsEditing] = useState(false);

    // Fully controlled: `layoutData` is the live value owned by PortfolioMain
    // (via the store). `resolved` fills in navbar.sectionLinks whenever the
    // stored draft doesn't have them yet (first load) or when they've drifted
    // from availableSections (a section was just added/removed upstream) —
    // recomputed every render, nothing kept in local state. Every edit in
    // LayoutEditor computes the next value and hands it straight back via
    // onChange; PortfolioMain's autosave flush is what eventually persists it.
    const resolved = useMemo((): LayoutData => {
        const populated = layoutData ?? getEmptyLayoutData();
        const navbar = populated.navbar ?? getEmptyLayoutData().navbar!;
        const currentLinks = navbar.sectionLinks ?? [];

        const synced = currentLinks.length === 0
            ? syncSectionLinks(sectionLinks, availableSections)
            : syncSectionLinks(currentLinks, availableSections);

        const unchanged =
            synced.length === currentLinks.length &&
            synced.every((l, i) => l.sectionType === currentLinks[i]?.sectionType);

        if (unchanged && currentLinks.length > 0) return populated;

        return {
            ...populated,
            navbar: { ...navbar, sectionLinks: synced },
        };
    }, [layoutData, sectionLinks, availableSections]);

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

    const handleClose = () => {
        setIsEditing(false);
    };

    const orderedVisibleLinks = useMemo(() => {
        return (resolved.navbar?.sectionLinks ?? sectionLinks).filter((l) => l.visible);
    }, [resolved.navbar?.sectionLinks, sectionLinks]);

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
            <LayoutRenderer data={resolved}>
                {visibleOrderedChildren}
            </LayoutRenderer>

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
            <LayoutEditor
                data={resolved}
                onChange={onChange}
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