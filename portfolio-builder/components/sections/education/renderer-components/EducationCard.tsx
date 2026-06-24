// portfolio-builder/components/sections/education/renderer-components/EducationCard.tsx

import { useMemo } from "react";
import type { EducationItem } from "./layoutProps";
import type { CardConfig } from "./resolveCardOverride";
import { GraduationCap, BookOpen, Calendar, School, Award, MapPin } from "lucide-react";

interface EducationCardProps {
  education: EducationItem;
  config: CardConfig;
  cardSize: "small" | "medium" | "large";
  fullWidth?: boolean;
}

const SIZE_PADDING = { small: "p-3", medium: "p-4", large: "p-5" } as const;
const LOGO_SIZE = { small: "w-8 h-8", medium: "w-10 h-10", large: "w-12 h-12" } as const;
const INSTITUTION_SIZE = { small: "text-sm", medium: "text-base", large: "text-lg" } as const;
const DEGREE_SIZE = { small: "text-xs", medium: "text-sm", large: "text-base" } as const;

function formatDate(dateStr: string | null | undefined, format: CardConfig["dateDisplayFormat"]): string {
  if (!dateStr) return "Present";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  switch (format) {
    case "year-only":
      return d.getFullYear().toString();
    case "full-date":
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    case "relative": {
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffYears = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
      if (diffYears >= 1) return `${diffYears}y ago`;
      const diffMonths = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
      if (diffMonths >= 1) return `${diffMonths}mo ago`;
      return "Recently";
    }
    case "month-year":
    default:
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  }
}

