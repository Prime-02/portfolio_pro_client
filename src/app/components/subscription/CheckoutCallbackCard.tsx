"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useTheme } from "@/src/context/ThemeContext";
import { getColorShade } from "@/lib/utilities/syncFunctions/syncs";
import Button from "@/src/app/components/buttons/Buttons";
import { useBillingStore } from "@/lib/stores/billing/useBillingStore";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

type VerifyStatus = "checking" | "success" | "failed" | "missing";

export default function CheckoutCallbackCard() {
  const { theme } = useTheme();
  const {userInfo} = useUserSettings()
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyCheckout = useBillingStore((s) => s.verifyCheckout);
  const [status, setStatus] = useState<VerifyStatus>("checking");

  // Paystack sends `reference`; some setups also pass `trxref`.
  const reference =
    searchParams.get("reference") || searchParams.get("trxref");

  useEffect(() => {
    if (!reference) {
      setStatus("missing");
      return;
    }
    let cancelled = false;

    verifyCheckout(reference)
      .then((result) => {
        if (cancelled) return;
        const ok = result.status?.toLowerCase() === "success";
        setStatus(ok ? "success" : "failed");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  // Auto-redirect a couple seconds after a confirmed success.
  useEffect(() => {
    if (status !== "success") return;
    const timeout = setTimeout(
      () => router.replace(`/${userInfo?.username}/billing?checkout=success`),
      2000,
    );
    return () => clearTimeout(timeout);
  }, [status, router]);

  const config: Record<
    VerifyStatus,
    { icon: React.ReactNode; color: string; title: string; message: string }
  > = {
    checking: {
      icon: <Loader2 size={32} className="animate-spin" />,
      color: "#3b82f6",
      title: "Confirming your payment",
      message: "Give us a moment while we confirm this with Paystack…",
    },
    success: {
      icon: <CheckCircle2 size={32} />,
      color: "#22c55e",
      title: "Payment confirmed",
      message: "Your subscription is now active. Redirecting you back…",
    },
    failed: {
      icon: <XCircle size={32} />,
      color: "#ef4444",
      title: "We couldn't confirm this payment",
      message:
        "If you were charged, don't worry — contact support with your reference below and we'll sort it out.",
    },
    missing: {
      icon: <XCircle size={32} />,
      color: "#ef4444",
      title: "No payment reference found",
      message: "This page is meant to be reached from checkout.",
    },
  };

  const { icon, color, title, message } = config[status];

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <div
        className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--foreground)]/10 p-8"
        style={{ backgroundColor: getColorShade(theme.background, 1) }}
      >
        <div style={{ color }}>{icon}</div>
        <h1 className="font-league text-xl font-semibold">{title}</h1>
        <p className="text-sm opacity-70">{message}</p>
        {reference && (
          <p className="text-xs opacity-50">Reference: {reference}</p>
        )}

        {status !== "checking" && (
          <Button
            text={
              status === "success"
                ? "Go to subscription"
                : "Back to subscription"
            }
            variant={status === "success" ? "primary" : "outline"}
            onClick={() =>
              router.replace(
                status === "success"
                  ? `/${userInfo?.username}/billing?checkout=success`
                  : `/${userInfo?.username}/billing?checkout=failed`,
              )
            }
            className="mt-2"
          />
        )}
      </div>
    </div>
  );
}
