// src/app/components/profile/edit-components/InlineSaveButton.tsx

type FieldStatus = "unchanged" | "modified" | "saving" | "saved" | "error";

export const InlineSaveButton = ({
    onSave,
    status
}: {
    onSave: () => void;
    status?: FieldStatus;
}) => {
    if (status !== "modified" && status !== "error") return null;

    return (
        <button
            onClick={onSave}
            className="text-xs px-2 py-1 rounded-md bg-(--accent) text-(--background) hover:bg-(--accent)/90 transition-colors"
            title="Save this field"
        >
            {status === "error" ? "Retry" : "Save"}
        </button>
    );
};