// components/CVGenerator/CVConfig.tsx
import { useMemo, useState } from "react";
import type {
  CVConfigProps,
  ComplexityMode,
  ToneMode,
  CVSource,
  CustomVisibilityConfig,
} from "./types";
import {
  COMPLEXITY_MODES,
  TONES,
  ALL_SECTIONS,
  CV_SOURCES,
  VISIBILITY_FIELDS,
} from "./constants";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import Button from "@/src/app/components/buttons/Buttons";
import { ChevronDown, ChevronUp } from "lucide-react";

/**
 * Visual language for this screen uses only the two color tokens defined in
 * globals.css — var(--background) and var(--foreground) — via the existing
 * .card / .reverse-card utilities. Every selectable control shares the same
 * grammar: a hairline outline by default, a full foreground/background
 * invert (.reverse-card) when selected. No accent hue, no shadows.
 */

export default function CVConfig({
  complexity,
  tone,
  sections,
  source,
  selectedPortfolioId,
  loading,
  error,
  portfolios,
  portfolioLoading,
  portfolioError,
  customVisibility,
  onComplexityChange,
  onToneChange,
  onSectionsChange,
  onSourceChange,
  onPortfolioChange,
  onCustomVisibilityChange,
  onGenerate,
}: CVConfigProps) {
  const toggleSection = (id: string) => {
    onSectionsChange(
      sections.includes(id)
        ? sections.filter((s) => s !== id)
        : [...sections, id]
    );
  };

  const selectedMode = COMPLEXITY_MODES.find((m) => m.id === complexity);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-league-800 text-3xl md:text-4xl tracking-tight text-[var(--foreground)]">
          Generate CV
        </h1>
        <p className="text-sm mt-2 text-[var(--foreground)]/60">
          Work through each step below, then preview and download the result.
        </p>
      </div>

      <ConfigStep index="01" label="Data Source">
        <CVSourceSelector
          source={source}
          selectedPortfolioId={selectedPortfolioId}
          portfolios={portfolios}
          portfolioLoading={portfolioLoading}
          portfolioError={portfolioError}
          onSourceChange={onSourceChange}
          onPortfolioChange={onPortfolioChange}
        />
      </ConfigStep>

      <ConfigStep index="02" label="Complexity Level">
        <CVComplexitySelector complexity={complexity} onChange={onComplexityChange} />
      </ConfigStep>

      <ConfigStep index="03" label="Tone / Style">
        <CVToneSelector tone={tone} onChange={onToneChange} />
      </ConfigStep>

      <ConfigStep
        index="04"
        label="Sections"
        hint={complexity === "custom" ? "toggle to include or exclude" : undefined}
      >
        <CVSectionSelector sections={sections} onToggle={toggleSection} />
      </ConfigStep>

      {complexity === "custom" && (
        <ConfigStep index="05" label="Field Visibility" hint="choose exactly what shows per section">
          <CVFieldVisibilityPanel
            sections={sections}
            customVisibility={customVisibility}
            onChange={onCustomVisibilityChange}
          />
        </ConfigStep>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 mb-8 rounded-xl border border-dashed border-[var(--foreground)]/40 text-[var(--foreground)]">
          <i className="ti ti-alert-triangle flex-shrink-0 mt-0.5" style={{ fontSize: 16 }} />
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--foreground)]/50 mb-1">
              Error
            </div>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Manifest + Generate */}
      <CVSummary
        mode={selectedMode?.label}
        tone={tone}
        sectionCount={sections.length}
        source={source}
        isDetailed={complexity === "detailed"}
      />

      <Button
        onClick={onGenerate}
        loading={loading}
        disabled={loading || sections.length === 0}
        size="sm"
        text="Generate CV"
      />
    </div>
  );
}

// ── Step wrapper (numbered eyebrow + hairline rule) ─────────────────────────
function ConfigStep({
  index,
  label,
  hint,
  children,
}: {
  index: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-10">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-mono text-[11px] text-[var(--foreground)]/35">{index}</span>
        <h2 className="font-league-700 text-xs uppercase tracking-[0.16em] text-[var(--foreground)]">
          {label}
        </h2>
        {hint && (
          <span className="text-[11px] text-[var(--foreground)]/45 normal-case tracking-normal">
            {hint}
          </span>
        )}
        <span className="h-px flex-1 bg-[var(--foreground)]/10" />
      </div>
      {children}
    </div>
  );
}

