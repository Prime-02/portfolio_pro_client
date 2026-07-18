"use client";

import { useState } from "react";
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
        <div className="flex flex-col gap-3 text-left">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={atPeriodEnd}
              onChange={(e) => setAtPeriodEnd(e.target.checked)}
              className="mt-1"
            />
            <span>
              Cancel at the end of the current billing period instead of
              immediately.
            </span>
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      }
    />
  );
}
