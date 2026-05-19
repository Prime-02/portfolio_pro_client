// EditorPane.tsx
"use client";

import { forwardRef } from "react";

interface EditorPaneProps {
    disabled: boolean;
    placeholder: string;
    onInput: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
    onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
}

export const EditorPane = forwardRef<HTMLDivElement, EditorPaneProps>(
    function EditorPane({ disabled, placeholder, onInput, onKeyDown, onPaste }, ref) {
        return (
            <div className="mde2-pane">
                <div
                    ref={ref}
                    className="mde2-editor"
                    contentEditable={!disabled}
                    suppressContentEditableWarning
                    data-placeholder={placeholder}
                    onInput={onInput}
                    onKeyDown={onKeyDown}
                    onPaste={onPaste}
                    spellCheck
                />
            </div>
        );
    }
);