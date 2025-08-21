import React from 'react';
import Button from '../buttons/Buttons';
import { useGlobalState } from '@/app/globalStateProvider';
import { useTheme } from './ThemeContext ';

export const SaveCancelButtons = () => {
  const { showSaveButtons, hasUnsavedChanges, saveChanges, cancelChanges } = useTheme();
  const { loading } = useGlobalState();

  if (!showSaveButtons || !hasUnsavedChanges) {
    return null;
  }

  return (
    <div className="flex gap-2 z-50">
      <Button
        onClick={saveChanges}
        variant="outline"
        size="sm"
        disabled={!showSaveButtons || !hasUnsavedChanges}
        loading={loading.includes("updating_user_settings")}
        text="Save Changes"
      />
      <Button
        onClick={cancelChanges}
        variant="ghost"
        size="sm"
        disabled={!showSaveButtons || !hasUnsavedChanges}
        text="Cancel"
      />
    </div>
  );
};

// Alternative version with slide-in animation
export const AnimatedSaveCancelButtons = () => {
  const { showSaveButtons, hasUnsavedChanges, saveChanges, cancelChanges } = useTheme();
  const { loading } = useGlobalState();

  return (
    <div
      className={` flex gap-2 z-50 transform transition-transform duration-300 ease-in-out ${
        showSaveButtons && hasUnsavedChanges
          ? 'translate-y-0 opacity-100'
          : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
    >
      <Button
        onClick={cancelChanges}
        variant="ghost"
        size="sm"
        disabled={!showSaveButtons || !hasUnsavedChanges}
        text="Cancel"
      />
      <Button
        onClick={saveChanges}
        variant="outline"
        size="sm"
        disabled={!showSaveButtons || !hasUnsavedChanges}
        loading={loading.includes("updating_user_settings")}
        text="Save Changes"
      />
    </div>
  );
};

// Toast-style notification version
export const ToastSaveCancelButtons = () => {
  const { showSaveButtons, hasUnsavedChanges, saveChanges, cancelChanges } = useTheme();
  const { loading } = useGlobalState();

  return (
    <div
      className={`fixed top-4 right-4 max-w-md bg-[var(--background)] border border-gray-300 rounded-lg p-4 shadow-lg z-50 transition-all duration-300 ${
        showSaveButtons && hasUnsavedChanges
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-[var(--foreground)]">
          You have unsaved changes
        </h4>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={cancelChanges}
          variant="ghost"
          size="sm"
          disabled={!showSaveButtons || !hasUnsavedChanges}
          text="Cancel"
        />
        <Button
          onClick={saveChanges}
          variant="outline"
          size="sm"
          disabled={!showSaveButtons || !hasUnsavedChanges}
          loading={loading.includes("updating_user_settings")}
          text="Save Changes"
        />
      </div>
    </div>
  );
};