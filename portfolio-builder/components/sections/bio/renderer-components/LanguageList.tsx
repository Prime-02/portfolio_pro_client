// portfolio-builder/components/sections/bio/renderer-components/LanguageList.tsx

import { BioLanguage } from "@/portfolio-builder/types/bio";

interface LanguageListProps {
  languages?: BioLanguage[];
  className?: string;
}

const PROFICIENCY_LABELS: Record<BioLanguage["proficiency"], string> = {
  native: "Native",
  fluent: "Fluent",
  conversational: "Conversational",
  basic: "Basic",
};

export function LanguageList({ languages, className = "" }: LanguageListProps) {
  if (!languages || languages.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--pb-text-muted)]">
        Languages
      </h4>
      <div className="flex flex-wrap gap-2">
        {languages.map((lang, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-sm text-[var(--pb-text-primary)]"
          >
            <span>{lang.language}</span>
            <span className="text-xs text-[var(--pb-text-muted)]">{PROFICIENCY_LABELS[lang.proficiency]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}