import { SubscriptionStatus } from "@/lib/stores/billing/payment-types";
import { statusStyles } from "./utils";

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
}

export default function SubscriptionStatusBadge({
  status,
}: SubscriptionStatusBadgeProps) {
  const { label, color } = statusStyles[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
