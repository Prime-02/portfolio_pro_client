"use client";

import React from "react";
import { Send } from "lucide-react";
import { Textinput } from "../../../inputs/Textinput";
import Button from "../../../buttons/Buttons";

interface ProjectCommentComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  placeholder?: string;
  isSubmitting?: boolean;
  autoFocus?: boolean;
  submitLabel?: string;
  size?: "sm" | "md";
}

export default function ProjectCommentComposer({
  value,
  onChange,
  onSubmit,
  onCancel,
  placeholder = "Write a comment...",
  isSubmitting = false,
  autoFocus = false,
  submitLabel,
  size = "md",
}: ProjectCommentComposerProps) {
  const iconSize = size === "sm" ? 14 : 16;

  return (
    <div className="flex items-end gap-2">
      <div className="flex-1">
        <Textinput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full"
          autoFocus={autoFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            } else if (e.key === "Escape" && onCancel) {
              onCancel();
            }
          }}
        />
      </div>
      {submitLabel ? (
        <Button
          text={submitLabel}
          onClick={onSubmit}
          loading={isSubmitting}
          disabled={!value.trim() || isSubmitting}
          size={size}
          variant="primary"
          className="w-auto px-4"
        />
      ) : (
        <Button
          icon={<Send size={iconSize} />}
          onClick={onSubmit}
          loading={isSubmitting}
          disabled={!value.trim() || isSubmitting}
          size={size}
          variant="primary"
          className="w-auto px-3"
        />
      )}
    </div>
  );
}
