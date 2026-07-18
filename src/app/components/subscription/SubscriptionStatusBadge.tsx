import { SubscriptionStatus } from "@/lib/stores/billing/payment-types";
import { statusStyles, statusPulses } from "./utils";

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
}

export default function SubscriptionStatusBadge({
  status,
}: SubscriptionStatusBadgeProps) {
  const { label, color } = statusStyles[status];
  const pulse = statusPulses(status);

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && (
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
            style={{ backgroundColor: color }}
          />
        )}
        <span
          className="relative inline-flex h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </span>
      {label}
    </span>
  );
}
