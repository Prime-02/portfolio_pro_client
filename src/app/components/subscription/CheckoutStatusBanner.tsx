"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { useBillingStore } from "@/lib/stores/billing/useBillingStore";
import { useRouting } from "@/lib/hooks/routing/useRouting";

export default function CheckoutStatusBanner() {
  const {clearQueryParam, checkParams} = useRouting()
  const checkout = checkParams("checkout");
  const [dismissed, setDismissed] = useState(false);
  const fetchSubscription = useBillingStore((s) => s.fetchSubscription);

  useEffect(() => {
    if (checkout === "success") {
      fetchSubscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkout]);

  if (!checkout || dismissed) return null;

  const isSuccess = checkout === "success";
  const color = isSuccess ? "#22c55e" : "#ef4444";

  const dismiss = () => {
    setDismissed(true);
    clearQueryParam(["checkout"]);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-medium"
      style={{
        backgroundColor: `${color}1A`,
        color,
        borderColor: `${color}33`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <span className="shrink-0">
          {isSuccess ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
        </span>
        {isSuccess
          ? "Payment confirmed. Your subscription is now active."
          : "We couldn't confirm your last payment. Contact support if you were charged."}
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
      >
        <X size={14} />
      </button>
    </div>
  );
}
