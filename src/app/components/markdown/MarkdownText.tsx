// MarkdownText.tsx
// Drop-in <p> replacement that strips markdown syntax before rendering.
// Usage:
//   <MarkdownText className="text-sm text-[var(--pb-text-secondary)] line-clamp-2">
//     {project.project_description}
//   </MarkdownText>

import { ComponentPropsWithoutRef } from "react";

// ─── Utility ─────────────────────────────────────────────────────────────────

/**
 * Strip markdown syntax and return plain text.
 * Handles: headings, bold, italic, strikethrough, inline code, links,
 * images, blockquotes, list markers, HR, fenced code blocks, task checkboxes.
 */
export function mdToPlainText(md: string): string {
    if (!md) return "";

    return md
        // Fenced code blocks → keep inner text only
        .replace(/```[^\n`]*\n([\s\S]*?)```/g, (_, code) => code.trim())
        // Headings
        .replace(/^#{1,6}\s+/gm, "")
        // HR
        .replace(/^---+$/gm, "")
        // Blockquotes
        .replace(/^>\s?/gm, "")
        // Images → alt text
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
        // Links → link text
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        // Bold + italic
        .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
        // Bold
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/__(.+?)__/g, "$1")
        // Italic
        .replace(/\*(.+?)\*/g, "$1")
        .replace(/_(.+?)_/g, "$1")
        // Strikethrough
        .replace(/~~(.+?)~~/g, "$1")
        // Inline code
        .replace(/`([^`\n]+)`/g, "$1")
        // Task list checkboxes
        .replace(/^\s*[-*+]\s+\[[ x]\]\s*/gm, "")
        // Unordered list markers
        .replace(/^\s*[-*+]\s+/gm, "")
        // Ordered list markers
        .replace(/^\s*\d+\.\s+/gm, "")
        // Collapse multiple blank lines / newlines into a single space
        .replace(/\n+/g, " ")
        .trim();
}

// ─── Component ───────────────────────────────────────────────────────────────

type MarkdownTextProps = ComponentPropsWithoutRef<"p"> & {
    children?: string | null;
};

/**
 * `MarkdownText` — renders a markdown string as plain text inside a `<p>`.
 *
 * Accepts all standard `<p>` props (className, style, onClick, …).
 * `children` should be the raw markdown string.
 *
 * @example
 * <MarkdownText className="text-sm text-[var(--pb-text-secondary)] line-clamp-2">
 *   {project.project_description}
 * </MarkdownText>
 */
export function MarkdownText({ children, ...props }: MarkdownTextProps) {
    return <p {...props}>{mdToPlainText(children ?? "")}</p>;
}

export default MarkdownText;