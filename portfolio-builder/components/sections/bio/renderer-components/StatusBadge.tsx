// portfolio-builder/components/sections/bio/renderer-components/StatusBadge.tsx

import { BioStatus, AvailabilityStatus } from "@/portfolio-builder/types/bio";

interface StatusBadgeProps {
  status?: BioStatus;
  className?: string;
}

const STATUS_CONFIG: Record<AvailabilityStatus, { label: string; color: string; bgColor: string }> = {
  "open-to-work": {
    label: "Open to Work",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.15)",
  },
  freelancing: {
    label: "Freelancing",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.15)",
  },
  hiring: {
    label: "Hiring",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.15)",
  },
  "open-to-collaborate": {
    label: "Open to Collaborate",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.15)",
  },
  "not-available": {
    label: "Not Available",
    color: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.15)",
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
        color: config.color,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}30`,
      }}
    >
      <span
        className="w-2 h-2 rounded-full animate-pulse"
        style={{ backgroundColor: config.color }}
      />
      {displayLabel}
    </span>
  );
}
