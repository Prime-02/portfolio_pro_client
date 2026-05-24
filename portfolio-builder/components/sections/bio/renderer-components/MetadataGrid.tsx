// portfolio-builder/components/sections/bio/renderer-components/MetadataGrid.tsx

interface MetadataGridProps {
  metadata?: { key: string; value: string }[];
  className?: string;
}

export function MetadataGrid({ metadata, className = "" }: MetadataGridProps) {
  if (!metadata || metadata.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--pb-text-muted)]">
        Fun Facts
      </h4>
      <div className="flex flex-col gap-3">
        {metadata.map((meta, index) => (
          <div
            key={index}
            className="p-3 w-full rounded-lg bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)]"
          >
            <p className="text-xs text-[var(--pb-text-muted)] mb-1">{meta.key}</p>
            <p className="text-sm text-[var(--pb-text-primary)] font-medium">{meta.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}