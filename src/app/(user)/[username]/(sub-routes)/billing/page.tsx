"use client";

import { Suspense } from "react";
import CheckoutStatusBanner from "@/src/app/components/subscription/CheckoutStatusBanner";
import CurrentSubscriptionCard from "@/src/app/components/subscription/CurrentSubscriptionCard";
import PlanGrid from "@/src/app/components/subscription/PlanGrid";
import { useBillingStore } from "@/lib/stores/billing/useBillingStore";

function SubscriptionPageContent() {
  const subscription = useBillingStore((s) => s.subscription);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <div>
        <h1 className="font-league text-2xl font-bold">
          Billing &amp; subscription
        </h1>
        <p className="mt-1 text-sm opacity-70">
          Manage your plan, payment status, and upcoming renewal.
        </p>
      </div>

      <CheckoutStatusBanner />

      <CurrentSubscriptionCard />

      <div className="flex flex-col gap-4">
        <h2 className="font-league text-lg font-semibold">
          Available plans
        </h2>
        <PlanGrid
          currentPlanId={subscription?.plan_id}
          callbackUrl={
            typeof window !== "undefined"
              ? `${window.location.origin}/subscription/callback`
              : undefined
          }
        />
      </div>
    </div>
  );
}

// useSearchParams (inside CheckoutVerifyBanner) requires a Suspense boundary
// in the App Router, hence the wrapper below.
export default function SubscriptionPage() {
  return (
    <Suspense fallback={null}>
      <SubscriptionPageContent />
    </Suspense>
  );
}
