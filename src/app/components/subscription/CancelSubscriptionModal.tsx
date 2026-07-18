"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle } from "lucide-react";
import ConfirmationModal from "@/src/app/components/containers/modals/ConfirmationModal";
import { useBillingStore } from "@/lib/stores/billing/useBillingStore";
import { extractErrorMessage } from "@/lib/stores/billing/payment-types";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelled?: () => void;
}

export default function CancelSubscriptionModal({
  isOpen,
  onClose,
  onCancelled,
}: CancelSubscriptionModalProps) {
  const cancelSubscription = useBillingStore((s) => s.cancelSubscription);
  const [atPeriodEnd, setAtPeriodEnd] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    try {
      await cancelSubscription(atPeriodEnd);
      onCancelled?.();
      onClose();
    } catch (err) {
      // Swallow here so ConfirmationModal (which has no catch of its own)
      // doesn't throw — keep the modal open and show the reason instead.
      setError(extractErrorMessage(err, "Failed to cancel subscription"));
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      variant="danger"
      title="Cancel subscription?"
      confirmText="Cancel subscription"
      cancelText="Keep subscription"
      message={
        <div className="flex flex-col gap-4 text-left">
          <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 px-3.5 py-3 text-red-500">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p className="text-sm">
              You&apos;ll lose access to paid features once the cancellation
              takes effect. This can&apos;t be undone.
            </p>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-[var(--foreground)]/10 px-3.5 py-3 transition-colors hover:border-[var(--foreground)]/20">
            <input
              type="checkbox"
              checked={atPeriodEnd}
              onChange={(e) => setAtPeriodEnd(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--accent)]"
            />
            <span className="text-sm opacity-80">
              Cancel at the end of the current billing period instead of
              immediately.
            </span>
          </label>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}
        </div>
      }
    />
  );
}
