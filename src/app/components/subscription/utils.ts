import { BillingInterval, SubscriptionStatus } from "@/lib/stores/billing/payment-types";

/**
 * amount_minor_unit is assumed to be a 2-decimal minor unit (e.g. kobo/cents).
 * If a currency you support doesn't use 2 decimals, adjust the divisor here.
 */
export function formatMoney(amountMinorUnit: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amountMinorUnit / 100);
  } catch {
    return `${currency} ${(amountMinorUnit / 100).toFixed(2)}`;
  }
}

export const intervalLabel: Record<BillingInterval, string> = {
  [BillingInterval.HOURLY]: "/ hour",
  [BillingInterval.DAILY]: "/ day",
  [BillingInterval.WEEKLY]: "/ week",
  [BillingInterval.MONTHLY]: "/ month",
  [BillingInterval.QUARTERLY]: "/ quarter",
  [BillingInterval.BIANNUALLY]: "/ 6 months",
  [BillingInterval.ANNUALLY]: "/ year",
};

export const statusStyles: Record<
  SubscriptionStatus,
  { label: string; color: string }
> = {
  [SubscriptionStatus.ACTIVE]: { label: "Active", color: "#22c55e" },
  [SubscriptionStatus.PENDING]: { label: "Pending", color: "#3b82f6" },
  [SubscriptionStatus.PAST_DUE]: { label: "Past due", color: "#f59e0b" },
  [SubscriptionStatus.CANCELLED]: { label: "Cancelled", color: "#9ca3af" },
  [SubscriptionStatus.EXPIRED]: { label: "Expired", color: "#ef4444" },
};

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
