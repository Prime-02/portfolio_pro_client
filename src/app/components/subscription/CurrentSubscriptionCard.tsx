"use client";

import { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/src/context/ThemeContext";
import { getColorShade } from "@/lib/utilities/syncFunctions/syncs";
import Button from "@/src/app/components/buttons/Buttons";
import { selectIsCancelling, useBillingStore } from "@/lib/stores/billing/useBillingStore";
import SubscriptionStatusBadge from "./SubscriptionStatusBadge";
import CancelSubscriptionModal from "./CancelSubscriptionModal";
import { formatDate } from "./utils";
import { extractErrorMessage, SubscriptionStatus } from "@/lib/stores/billing/payment-types";

export default function CurrentSubscriptionCard() {
  const { theme } = useTheme();
  const { subscription, isLoadingSubscription, fetchSubscription } =
    useBillingStore();
  const isCancelling = useBillingStore(selectIsCancelling);
  const [showCancelModal, setShowCancelModal] = useState(false);
  // Local, rather than the store's shared `error` field — fetchPlans can
  // also fail around the same time on mount and would otherwise clobber it.
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSubscription = useCallback(() => {
    setLoadError(null);
    fetchSubscription().catch((err) => {
      setLoadError(extractErrorMessage(err, "Failed to load subscription"));
    });
  }, [fetchSubscription]);

  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  if (isLoadingSubscription && !subscription) {
    return (
      <div className="h-32 animate-pulse rounded-2xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5" />
    );
  }

  if (loadError) {
    return (
      <div
        className="flex flex-col items-start gap-3 rounded-2xl border border-[var(--foreground)]/10 p-6"
        style={{ backgroundColor: getColorShade(theme.background, 1) }}
      >
        <p className="text-sm text-red-500">{loadError}</p>
        <Button text="Retry" variant="outline" size="sm" onClick={loadSubscription} />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div
        className="rounded-2xl border border-[var(--foreground)]/10 p-6"
        style={{ backgroundColor: getColorShade(theme.background, 1) }}
      >
        <p className="text-sm opacity-70">
          You don&apos;t have an active subscription yet. Pick a plan below
          to get started.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl border border-[var(--foreground)]/10 p-6 sm:flex-row sm:items-center sm:justify-between"
      style={{ backgroundColor: getColorShade(theme.background, 1) }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h2 className="font-league text-xl font-semibold">
            Current subscription
          </h2>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>
        <p className="text-sm opacity-70">
          {isCancelling
            ? `Cancels on ${formatDate(subscription.current_period_end)}`
            : `Renews on ${formatDate(subscription.current_period_end)}`}
        </p>
      </div>

      {subscription.status === SubscriptionStatus.ACTIVE && !isCancelling && (
        <Button
          text="Cancel subscription"
          variant="outline"
          onClick={() => setShowCancelModal(true)}
          className="sm:w-auto"
        />
      )}

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onCancelled={loadSubscription}
      />
    </div>
  );
}
