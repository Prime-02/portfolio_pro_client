// MarkdownRenderer.tsx
// A standalone component that renders Markdown with the same fidelity
// as the WYSIWYG editor. No editor dependency — just pass a markdown string.

"use client";

import { memo, useEffect, useRef } from "react";
import { RENDERER_STYLES } from "./styles";
import { mdToHtml } from "./markdown-utils";
import { resolveImageUrl } from "@/lib/stores/cloudinary/helpers";

let stylesInjected = false;
function injectRendererStyles() {
    if (stylesInjected || typeof document === "undefined") return;
    const el = document.createElement("style");
    el.textContent = RENDERER_STYLES;
    document.head.appendChild(el);
    stylesInjected = true;
}

// Mirrors CloudinaryImage and resolveEditorImageSrc in MarkdownEditor:
// public IDs (no http prefix) are resolved with standard options;
// full URLs pass through untouched.
function resolveRendererImageSrc(src: string): string {
    return src.startsWith("http")
        ? src
        : resolveImageUrl(src, { width: 1200, height: 800, quality: "auto" });
}

// ─── Component ───────────────────────────────────────────────────────────────

interface MarkdownRendererProps {
    /** The raw markdown string to render */
    markdown: string;
    /** Extra className(s) to merge onto the root element */
    className?: string;
    /** Inline styles for the root element */
    style?: React.CSSProperties;
    /** If true, renders a placeholder when markdown is empty */
    showPlaceholder?: boolean;
    /** Custom placeholder text */
    placeholderText?: string;
}

/**
 * `MarkdownRenderer` — a standalone, read-only markdown renderer.
 *
 * Renders a markdown string with the same visual fidelity as the WYSIWYG
 * editor, using the same shared `mdToHtml` parser with `resolveRendererImageSrc`
 * so image URLs are resolved identically in both contexts.
 *
 * Headings automatically receive slug IDs (e.g. "Project Overview" → id="project-overview")
 * so URL hashes like `#project-overview` scroll directly to that heading.
 */
export const MarkdownRenderer = memo(function MarkdownRenderer({
    markdown,
    className = "",
    style,
    showPlaceholder = true,
    placeholderText = "Nothing to preview yet…",
}: MarkdownRendererProps) {
    const rootRef = useRef<HTMLDivElement>(null);

    // Inject styles once on mount
    useEffect(() => {
        injectRendererStyles();
    }, []);

    // Scroll to hash on initial mount only
    useEffect(() => {
        if (!markdown?.trim()) return;
        const hash = window.location.hash.slice(1);
        if (!hash) return;
        const raf = requestAnimationFrame(() => {
            const target = document.getElementById(hash);
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
        return () => cancelAnimationFrame(raf);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Intercept hash link clicks for smooth scroll without page reload
    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;
        const onClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest("a");
            if (!anchor) return;
            const href = anchor.getAttribute("href") ?? "";
            if (!href.startsWith("#")) return;
            e.preventDefault();
            const hash = href.slice(1);
            const target = document.getElementById(hash);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
                window.history.pushState(null, "", href);
            }
        };
        root.addEventListener("click", onClick);
        return () => root.removeEventListener("click", onClick);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (!markdown?.trim()) {
        if (!showPlaceholder) return null;
        return (
            <div
                ref={rootRef}
                className={`mdr ${className}`.trim()}
                style={{
                    fontStyle: "italic",
                    fontFamily: "'Lora', Georgia, serif",
                    ...style,
                }}
            >
                {placeholderText}
            </div>
        );
    }

    return (
        <div
            ref={rootRef}
            className={`mdr ${className}`.trim()}
            style={style}
            dangerouslySetInnerHTML={{ __html: mdToHtml(markdown, resolveRendererImageSrc) }}
        />
    );
});

export default MarkdownRenderer;