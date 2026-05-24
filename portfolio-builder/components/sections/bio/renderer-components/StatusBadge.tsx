// portfolio-builder/components/sections/bio/renderer-components/StatusBadge.tsx

import { BioStatus, AvailabilityStatus } from "@/portfolio-builder/types/bio";

interface StatusBadgeProps {
  status?: BioStatus;
  className?: string;
}

const STATUS_CONFIG: Record<AvailabilityStatus, { label: string; colorVar: string; bgVar: string }> = {
  "open-to-work": {
    label: "Open to Work",
    colorVar: "var(--pb-success)",
    bgVar: "var(--pb-success-bg)",
  },
  freelancing: {
    label: "Freelancing",
    colorVar: "var(--pb-info)",
    bgVar: "var(--pb-info-bg)",
  },
  hiring: {
    label: "Hiring",
    colorVar: "var(--pb-accent)",
    bgVar: "var(--pb-accent-bg)",
  },
  "open-to-collaborate": {
    label: "Open to Collaborate",
    colorVar: "var(--pb-warning)",
    bgVar: "var(--pb-warning-bg)",
  },
  "not-available": {
    label: "Not Available",
    colorVar: "var(--pb-error)",
    bgVar: "var(--pb-error-bg)",
  },
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  if (!status) return null;

  const config = STATUS_CONFIG[status.type];
  const displayLabel = status.label || config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${className}`}
      style={{
        color: config.colorVar,
        backgroundColor: config.bgVar,
        border: `1px solid ${config.colorVar}30`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: config.colorVar }}
      />
      {displayLabel}
    </span>
  );
}