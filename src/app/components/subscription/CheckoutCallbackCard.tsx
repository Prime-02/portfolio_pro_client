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
      icon: <Loader2 size={28} className="animate-spin" />,
      color: "#3b82f6",
      title: "Confirming your payment",
      message: "Give us a moment while we confirm this with Paystack…",
    },
    success: {
      icon: <CheckCircle2 size={28} />,
      color: "#22c55e",
      title: "Payment confirmed",
      message: "Your subscription is now active. Redirecting you back…",
    },
    failed: {
      icon: <XCircle size={28} />,
      color: "#ef4444",
      title: "We couldn't confirm this payment",
      message:
        "If you were charged, don't worry — contact support with your reference below and we'll sort it out.",
    },
    missing: {
      icon: <XCircle size={28} />,
      color: "#ef4444",
      title: "No payment reference found",
      message: "This page is meant to be reached from checkout.",
    },
  };

  const { icon, color, title, message } = config[status];

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <div
        className="flex w-full flex-col items-center gap-4 rounded-2xl border border-[var(--foreground)]/10 p-8 shadow-sm"
        style={{ backgroundColor: getColorShade(theme.background, 1) }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}1A`, color }}
        >
          {icon}
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="font-league text-xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="text-sm leading-relaxed opacity-70">{message}</p>
        </div>

        {reference && (
          <p className="rounded-md bg-[var(--foreground)]/5 px-2.5 py-1 font-mono text-xs opacity-60">
            Ref: {reference}
          </p>
        )}

        {status === "success" && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--foreground)]/10">
            <div
              className="h-full rounded-full"
              style={{
                backgroundColor: color,
                animation: "billing-checkout-progress 2s linear forwards",
              }}
            />
          </div>
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
            className="mt-2 w-full"
          />
        )}
      </div>

      <style jsx>{`
        @keyframes billing-checkout-progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
