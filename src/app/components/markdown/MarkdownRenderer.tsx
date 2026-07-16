// MarkdownRenderer.tsx
// Standalone, read-only markdown renderer for public-facing portfolio pages.
//
// Deliberately NOT built on MDXEditor. MDXEditor is a ~850KB (gzipped)
// WYSIWYG editing engine — shipping that to every visitor of a public
// portfolio page just to render text would be a big regression. This uses
// react-markdown (+ remark-gfm for tables/strikethrough/task-lists, +
// rehype-slug for heading anchor ids, + rehype-raw so literal <details>/<img
// width height> HTML the editor may have emitted still renders).
//
// npm install react-markdown remark-gfm rehype-slug rehype-raw

"use client";

import { memo, useEffect, useRef } from "react";
import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import { RENDERER_STYLES } from "./styles";
import { resolveImageUrl } from "@/lib/stores/cloudinary/helpers";

let stylesInjected = false;
function injectRendererStyles() {
    if (stylesInjected || typeof document === "undefined") return;
    const el = document.createElement("style");
    el.textContent = RENDERER_STYLES;
    document.head.appendChild(el);
    stylesInjected = true;
}

// Mirrors the resolver used by the editor's image plugin: public Cloudinary
// IDs (no http prefix) get resolved with standard display options; full
// URLs (including ones the user pasted directly) pass through untouched.
function resolveRendererImageSrc(src?: string): string {
    if (!src) return "";
    return src.startsWith("http")
        ? src
        : resolveImageUrl(src, { width: 1200, height: 800, quality: "auto" });
}

// ─── react-markdown component overrides ──────────────────────────────────────

const components: Components = {
    img: ({ src, alt, width, height }) => {
        const resolvedSrc = resolveRendererImageSrc(typeof src === "string" ? src : undefined);
        const numericWidth = typeof width === "number" ? width : typeof width === "string" ? parseInt(width, 10) : undefined;
        const numericHeight = typeof height === "number" ? height : typeof height === "string" ? parseInt(height, 10) : undefined;

        // If we have both width and height, use them directly
        if (numericWidth && numericHeight) {
            return (
                <img
                    src={resolvedSrc}
                    alt={alt ?? ""}
                    width={numericWidth}
                    height={numericHeight}
                    style={{ maxWidth: '100%', height: 'auto' }}
                />
            );
        }

        // If we only have one dimension, use fill with aspect ratio container
        if (numericWidth || numericHeight) {
            return (
                <div style={{ position: 'relative', width: '100%', maxWidth: numericWidth || '100%' }}>
                    <img
                        src={resolvedSrc}
                        alt={alt ?? ""}
                        width={numericWidth || 1200}
                        height={numericHeight || 800}
                        style={{ width: '100%', height: 'auto' }}
                    />
                </div>
            );
        }

        // Fallback: no dimensions specified, use a sensible default
        return (
            <img
                src={resolvedSrc}
                alt={alt ?? ""}
                width={1200}
                height={800}
                style={{ maxWidth: '100%', height: 'auto' }}
            />
        );
    },
    // remark-gfm marks task-list <li> with className="task-list-item"; map
    // that onto the "task-item" class your existing CSS (.mdr li.task-item)
    // already styles, so the stylesheet didn't need to change.
    li: ({ className, children, ...props }) => {
        const isTask = className?.includes("task-list-item");
        return (
            <li className={isTask ? "task-item" : className} {...props}>
                {children}
            </li>
        );
    },
    // Code blocks: preserve the data-lang attribute your CSS uses for the
    // little language label in the top-right corner of <pre>.
    pre: ({ children, ...props }) => {
        const child = Array.isArray(children) ? children[0] : children;
        const lang =
            child && typeof child === "object" && "props" in child
                ? (child.props.className || "").replace("language-", "")
                : "";
        return (
            <pre data-lang={lang} {...props}>
                {children}
            </pre>
        );
    },
};

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
        <div ref={rootRef} className={`mdr ${className}`.trim()} style={style}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug, rehypeRaw]}
                components={components}
            >
                {markdown}
            </ReactMarkdown>
        </div>
    );
});

export default MarkdownRenderer;