// ── Shared option tile ───────────────────────────────────────────────────────
function OptionTile({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-start gap-2 p-4 rounded-xl text-left transition-colors duration-150 border ${active
        ? "reverse-card border-[var(--foreground)]"
        : "card border-[var(--foreground)]/15 hover:border-[var(--foreground)]/35 hover:bg-[var(--foreground)]/[0.03]"
        }`}
    >
      <div className="flex items-center gap-2 w-full">
        <i className={`ti ${icon}`} style={{ fontSize: 15 }} />
        <span className="text-sm font-semibold">{title}</span>
        {active && <i className="ti ti-check ml-auto" style={{ fontSize: 13 }} />}
      </div>
      <p className={`text-xs leading-relaxed ${active ? "opacity-75" : "text-[var(--foreground)]/55"}`}>
        {description}
      </p>
    </button>
  );
}

// ── Source Selector ────────────────────────────────────────────────────────
function CVSourceSelector({
  source,
  selectedPortfolioId,
  portfolios,
  portfolioLoading,
  portfolioError,
  onSourceChange,
  onPortfolioChange,
}: {
  source: CVSource;
  selectedPortfolioId: string | null;
  portfolios: Array<{ slug: string; name: string; is_default?: boolean }>;
  portfolioLoading: boolean;
  portfolioError: string | null;
  onSourceChange: (source: CVSource) => void;
  onPortfolioChange: (portfolioId: string | null) => void;
}) {
  const formattedPortfolios = useMemo(
    () =>
      portfolios.map((portfolio) => ({
        id: portfolio.slug,
        code: portfolio.name,
      })),
    [portfolios]
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CV_SOURCES.map((s) => (
          <OptionTile
            key={s.id}
            active={source === s.id}
            icon={s.icon}
            title={s.label}
            description={s.description}
            onClick={() => onSourceChange(s.id)}
          />
        ))}
      </div>

      {/* Portfolio Selector — rendered inline, right below the source tiles */}
      {source === "portfolio" && (
        <div className="mt-4 rounded-xl border border-[var(--foreground)]/15 p-3">
          <Dropdown
            options={formattedPortfolios}
            value={selectedPortfolioId ?? ""}
            includeNoneOption={false}
            onSelect={(e: string | string[]) => onPortfolioChange((e || "") as string)}
            label="Select Portfolio"
            loading={portfolioLoading}
          />
          {portfolioError && (
            <p className="text-xs mt-2 text-[var(--foreground)]/70">{portfolioError}</p>
          )}
          {!portfolioLoading && portfolios.length === 0 && (
            <p className="text-xs mt-2 text-[var(--foreground)]/40">
              No portfolios found. Create a portfolio first.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Complexity Selector ──────────────────────────────────────────────────────
function CVComplexitySelector({
  complexity,
  onChange,
}: {
  complexity: ComplexityMode;
  onChange: (mode: ComplexityMode) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {COMPLEXITY_MODES.map((mode) => (
        <OptionTile
          key={mode.id}
          active={complexity === mode.id}
          icon={mode.icon}
          title={mode.label}
          description={mode.description}
          onClick={() => onChange(mode.id as ComplexityMode)}
        />
      ))}
    </div>
  );
}

// ── Tone Selector ────────────────────────────────────────────────────────────
function CVToneSelector({
  tone,
  onChange,
}: {
  tone: ToneMode;
  onChange: (tone: ToneMode) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {TONES.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id as ToneMode)}
          className={`relative p-4 rounded-xl text-left transition-colors duration-150 border ${tone === t.id
            ? "reverse-card border-[var(--foreground)]"
            : "card border-[var(--foreground)]/15 hover:border-[var(--foreground)]/35 hover:bg-[var(--foreground)]/[0.03]"
            }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">{t.label}</span>
            {tone === t.id && <i className="ti ti-check" style={{ fontSize: 13 }} />}
          </div>
          <p className={`text-xs leading-relaxed ${tone === t.id ? "opacity-75" : "text-[var(--foreground)]/55"}`}>
            {t.description}
          </p>
        </button>
      ))}
    </div>
  );
}

