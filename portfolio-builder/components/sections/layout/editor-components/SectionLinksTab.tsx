// portfolio-builder/components/sections/layout/editor-components/SectionLinksTab.tsx

"use client";

import { useState, useCallback, useRef } from "react";
import { SectionLink, ScrollBehavior } from "@/portfolio-builder/types/layout";
import { PBDropdown, PBTextInput } from "@/portfolio-builder/components/shared/ui/inputs";
import { SectionDivider } from "./NavbarTab";


interface SectionLinksTabProps {
    sectionLinks: SectionLink[];
    availableSections: string[];
    scrollBehavior: ScrollBehavior;
    onChange: (links: SectionLink[]) => void;
    onScrollBehaviorChange: (behavior: ScrollBehavior) => void;
}

const SCROLL_BEHAVIORS = [
    { id: "smooth", code: "Smooth — Animated scroll with easing" },
    { id: "instant", code: "Instant — Jump directly to section" },
    { id: "auto", code: "Auto — Browser default behavior" },
];

export default function SectionLinksTab({
    sectionLinks,
    availableSections,
    scrollBehavior,
    onChange,
    onScrollBehaviorChange,
}: SectionLinksTabProps) {
    // Parent is responsible for ensuring sectionLinks are synced and populated.
    // We just use them as-is.
    const links = sectionLinks;

    // ── Drag & Drop state ───────────────────────────────────────────────────
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const dragItemRef = useRef<number | null>(null);

    const handleDragStart = useCallback((index: number) => {
        dragItemRef.current = index;
        setDraggingIndex(index);
    }, []);

    const handleDragEnter = useCallback((index: number) => {
        if (dragItemRef.current !== null && dragItemRef.current !== index) {
            setDragOverIndex(index);
        }
    }, []);

    const handleDragEnd = useCallback(() => {
        if (dragItemRef.current !== null && dragOverIndex !== null) {
            const from = dragItemRef.current;
            const to = dragOverIndex;
            if (from !== to) {
                const newLinks = links.map((l) => ({ ...l }));
                const [removed] = newLinks.splice(from, 1);
                newLinks.splice(to, 0, removed);
                onChange(newLinks);
            }
        }
        setDraggingIndex(null);
        setDragOverIndex(null);
        dragItemRef.current = null;
    }, [dragOverIndex, links, onChange]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const toggleVisibility = (index: number) => {
        const newLinks = links.map((link, i) =>
            i === index ? { ...link, visible: !link.visible } : { ...link }
        );
        onChange(newLinks);
    };

    const updateLabel = (index: number, label: string) => {
        const newLinks = links.map((link, i) =>
            i === index ? { ...link, label } : { ...link }
        );
        onChange(newLinks);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Scroll Behavior - using PBDropdown */}
            <SectionDivider label="Scroll Behavior" />
            <div>
                <PBDropdown
                    options={SCROLL_BEHAVIORS}
                    value={scrollBehavior}
                    onSelect={(val) => onScrollBehaviorChange(val as ScrollBehavior)}
                    placeholder="Select scroll behavior..."
                    size="md"
                    variant="outlined"
                    includeNoneOption={false}
                    clearable={false}
                />
            </div>

            {/* Section Links — Sortable, toggle visibility */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-[var(--pb-text-secondary)]">
                        Section Links
                    </label>
                    <span className="text-xs text-[var(--pb-text-muted)] bg-[var(--pb-surface-hover)] px-2 py-0.5 rounded-full">
                        {links.filter((l) => l.visible).length} of {links.length} visible
                    </span>
                </div>

                <p className="text-xs text-[var(--pb-text-muted)] mb-3">
                    Drag to reorder sections on the page. Toggle visibility to show/hide sections.
                    Changes apply to both Navbar and Footer.
                </p>

                <div className="space-y-1.5">
                    {links.map((link, i) => (
                        <div
                            key={link.sectionType}
                            draggable
                            onDragStart={() => handleDragStart(i)}
                            onDragEnter={() => handleDragEnter(i)}
                            onDragEnd={handleDragEnd}
                            onDragOver={handleDragOver}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move select-none ${draggingIndex === i
                                ? "opacity-50 border-dashed border-[var(--pb-foreground)]"
                                : dragOverIndex === i
                                    ? "border-[var(--pb-foreground)] bg-[var(--pb-foreground-5)]"
                                    : "border-[var(--pb-border)] bg-[var(--pb-surface)]"
                                }`}
                        >
                            {/* Drag handle */}
                            <span className="text-[var(--pb-text-muted)] text-sm cursor-grab active:cursor-grabbing leading-none">
                                ⋮⋮
                            </span>

                            {/* Order number */}
                            <span className="text-xs font-mono text-[var(--pb-text-muted)] w-5 text-center">
                                {i + 1}
                            </span>

                            {/* Visibility toggle */}
                            <button
                                type="button"
                                onClick={() => toggleVisibility(i)}
                                className={`w-10 h-5 rounded-full transition-colors shrink-0 ${link.visible ? "bg-[var(--pb-foreground)]" : "bg-[var(--pb-foreground-20)]"
                                    }`}
                            >
                                <span
                                    className={`block w-4 h-4 bg-[var(--pb-text-inverse)] rounded-full shadow transition-transform ${link.visible ? "translate-x-5" : "translate-x-0.5"
                                        }`}
                                />
                            </button>

                            {/* Label input - using PBTextInput */}
                            <div className="flex-1 min-w-0">
                                <PBTextInput
                                    value={link.label}
                                    onChange={(v) => updateLabel(i, v)}
                                    className={`border-transparent bg-transparent ${!link.visible ? "line-through" : ""}`}
                                    labelStyle={link.visible ? "" : "line-through"}
                                />
                            </div>

                            {/* Section type badge */}
                            <span className="text-[10px] uppercase tracking-wider text-[var(--pb-text-muted)] bg-[var(--pb-surface-hover)] px-2 py-1 rounded shrink-0">
                                #{link.sectionType}
                            </span>
                        </div>
                    ))}
                    {links.length === 0 && (
                        <div className="text-center py-8 border border-dashed border-[var(--pb-border)] rounded-lg">
                            <p className="text-sm text-[var(--pb-text-muted)]">No sections available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}