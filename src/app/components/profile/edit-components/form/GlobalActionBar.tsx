// src/app/components/profile/edit-components/form/GlobalActionBar.tsx

import React from "react";

interface GlobalActionBarProps {
    modifiedFieldsCount: number;
    globalSaveStatus: "idle" | "saving" | "saved" | "error";
    isSaving: boolean;
    onSaveAll: () => Promise<void>;
    onCancel: () => void;
}

export const GlobalActionBar = ({
    modifiedFieldsCount,
    globalSaveStatus,
    isSaving,
    onSaveAll,
    onCancel,
}: GlobalActionBarProps) => {
    const hasModifications = modifiedFieldsCount > 0;

    return (
        <div className="sticky bottom-0 bg-(--background) py-4 -mx-2 px-2 border-t z-50 border-(--foreground)/10">
            <div className="flex items-center justify-between">
                <div className="text-sm text-(--foreground)/50">
                    {hasModifications ? (
                        <span>{modifiedFieldsCount} field{modifiedFieldsCount !== 1 ? 's' : ''} modified</span>
                    ) : (
                        <span>All changes saved</span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {globalSaveStatus === "saved" && (
                        <span className="text-sm text-green-500 font-league-500 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            All saved
                        </span>
                    )}
                    {globalSaveStatus === "error" && (
                        <span className="text-sm text-red-500 font-league-500">Failed to save</span>
                    )}
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl border border-(--foreground)/20 text-(--foreground)/70 font-league-500 text-sm hover:border-(--foreground)/40 hover:text-(--foreground) transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSaveAll}
                        disabled={isSaving || !hasModifications}
                        className="px-6 py-2.5 rounded-xl bg-(--accent) text-(--background) font-league-500 text-sm hover:bg-(--accent)/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {globalSaveStatus === "saving" ? (
                            <>
                                <span className="w-4 h-4 border-2 border-(--background)/30 border-t-(--background) rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            `Save All Changes${hasModifications ? ` (${modifiedFieldsCount})` : ''}`
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};