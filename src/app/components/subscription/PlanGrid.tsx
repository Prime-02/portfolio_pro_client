"use client";

import { useCallback, useEffect, useState } from "react";
import { useBillingStore } from "@/lib/stores/billing/useBillingStore";
import Button from "@/src/app/components/buttons/Buttons";
import PlanCard from "./PlanCard";
import { extractErrorMessage, SubscriptionPlanResponse } from "@/lib/stores/billing/payment-types";

interface PlanGridProps {
  currentPlanId?: string | null;
  callbackUrl?: string;
}

export default function PlanGrid({
  currentPlanId,
  callbackUrl,
}: PlanGridProps) {
  const { plans, isLoadingPlans, fetchPlans, initializeCheckout } =
    useBillingStore();
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  // Local state for both errors below — not the store's shared `error`
  // field, since fetchSubscription can be failing concurrently on mount
  // and would otherwise overwrite whichever message renders here.
  const [loadError, setLoadError] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const loadPlans = useCallback(() => {
    setLoadError(null);
    fetchPlans().catch((err) => {
      setLoadError(extractErrorMessage(err, "Failed to load plans"));
    });
  }, [fetchPlans]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleSelect = async (plan: SubscriptionPlanResponse) => {
    setCheckoutError(null);
    setCheckoutPlanId(plan.id);
    try {
      const { authorization_url } = await initializeCheckout(
        plan.id,
        callbackUrl,
      );
      window.location.href = authorization_url;
    } catch (err) {
      setCheckoutError(
        extractErrorMessage(err, "Failed to start checkout for this plan"),
      );
      setCheckoutPlanId(null);
    }
  };

  if (isLoadingPlans && plans.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-2xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5"
          />
        ))}
      </div>
    );
  }

  if (loadError && plans.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="text-sm text-red-500">{loadError}</p>
        <Button text="Retry" variant="outline" size="sm" onClick={loadPlans} />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <p className="text-sm opacity-70">No plans available right now.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {checkoutError && (
        <p className="text-sm text-red-500">{checkoutError}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === currentPlanId}
            isLoading={checkoutPlanId === plan.id}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
