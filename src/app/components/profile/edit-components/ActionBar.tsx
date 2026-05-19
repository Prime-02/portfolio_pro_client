// src/app/components/profile/edit-components/ActionBar.tsx

interface ActionBarProps {
    onCancel: () => void;
    onSave: () => void;
    isSaving?: boolean;
    saveStatus: "idle" | "saved" | "error";
}

export const ActionBar = ({ onCancel, onSave, isSaving, saveStatus }: ActionBarProps) => {
    return (
        <div className="flex items-center justify-between gap-4 pt-2">
            <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border border-(--foreground)/20 text-(--foreground)/70 font-league-500 text-sm hover:border-(--foreground)/40 hover:text-(--foreground) transition-all"
            >
                Cancel
            </button>

            <div className="flex items-center gap-3">
                {saveStatus === "saved" && (
                    <span className="text-sm text-green-500 font-league-500 flex items-center gap-1.5 animate-fade-in">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Saved
                    </span>
                )}
                {saveStatus === "error" && (
                    <span className="text-sm text-red-500 font-league-500">Failed to save</span>
                )}
                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-(--accent) text-(--background) font-league-500 text-sm hover:bg-(--accent)/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <span className="w-4 h-4 border-2 border-(--background)/30 border-t-(--background) rounded-full animate-spin" />
                            Saving…
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </button>
            </div>
        </div>
    );
};