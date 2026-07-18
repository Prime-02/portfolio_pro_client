// portfolio-builder/components/sections/education/editor-components/EducationEditorActions.tsx

interface EducationEditorActionsProps {
  hasChanges: boolean;
  isSaving: boolean;
  saveStatus: string;
  saveStatusColor: string;
  onSave: () => void;
  onCancel: () => void;
}

const saveButtonClass =
  "px-4 py-2 bg-[var(--pb-foreground)] text-[var(--pb-background)] text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed";

const cancelButtonClass =
  "px-4 py-2 bg-[var(--pb-surface)] text-[var(--pb-text-secondary)] text-sm font-medium rounded-lg hover:bg-[var(--pb-surface-hover)] transition-colors border border-[var(--pb-border)]";

export default function EducationEditorActions({
  hasChanges,
  saveStatus,
  saveStatusColor,
  onSave,
  onCancel,
  isSaving
}: EducationEditorActionsProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--pb-border)] bg-[var(--pb-surface)]">
      <p className={`text-xs ${saveStatusColor}`}>{saveStatus}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className={cancelButtonClass}>
          Cancel
        </button>
        <button onClick={onSave} disabled={!hasChanges || isSaving} className={saveButtonClass}>
          Save Now
        </button>
      </div>
    </div>
  );
}