// ── Section Toggle ───────────────────────────────────────────────────────────
function CVSectionSelector({
  sections,
  onToggle,
}: {
  sections: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ALL_SECTIONS.map((s) => {
        const active = sections.includes(s.id);
        return (
          <button
            key={s.id}
            onClick={() => onToggle(s.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors duration-150 border ${active
              ? "reverse-card border-[var(--foreground)] font-medium"
              : "card border-[var(--foreground)]/15 text-[var(--foreground)]/45 hover:border-[var(--foreground)]/35"
              }`}
          >
            <i className={`ti ${s.icon}`} style={{ fontSize: 14 }} />
            {s.label}
            {active && <i className="ti ti-check" style={{ fontSize: 12 }} />}
          </button>
        );
      })}
    </div>
  );
}

// ── Field Visibility Panel (Custom mode only) ────────────────────────────────
function CVFieldVisibilityPanel({
  sections,
  customVisibility,
  onChange,
}: {
  sections: string[];
  customVisibility: CustomVisibilityConfig;
  onChange: (config: CustomVisibilityConfig) => void;
}) {
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  // Only sections that (a) are currently included and (b) actually have
  // wired-up visibility fields (e.g. "bio" has none — it's just on/off).
  const applicableSections = ALL_SECTIONS.filter(
    (s) => sections.includes(s.id) && VISIBILITY_FIELDS[s.id]
  );

  if (applicableSections.length === 0) return null;

  const isFieldVisible = (sectionId: string, key: string) =>
    customVisibility[sectionId]?.[key] !== false; // undefined = visible

  const toggleField = (sectionId: string, key: string) => {
    const current = customVisibility[sectionId] || {};
    const currentlyVisible = current[key] !== false;
    onChange({
      ...customVisibility,
      [sectionId]: { ...current, [key]: !currentlyVisible },
    });
  };

  return (
    <div className="flex flex-col rounded-xl border border-[var(--foreground)]/15 divide-y divide-[var(--foreground)]/10 overflow-hidden">
      {applicableSections.map((s) => {
        const fields = VISIBILITY_FIELDS[s.id];
        const isOpen = openSectionId === s.id;
        const hiddenCount = fields.filter((f) => !isFieldVisible(s.id, f.key)).length;

        return (
          <div key={s.id}>
            <button
              type="button"
              onClick={() => setOpenSectionId(isOpen ? null : s.id)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-[var(--foreground)]/[0.03] transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                <i className={`ti ${s.icon} text-[var(--foreground)]/45`} style={{ fontSize: 14 }} />
                {s.label}
                {hiddenCount > 0 && (
                  <span className="font-mono text-[10px] font-normal text-[var(--foreground)]/40">
                    {hiddenCount} hidden
                  </span>
                )}
              </span>
              <i
                className={`ti ${isOpen ? "ti-chevron-up" : "ti-chevron-down"} text-[var(--foreground)]/45`}
                style={{ fontSize: 14 }}
              />
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 border-t border-[var(--foreground)]/10">
                {fields.map((f) => {
                  const visible = isFieldVisible(s.id, f.key);
                  return (
                    <label
                      key={f.key}
                      className="flex items-center gap-2 text-sm text-[var(--foreground)]/80 cursor-pointer select-none mt-3"
                    >
                      <input
                        type="checkbox"
                        checked={visible}
                        onChange={() => toggleField(s.id, f.key)}
                        className="h-4 w-4 rounded accent-[var(--foreground)] border-[var(--foreground)]/30"
                      />
                      {f.label}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Summary Manifest ─────────────────────────────────────────────────────────
function CVSummary({
  mode,
  tone,
  sectionCount,
  source,
  isDetailed,
}: {
  mode?: string;
  tone: ToneMode;
  sectionCount: number;
  source: CVSource;
  isDetailed: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const rows: Array<{ label: string; value: string }> = [
    { label: "Complexity", value: mode || "—" },
    { label: "Tone", value: tone },
    { label: "Sections", value: `${sectionCount} included` },
    { label: "Source", value: source === "portfolio" ? "Portfolio" : "Default profile" },
  ];

  return (
    <div className="mb-6 rounded-xl border border-[var(--foreground)]/15 overflow-hidden">
      <div className="divide-y divide-[var(--foreground)]/8">
        {
          isOpen ? <>
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="text-[var(--foreground)]/55">{row.label}</span>
                <span className="font-mono text-[var(--foreground)] capitalize">{row.value}</span>
              </div>
            ))}
            {isDetailed && (
              <div className="px-4 py-2 text-xs text-[var(--foreground)]/55">
                All projects will be included — nothing trimmed for length.
              </div>
            )}
          </> : <div className="px-4 flex justify-between items-center py-2.5 border-b border-[var(--foreground)]/10">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--foreground)]/45">
              Build Manifest
            </span>
            <span>
              <Button
                icon={isOpen ? <ChevronUp /> : <ChevronDown />}
                onClick={() => setIsOpen(!isOpen)}
                variant="ghost"
                size="sm"
              />
            </span>
          </div>
        }
      </div>
    </div>
  );
}