// components/profile/FieldUpdateButton.tsx
import React from "react";
import Button from "@/app/components/buttons/Buttons";
import { Save, CheckCircle, AlertCircle } from "lucide-react";
import { FieldUpdateState } from "@/app/components/types and interfaces/userprofile";

interface FieldUpdateButtonProps {
  fieldName: string;
  fieldStates: FieldUpdateState;
  validationErrors: Record<string, string>;
  isUserInfo?: boolean;
  className?: string;
  onUpdate: (fieldName: string, isUserInfo: boolean) => void;
  onRevert: (fieldName: string, isUserInfo: boolean) => void;
}

const FieldUpdateButton: React.FC<FieldUpdateButtonProps> = ({
  fieldName,
  fieldStates,
  validationErrors,
  isUserInfo = true,
  className = "",
  onUpdate,
  onRevert,
}) => {
  const state = fieldStates[fieldName];
  const hasError = validationErrors[fieldName];

  if (!state?.isChanged && !state?.lastSaved) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {state.isChanged && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRevert(fieldName, isUserInfo)}
            text="Revert"
            disabled={state.isUpdating}
          />
          <Button
            size="sm"
            variant="primary"
            onClick={() => onUpdate(fieldName, isUserInfo)}
            text="Update"
            loading={state.isUpdating}
            disabled={state.isUpdating || !!hasError}
            icon={<Save size={12} />}
          />
        </>
      )}
      {state.lastSaved && !state.isChanged && (
        <span className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle size={12} />
          Updated {state.lastSaved.toLocaleTimeString()}
        </span>
      )}
      {state.error && (
        <span className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle size={12} />
          {state.error}
        </span>
      )}
    </div>
  );
};

export default FieldUpdateButton;
