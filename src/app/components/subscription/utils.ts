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

/**
 * Statuses that represent an in-progress or live state, used to decide
 * whether the status badge should show a small live-pulse indicator.
 */
export function statusPulses(status: SubscriptionStatus): boolean {
  return (
    status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.PENDING
  );
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Whole days between now and the given ISO date. Returns null if there's
 * no date, negative values if the date is in the past.
 */
export function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diffMs = new Date(iso).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
