// EditorToolbar.tsx
"use client";

import { type ToolDef } from "./toolbar-config";

interface EditorToolbarProps {
    tools: (ToolDef | "sep")[];
    disabled: boolean;
    enableImageUpload?: boolean;
    onToolSelect: (tool: ToolDef) => void;
}

export function EditorToolbar({ tools, disabled, enableImageUpload, onToolSelect }: EditorToolbarProps) {
    // Filter out upload tool if not enabled
    const visibleTools = enableImageUpload
        ? tools
        : tools.filter(t => t === "sep" || (t as ToolDef).id !== "image-upload");

    return (
        <div className="mde2-toolbar">
            {visibleTools.map((t, idx) =>
                t === "sep" ? (
                    <div key={`sep-${idx}`} className="mde2-sep" />
                ) : (
                    <button
                        key={t.id}
                        type="button"
                        className={`mde2-tbtn ${t.id === "image-upload" ? "image-upload-btn" : ""}`}
                        title={t.title}
                        disabled={disabled}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            onToolSelect(t);
                        }}
                    >
                        {t.icon}
                    </button>
                )
            )}
        </div>
    );
}