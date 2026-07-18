"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { useBillingStore } from "@/lib/stores/billing/useBillingStore";

export default function CheckoutStatusBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const checkout = searchParams.get("checkout");
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
    router.replace(pathname);
  };

  return (
    <div
      className="mb-6 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <div className="flex items-center gap-2">
        {isSuccess ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
        {isSuccess
          ? "Payment confirmed. Your subscription is now active."
          : "We couldn't confirm your last payment. Contact support if you were charged."}
      </div>
      <button onClick={dismiss} className="text-xs underline opacity-70">
        Dismiss
      </button>
    </div>
  );
}
