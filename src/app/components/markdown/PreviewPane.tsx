// PreviewPane.tsx  (unchanged)
"use client";

import { memo } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

interface PreviewPaneProps {
    markdown: string;
}

export const PreviewPane = memo(function PreviewPane({ markdown }: PreviewPaneProps) {
    return (
        <div className="mde2-pane">
            <MarkdownRenderer
                markdown={markdown}
                placeholderText="Preview will appear here…"
            />
        </div>
    );
});