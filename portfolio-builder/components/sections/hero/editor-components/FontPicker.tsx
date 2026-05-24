// portfolio-builder/components/sections/hero/editor-components/FontPicker.tsx

"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { FONT_LIST, FONT_CATEGORIES, FontCategory, loadGoogleFont } from "./fonts";
import { inputClass } from "./styles";

interface FontPickerProps {
    id: string;
    value: string;
    onChange: (family: string) => void;
    previewText?: string;
}

const DEFAULT_LABEL = "Default (inherit)";

export default function FontPicker({ id, value, onChange, previewText = "Aa" }: FontPickerProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<FontCategory | "all">("all");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value) loadGoogleFont(value);
    }, [value]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const filtered = useMemo(() => {
        return FONT_LIST.filter((f) => {
            const matchesCategory = category === "all" || f.category === category;
            const matchesSearch = f.family.toLowerCase().includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [search, category]);

    const fontListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open || !fontListRef.current) return;

        const container = fontListRef.current;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const family = entry.target.getAttribute("data-font");
                        if (family) loadGoogleFont(family);
                    }
                });
            },
            { root: container, rootMargin: "100px", threshold: 0 }
        );

        const items = container.querySelectorAll("[data-font]");
        items.forEach((item) => observer.observe(item));

        return () => observer.disconnect();
    }, [open, filtered]);

    const handleSelect = (family: string) => {
        onChange(family);
        setOpen(false);
        setSearch("");
    };

    const handleClear = () => {
        onChange("");
        setOpen(false);
        setSearch("");
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                id={id}
                type="button"
                onClick={() => setOpen((v) => !v)}
                className={`${inputClass} flex items-center justify-between gap-2 text-left`}
                style={{ fontFamily: value || "inherit" }}
            >
                <span className="truncate">{value || DEFAULT_LABEL}</span>
                <svg
                    className={`w-4 h-4 text-[var(--pb-text-muted)] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-50 mt-1 w-full bg-[var(--pb-background)] border border-[var(--pb-border)] rounded-xl shadow-2xl overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-[var(--pb-border)]">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search fonts..."
                            className={`${inputClass} text-sm`}
                            autoFocus
                        />
                    </div>

                    {/* Category filter */}
                    <div className="flex gap-1 p-2 border-b border-[var(--pb-border)] overflow-x-auto">
                        {FONT_CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setCategory(cat.value as FontCategory | "all")}
                                className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors flex-shrink-0 ${category === cat.value
                                    ? "bg-[var(--pb-foreground)] text-[var(--pb-background)] font-medium"
                                    : "text-[var(--pb-text-muted)] hover:text-[var(--pb-text-primary)] hover:bg-[var(--pb-surface-hover)]"
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Font list */}
                    <div ref={fontListRef} className="max-h-60 overflow-y-auto">
                        <button
                            type="button"
                            onClick={handleClear}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-[var(--pb-surface-hover)] ${!value ? "text-[var(--pb-text-primary)] bg-[var(--pb-surface)]" : "text-[var(--pb-text-muted)]"
                                }`}
                        >
                            <span>{DEFAULT_LABEL}</span>
                        </button>

                        {filtered.length === 0 && (
                            <p className="px-3 py-4 text-sm text-[var(--pb-text-muted)] text-center">No fonts found</p>
                        )}

                        {filtered.map((font) => {
                            const isSelected = value === font.family;

                            return (
                                <button
                                    key={font.family}
                                    type="button"
                                    onClick={() => handleSelect(font.family)}
                                    data-font={font.family}
                                    className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-[var(--pb-surface-hover)] ${isSelected ? "text-[var(--pb-text-primary)] bg-[var(--pb-surface)]" : "text-[var(--pb-text-secondary)]"
                                        }`}
                                >
                                    <span style={{ fontFamily: font.family }}>{font.family}</span>
                                    <span
                                        style={{ fontFamily: font.family }}
                                        className="text-[var(--pb-text-muted)] text-xs ml-2 flex-shrink-0"
                                    >
                                        {previewText}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}