// EditorFooter.tsx
"use client";

interface EditorFooterProps {
    wordCount: number;
    charCount: number;
    copied: boolean;
    disabled: boolean;
    onCopy: () => void;
    onDownload: () => void;
}

export function EditorFooter({
    wordCount,
    charCount,
    copied,
    disabled,
    onCopy,
    onDownload,
}: EditorFooterProps) {
    return (
        <div className="mde2-footer">
            <span className="mde2-counter">
                {wordCount}w · {charCount}c
            </span>
            <div className="mde2-actions">
                <button
                    type="button"
                    className="mde2-action-btn"
                    onClick={onCopy}
                    disabled={disabled}
                >
                    {copied ? "✓ copied" : "⧉ copy md"}
                </button>
                <button
                    type="button"
                    className="mde2-action-btn"
                    onClick={onDownload}
                    disabled={disabled}
                >
                    ↓ .md
                </button>
            </div>
        </div>
    );
}