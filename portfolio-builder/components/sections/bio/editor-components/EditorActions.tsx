// portfolio-builder/components/sections/bio/editor-components/EditorActions.tsx

interface EditorActionsProps {
  hasChanges: boolean;
  isValid: boolean;
  saveStatus: string;
  saveStatusColor: string;
  onSave: () => void;
  onCancel: () => void;
}

const saveButtonClass =
  "px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const cancelButtonClass =
  "px-4 py-2 bg-neutral-800 text-neutral-300 text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors";

export default function EditorActions({
  hasChanges,
  isValid,
  saveStatus,
  saveStatusColor,
  onSave,
  onCancel,
}: EditorActionsProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-900">
      <p className={`text-xs ${saveStatusColor}`}>{saveStatus}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className={cancelButtonClass}>
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!isValid || !hasChanges}
          className={saveButtonClass}
        >
          Save Now
        </button>
      </div>
    </div>
  );
}