function formatDuration(start?: string | null, end?: string | null, isCurrent?: boolean): string {
  if (!start) return "";
  const startDate = new Date(start);
  const endDate = isCurrent ? new Date() : end ? new Date(end) : new Date();

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "";

  const diffMs = endDate.getTime() - startDate.getTime();
  const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365));
  const months = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}yr${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months}mo${months > 1 ? "s" : ""}`);

  return parts.join(" ") || "< 1mo";
}

export default function EducationCard({
  education,
  config,
  cardSize,
  fullWidth = true,
}: EducationCardProps) {
  const {
    style,
    showInstitutionLogo,
    showInstitution,
    showDegree,
    showFieldOfStudy,
    showDates,
    showDuration,
    showDescription,
    showCurrentIndicator,
    dateDisplayFormat,
    accentColor,
  } = config;

  const pad = SIZE_PADDING[cardSize];
  const logo = LOGO_SIZE[cardSize];
  const institutionText = INSTITUTION_SIZE[cardSize];
  const degreeText = DEGREE_SIZE[cardSize];
  const widthClass = fullWidth ? "w-full" : "";

  const accentStyle = accentColor
    ? ({ "--card-accent": accentColor } as React.CSSProperties)
    : undefined;

  const dateRange = useMemo(() => {
    const start = formatDate(education.start_year, dateDisplayFormat);
    const end = education.is_current ? "Present" : formatDate(education.end_year, dateDisplayFormat);
    return `${start} — ${end}`;
  }, [education.start_year, education.end_year, education.is_current, dateDisplayFormat]);

  const duration = useMemo(
    () => formatDuration(education.start_year, education.end_year, education.is_current),
    [education.start_year, education.end_year, education.is_current],
  );

  // ── Minimal ────────────────────────────────────────────────────────────────
  if (style === "minimal") {
    return (
      <div
        className={`${widthClass} ${pad} rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] flex items-center gap-3 transition-all hover:border-[var(--pb-foreground-20)]`}
        style={accentStyle}
      >
        {showInstitutionLogo && education.institution_logo_url && (
          <img
            src={education.institution_logo_url}
            alt={education.institution}
            className={`${logo} rounded-md object-contain shrink-0 bg-[var(--pb-background)]`}
          />
        )}
        <div className="flex-1 min-w-0">
          {showInstitution && (
            <p className={`${institutionText} font-medium text-[var(--pb-text-primary)] truncate`}>
              {education.institution}
            </p>
          )}
          {showDegree && (
            <p className="text-xs text-[var(--pb-text-muted)] truncate">{education.degree}</p>
          )}
          {showDuration && duration && (
            <p className="text-[10px] text-[var(--pb-text-muted-60)] mt-0.5">{duration}</p>
          )}
        </div>
      </div>
    );
  }

  // ── Compact ────────────────────────────────────────────────────────────────
  if (style === "compact") {
    return (
      <div
        className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] flex items-start gap-3 transition-all hover:border-[var(--pb-foreground-20)]`}
        style={accentStyle}
      >
        {showInstitutionLogo && education.institution_logo_url && (
          <img
            src={education.institution_logo_url}
            alt={education.institution}
            className={`${logo} rounded-lg object-contain shrink-0 bg-[var(--pb-background)]`}
          />
        )}
        <div className="flex-1 min-w-0 space-y-1">
          {showInstitution && (
            <p className={`${institutionText} font-semibold text-[var(--pb-text-primary)]`}>
              {education.institution}
            </p>
          )}
          {showDegree && (
            <p className={`${degreeText} text-[var(--pb-text-secondary)]`}>{education.degree}</p>
          )}
          {showFieldOfStudy && education.field_of_study && (
            <p className="text-xs text-[var(--pb-text-muted)]">{education.field_of_study}</p>
          )}
          {showDuration && duration && (
            <p className="text-[10px] text-[var(--pb-text-muted-60)]">{duration}</p>
          )}
        </div>
      </div>
    );
  }

  // ── Transcript ───────────────────────────────────────────────────────────
  if (style === "transcript") {
    return (
      <div
        className={`${widthClass} ${pad} rounded-xl border-l-4 border-[var(--pb-foreground-30)] bg-[var(--pb-surface)] space-y-3 transition-all hover:border-l-[var(--pb-foreground)]`}
        style={accentColor ? { borderLeftColor: accentColor } : accentStyle}
      >
        <div className="flex items-start gap-3">
          {showInstitutionLogo && education.institution_logo_url && (
            <img
              src={education.institution_logo_url}
              alt={education.institution}
              className={`${logo} rounded-xl object-contain shrink-0 bg-[var(--pb-background)]`}
            />
          )}
          <div className="flex-1 min-w-0">
            {showInstitution && (
              <p className={`${institutionText} font-semibold text-[var(--pb-text-primary)]`}>
                {education.institution}
              </p>
            )}
            {showDegree && (
              <p className={`${degreeText} text-[var(--pb-text-secondary)] flex items-center gap-1`}>
                <GraduationCap size={12} />
                {education.degree}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-[var(--pb-text-muted)] whitespace-nowrap">{dateRange}</p>
            {showDuration && duration && (
              <p className="text-[10px] text-[var(--pb-text-muted-60)]">{duration}</p>
            )}
          </div>
        </div>

        {showFieldOfStudy && education.field_of_study && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--pb-text-secondary)]">
            <BookOpen size={11} />
            <span>{education.field_of_study}</span>
          </div>
        )}

        {showDescription && education.description && (
          <p className="text-sm text-[var(--pb-text-secondary)] leading-relaxed line-clamp-3">
            {education.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {showCurrentIndicator && education.is_current && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--pb-success-20)] text-[var(--pb-success)] border border-[var(--pb-success-30)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--pb-success)] animate-pulse" />
              Currently Studying
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Detailed ─────────────────────────────────────────────────────────────
  if (style === "detailed") {
    return (
      <div
        className={`${widthClass} ${pad} rounded-2xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-4 transition-all hover:border-[var(--pb-foreground-20)] hover:shadow-sm`}
        style={accentStyle}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {showInstitutionLogo && education.institution_logo_url && (
              <img
                src={education.institution_logo_url}
                alt={education.institution}
                className={`${logo} rounded-xl object-contain shrink-0 bg-[var(--pb-background)]`}
              />
            )}
            <div>
              {showInstitution && (
                <p className={`${institutionText} font-bold text-[var(--pb-text-primary)]`}>
                  {education.institution}
                </p>
              )}
              {showDegree && (
                <p className={`${degreeText} text-[var(--pb-text-secondary)] flex items-center gap-1 mt-0.5`}>
                  <GraduationCap size={13} />
                  {education.degree}
                </p>
              )}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="inline-flex items-center gap-1 text-xs text-[var(--pb-text-muted)] bg-[var(--pb-surface-elevated)] px-2 py-1 rounded-lg border border-[var(--pb-border)]">
              <Calendar size={11} />
              {dateRange}
            </div>
            {showDuration && duration && (
              <p className="text-[10px] text-[var(--pb-text-muted-60)] mt-1 text-right">{duration}</p>
            )}
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2">
          {showFieldOfStudy && education.field_of_study && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-secondary)]">
              <BookOpen size={11} />
              {education.field_of_study}
            </span>
          )}
          {showCurrentIndicator && education.is_current && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--pb-success-20)] text-[var(--pb-success)] border border-[var(--pb-success-30)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--pb-success)] animate-pulse" />
              Currently Studying
            </span>
          )}
        </div>

        {/* Description */}
        {showDescription && education.description && (
          <div className="relative">
            <p className="text-sm text-[var(--pb-text-secondary)] leading-relaxed">
              {education.description}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── Diploma ──────────────────────────────────────────────────────────────
  if (style === "diploma") {
    return (
      <div
        className={`${widthClass} ${pad} rounded-2xl border-2 border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-3 transition-all hover:border-[var(--pb-foreground-30)] hover:shadow-md relative overflow-hidden`}
        style={accentStyle}
      >
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--pb-foreground-5)] rotate-45 translate-x-8 -translate-y-8" />
        </div>

        <div className="flex items-start gap-3 relative z-10">
          {showInstitutionLogo && education.institution_logo_url && (
            <img
              src={education.institution_logo_url}
              alt={education.institution}
              className={`${logo} rounded-xl object-contain shrink-0 bg-[var(--pb-background)]`}
            />
          )}
          <div className="flex-1 min-w-0">
            {showInstitution && (
              <p className={`${institutionText} font-bold text-[var(--pb-text-primary)]`}>
                {education.institution}
              </p>
            )}
            {showDegree && (
              <p className={`${degreeText} text-[var(--pb-text-secondary)]`}>
                {education.degree}
              </p>
            )}
            {showFieldOfStudy && education.field_of_study && (
              <p className="text-xs text-[var(--pb-text-muted)] mt-0.5">{education.field_of_study}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            {showDates && (
              <p className="text-xs text-[var(--pb-text-muted)] whitespace-nowrap">{dateRange}</p>
            )}
            {showDuration && duration && (
              <p className="text-[10px] text-[var(--pb-text-muted-60)]">{duration}</p>
            )}
          </div>
        </div>

        {showCurrentIndicator && education.is_current && (
          <div className="flex items-center gap-1.5 relative z-10">
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--pb-success-20)] text-[var(--pb-success)] border border-[var(--pb-success-30)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--pb-success)] animate-pulse" />
              Currently Studying
            </span>
          </div>
        )}

        {showDescription && education.description && (
          <p className="text-sm text-[var(--pb-text-secondary)] leading-relaxed relative z-10 line-clamp-2">
            {education.description}
          </p>
        )}
      </div>
    );
  }

  // ── Academic (default) ───────────────────────────────────────────────────
  return (
    <div
      className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-2.5 transition-all hover:border-[var(--pb-foreground-20)]`}
      style={accentStyle}
    >
      <div className="flex items-start gap-3">
        {showInstitutionLogo && education.institution_logo_url && (
          <img
            src={education.institution_logo_url}
            alt={education.institution}
            className={`${logo} rounded-lg object-contain shrink-0 bg-[var(--pb-background)]`}
          />
        )}
        <div className="flex-1 min-w-0">
          {showInstitution && (
            <p className={`${institutionText} font-semibold text-[var(--pb-text-primary)] truncate`}>
              {education.institution}
            </p>
          )}
          {showDegree && (
            <p className={`${degreeText} text-[var(--pb-text-secondary)]`}>{education.degree}</p>
          )}
          {showFieldOfStudy && education.field_of_study && (
            <p className="text-xs text-[var(--pb-text-muted)]">{education.field_of_study}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          {showDates && (
            <p className="text-xs text-[var(--pb-text-muted)] whitespace-nowrap">{dateRange}</p>
          )}
          {showDuration && duration && (
            <p className="text-[10px] text-[var(--pb-text-muted-60)]">{duration}</p>
          )}
        </div>
      </div>

      {showDescription && education.description && (
        <p className="text-sm text-[var(--pb-text-secondary)] line-clamp-2">{education.description}</p>
      )}

      <div className="flex items-center justify-between pt-1 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {showFieldOfStudy && education.field_of_study && (
            <span className="text-xs text-[var(--pb-text-muted)] inline-flex items-center gap-1">
              <BookOpen size={11} />
              {education.field_of_study}
            </span>
          )}
        </div>
        {showCurrentIndicator && education.is_current && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--pb-success-20)] text-[var(--pb-success)] border border-[var(--pb-success-30)]">
            <span className="w-1 h-1 rounded-full bg-[var(--pb-success)] animate-pulse" />
            Current
          </span>
        )}
      </div>
    </div>
  );
}
