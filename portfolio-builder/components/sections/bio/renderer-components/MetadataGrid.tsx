// portfolio-builder/components/sections/bio/renderer-components/MetadataGrid.tsx

interface MetadataGridProps {
  metadata?: { key: string; value: string }[];
  className?: string;
}

export function MetadataGrid({ metadata, className = "" }: MetadataGridProps) {
  if (!metadata || metadata.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Fun Facts
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {metadata.map((meta, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-neutral-800/40 border border-neutral-700/30"
          >
            <p className="text-xs text-neutral-500 mb-1">{meta.key}</p>
            <p className="text-sm text-neutral-200 font-medium">{meta.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
