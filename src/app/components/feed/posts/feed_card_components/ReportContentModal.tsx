"use client";

import React, { useCallback, useState } from "react";
import { useContentReportStore } from "@/lib/stores/contents";
import { Textinput } from "../../../inputs/Textinput";
import Button from "../../../buttons/Buttons";
import Modal from "../../../containers/modals/Modal";

interface ReportContentModalProps {
  contentId: string;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  "spam",
  "harassment",
  "inappropriate",
  "copyright",
  "misinformation",
  "other",
];

export default function ReportContentModal({
  contentId,
  isOpen,
  onClose,
}: ReportContentModalProps) {
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportContent = useContentReportStore((s) => s.reportContent);

  const reset = useCallback(() => {
    setReportReason("");
    setReportDescription("");
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!reportReason) return;
    setIsSubmitting(true);
    try {
      await reportContent({
        content_id: contentId,
        reason: reportReason,
        description: reportDescription || undefined,
      });
      handleClose();
    } catch {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  }, [reportReason, reportDescription, contentId, reportContent, handleClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Report Content" size="sm" centered>
      <div className="space-y-4">
        <p className="text-sm text-[var(--foreground)]/70">
          Why are you reporting this content?
        </p>

        <div className="space-y-2">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => setReportReason(reason)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                reportReason === reason
                  ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30"
                  : "bg-[var(--foreground)]/5 text-[var(--foreground)] hover:bg-[var(--foreground)]/10"
              }`}
            >
              {reason.charAt(0).toUpperCase() + reason.slice(1)}
            </button>
          ))}
        </div>

        <Textinput
          label="Additional details (optional)"
          value={reportDescription}
          onChange={setReportDescription}
          placeholder="Describe the issue..."
          className="w-full"
        />

        <div className="flex gap-3 pt-2">
          <Button text="Cancel" variant="outline" onClick={handleClose} className="flex-1" />
          <Button
            text="Submit Report"
            variant="danger"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={!reportReason || isSubmitting}
            className="flex-1"
          />
        </div>
      </div>
    </Modal>
  );
}
