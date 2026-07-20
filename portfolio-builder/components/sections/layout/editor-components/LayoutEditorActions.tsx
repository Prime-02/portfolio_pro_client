// portfolio-builder/components/sections/layout/editor-components/LayoutEditorActions.tsx

"use client";

import { useRouting } from "@/lib/hooks/routing/useRouting";
import { PBButton } from "@/portfolio-builder/components/shared/ui/inputs";

interface LayoutEditorActionsProps {
    onCLose: () => void;
}

export default function LayoutEditorActions({
    onCLose,
}: LayoutEditorActionsProps) {
    const { router } = useRouting()
    return (
        <div className="flex items-center justify-end gap-3 p-4 border-t border-[var(--pb-border)] bg-[var(--pb-surface)] shrink-0">
            <PBButton
                type="button"
                onClick={() => {
                    router.back()
                }}
                text="Go Back"
                size="sm"
               />
            <PBButton
                type="button"
                onClick={onCLose}
                title="Close editor without saving (Ctrl + .)"
                text="Close"
                variant="outline"
                size="sm"
               />
        </div>
    );
}