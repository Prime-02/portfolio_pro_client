// portfolio-builder/components/sections/layout/editor-components/LayoutEditorActions.tsx

"use client";

interface LayoutEditorActionsProps {
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

export default function LayoutEditorActions({
    isSaving,
    onSave,
    onCancel,
}: LayoutEditorActionsProps) {
    return (
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--pb-border)] bg-[var(--pb-surface)] shrink-0">
            <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="px-4 py-2 text-sm text-[var(--pb-text-secondary)] border border-[var(--pb-border)] rounded-lg hover:border-[var(--pb-border-hover)] hover:bg-[var(--pb-surface-hover)] hover:text-[var(--pb-text-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="px-5 py-2 text-sm font-medium bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg hover:bg-[var(--pb-foreground-80)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSaving ? "Saving…" : "Save Layout"}
            </button>
        </div>
    );
}