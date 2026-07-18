"use client";

import { Suspense } from "react";
import { CreditCard } from "lucide-react";
import CheckoutStatusBanner from "@/src/app/components/subscription/CheckoutStatusBanner";
import CurrentSubscriptionCard from "@/src/app/components/subscription/CurrentSubscriptionCard";
import PlanGrid from "@/src/app/components/subscription/PlanGrid";
import { useBillingStore } from "@/lib/stores/billing/useBillingStore";
import { PageHeader } from "@/src/app/components/ui/PageHeader";

function SubscriptionPageContent() {
  const subscription = useBillingStore((s) => s.subscription);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10">
      <PageHeader
        title="Billling & subscription"
        description="Manage your plan, payment status, and upcoming renewal."
        icon={<CreditCard className="h-6 w-6" />}
      />

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