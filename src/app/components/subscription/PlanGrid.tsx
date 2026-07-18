"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, PackageOpen } from "lucide-react";
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
            className="flex h-64 animate-pulse flex-col gap-4 rounded-2xl border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 p-6"
          >
            <div className="h-5 w-24 rounded bg-[var(--foreground)]/10" />
            <div className="h-8 w-32 rounded bg-[var(--foreground)]/10" />
            <div className="h-4 w-full rounded bg-[var(--foreground)]/10" />
            <div className="h-4 w-2/3 rounded bg-[var(--foreground)]/10" />
            <div className="mt-auto h-9 w-full rounded-lg bg-[var(--foreground)]/10" />
          </div>
        ))}
      </div>
    );
  }

  if (loadError && plans.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-2xl border border-red-500/20 p-6">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle size={18} />
          <p className="text-sm font-medium">{loadError}</p>
        </div>
        <Button text="Retry" variant="outline" size="sm" onClick={loadPlans} />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--foreground)]/15 py-12 text-center">
        <PackageOpen size={24} className="opacity-40" />
        <p className="text-sm opacity-70">No plans available right now.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {checkoutError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-500">
          <AlertCircle size={16} className="shrink-0" />
          {checkoutError}
        </div>
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
