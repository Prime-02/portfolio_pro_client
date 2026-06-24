// portfolio-builder/components/sections/experience/renderer-components/ExperienceCard.tsx

import { useMemo } from "react";
import type { ExperienceItem } from "./layoutProps";
import type { CardConfig } from "./resolveCardOverride";
import { Briefcase, MapPin, Calendar, Building2, Star } from "lucide-react";

interface ExperienceCardProps {
  experience: ExperienceItem;
  config: CardConfig;
  cardSize: "small" | "medium" | "large";
  fullWidth?: boolean;
}

const SIZE_PADDING = { small: "p-3", medium: "p-4", large: "p-5" } as const;
const LOGO_SIZE = { small: "w-8 h-8", medium: "w-10 h-10", large: "w-12 h-12" } as const;
const NAME_SIZE = { small: "text-sm", medium: "text-base", large: "text-lg" } as const;
const COMPANY_SIZE = { small: "text-xs", medium: "text-sm", large: "text-base" } as const;

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

export default function ExperienceCard({
  experience,
  config,
  cardSize,
  fullWidth = true,
}: ExperienceCardProps) {
  const {
    style,
    showCompanyLogo,
    showDescription,
    showEmploymentType,
    showLocationType,
    showDuration,
    showSkills,
    showCompanyName,
    showJobTitle,
    dateDisplayFormat,
    accentColor,
  } = config;

  const pad = SIZE_PADDING[cardSize];
  const logo = LOGO_SIZE[cardSize];
  const nameText = NAME_SIZE[cardSize];
  const companyText = COMPANY_SIZE[cardSize];
  const widthClass = fullWidth ? "w-full" : "";

  const accentStyle = accentColor
    ? ({ "--card-accent": accentColor } as React.CSSProperties)
    : undefined;

  const dateRange = useMemo(() => {
    const start = formatDate(experience.start_date, dateDisplayFormat);
    const end = experience.is_current ? "Present" : formatDate(experience.end_date, dateDisplayFormat);
    return `${start} — ${end}`;
  }, [experience.start_date, experience.end_date, experience.is_current, dateDisplayFormat]);

  const duration = useMemo(
    () => formatDuration(experience.start_date, experience.end_date, experience.is_current),
    [experience.start_date, experience.end_date, experience.is_current],
  );

  // ── Minimal ────────────────────────────────────────────────────────────────
  if (style === "minimal") {
    return (
      <div
        className={`${widthClass} ${pad} rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] flex items-center gap-3 transition-all hover:border-[var(--pb-foreground-20)]`}
        style={accentStyle}
      >
        {showCompanyLogo && experience.company_logo_url && (
          <img
            src={experience.company_logo_url}
            alt={experience.company_name}
            className={`${logo} rounded-md object-contain shrink-0 bg-[var(--pb-background)]`}
          />
        )}
        <div className="flex-1 min-w-0">
          {showJobTitle && (
            <p className={`${nameText} font-medium text-[var(--pb-text-primary)] truncate`}>
              {experience.job_title}
            </p>
          )}
          {showCompanyName && (
            <p className="text-xs text-[var(--pb-text-muted)] truncate">{experience.company_name}</p>
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
        {showCompanyLogo && experience.company_logo_url && (
          <img
            src={experience.company_logo_url}
            alt={experience.company_name}
            className={`${logo} rounded-lg object-contain shrink-0 bg-[var(--pb-background)]`}
          />
        )}
        <div className="flex-1 min-w-0 space-y-1">
          {showJobTitle && (
            <p className={`${nameText} font-semibold text-[var(--pb-text-primary)]`}>
              {experience.job_title}
            </p>
          )}
          {showCompanyName && (
            <p className={`${companyText} text-[var(--pb-text-secondary)]`}>{experience.company_name}</p>
          )}
          {showDuration && duration && (
            <p className="text-[10px] text-[var(--pb-text-muted-60)]">{duration}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--pb-text-muted)]">
            {showEmploymentType && experience.employment_type && (
              <span className="inline-flex items-center gap-1">
                <Briefcase size={12} />
                {experience.employment_type}
              </span>
            )}
            {showLocationType && experience.location_type && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} />
                {experience.location_type}
              </span>
            )}
          </div>
        </div>
        {experience.is_featured && (
          <Star size={14} className="text-[var(--pb-accent)] shrink-0" fill="currentColor" />
        )}
      </div>
    );
  }

  // ── Timeline ───────────────────────────────────────────────────────────────
  if (style === "timeline") {
    return (
      <div
        className={`${widthClass} ${pad} rounded-xl border-l-4 border-[var(--pb-foreground-30)] bg-[var(--pb-surface)] space-y-3 transition-all hover:border-l-[var(--pb-foreground)]`}
        style={accentColor ? { borderLeftColor: accentColor } : accentStyle}
      >
        <div className="flex items-start gap-3">
          {showCompanyLogo && experience.company_logo_url && (
            <img
              src={experience.company_logo_url}
              alt={experience.company_name}
              className={`${logo} rounded-xl object-contain shrink-0 bg-[var(--pb-background)]`}
            />
          )}
          <div className="flex-1 min-w-0">
            {showJobTitle && (
              <p className={`${nameText} font-semibold text-[var(--pb-text-primary)]`}>
                {experience.job_title}
              </p>
            )}
            {showCompanyName && (
              <p className={`${companyText} text-[var(--pb-text-secondary)] flex items-center gap-1`}>
                <Building2 size={12} />
                {experience.company_name}
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

        {showDescription && experience.description && (
          <p className="text-sm text-[var(--pb-text-secondary)] leading-relaxed line-clamp-3">
            {experience.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {showEmploymentType && experience.employment_type && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-secondary)]">
              <Briefcase size={10} />
              {experience.employment_type}
            </span>
          )}
          {showLocationType && experience.location_type && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-secondary)]">
              <MapPin size={10} />
              {experience.location_type}
            </span>
          )}
          {experience.is_current && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--pb-success-20)] text-[var(--pb-success)] border border-[var(--pb-success-30)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--pb-success)] animate-pulse" />
              Current
            </span>
          )}
          {experience.is_featured && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--pb-accent-20)] text-[var(--pb-accent)] border border-[var(--pb-accent-30)]">
              <Star size={10} fill="currentColor" />
              Featured
            </span>
          )}
        </div>

        {showSkills && experience.skills && experience.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {experience.skills.map((skill, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--pb-foreground-10)] text-[var(--pb-text-muted)] border border-[var(--pb-border)]"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
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
            {showCompanyLogo && experience.company_logo_url && (
              <img
                src={experience.company_logo_url}
                alt={experience.company_name}
                className={`${logo} rounded-xl object-contain shrink-0 bg-[var(--pb-background)]`}
              />
            )}
            <div>
              {showJobTitle && (
                <p className={`${nameText} font-bold text-[var(--pb-text-primary)]`}>
                  {experience.job_title}
                </p>
              )}
              {showCompanyName && (
                <p className={`${companyText} text-[var(--pb-text-secondary)] flex items-center gap-1 mt-0.5`}>
                  <Building2 size={13} />
                  {experience.company_name}
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
          {showEmploymentType && experience.employment_type && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-secondary)]">
              <Briefcase size={11} />
              {experience.employment_type}
            </span>
          )}
          {showLocationType && experience.location_type && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-secondary)]">
              <MapPin size={11} />
              {experience.location_type}
            </span>
          )}
          {experience.location && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-secondary)]">
              <MapPin size={11} />
              {experience.location}
            </span>
          )}
          {experience.is_current && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--pb-success-20)] text-[var(--pb-success)] border border-[var(--pb-success-30)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--pb-success)] animate-pulse" />
              Current
            </span>
          )}
          {experience.is_featured && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--pb-accent-20)] text-[var(--pb-accent)] border border-[var(--pb-accent-30)]">
              <Star size={11} fill="currentColor" />
              Featured
            </span>
          )}
        </div>

        {/* Description */}
        {showDescription && experience.description && (
          <div className="relative">
            <p className="text-sm text-[var(--pb-text-secondary)] leading-relaxed">
              {experience.description}
            </p>
          </div>
        )}

        {/* Skills */}
        {showSkills && experience.skills && experience.skills.length > 0 && (
          <div className="pt-1 border-t border-[var(--pb-border)]">
            <p className="text-[10px] uppercase tracking-wider text-[var(--pb-text-muted)] mb-2 font-medium">
              Skills & Technologies
            </p>
            <div className="flex flex-wrap gap-1.5">
              {experience.skills.map((skill, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-lg bg-[var(--pb-foreground-10)] text-[var(--pb-text-secondary)] border border-[var(--pb-border)] hover:bg-[var(--pb-foreground-15)] transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Standard (default) ─────────────────────────────────────────────────────
  return (
    <div
      className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-2.5 transition-all hover:border-[var(--pb-foreground-20)]`}
      style={accentStyle}
    >
      <div className="flex items-start gap-3">
        {showCompanyLogo && experience.company_logo_url && (
          <img
            src={experience.company_logo_url}
            alt={experience.company_name}
            className={`${logo} rounded-lg object-contain shrink-0 bg-[var(--pb-background)]`}
          />
        )}
        <div className="flex-1 min-w-0">
          {showJobTitle && (
            <p className={`${nameText} font-semibold text-[var(--pb-text-primary)] truncate`}>
              {experience.job_title}
            </p>
          )}
          {showCompanyName && (
            <p className={`${companyText} text-[var(--pb-text-secondary)]`}>{experience.company_name}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-[var(--pb-text-muted)] whitespace-nowrap">{dateRange}</p>
          {showDuration && duration && (
            <p className="text-[10px] text-[var(--pb-text-muted-60)]">{duration}</p>
          )}
        </div>
      </div>

      {showDescription && experience.description && (
        <p className="text-sm text-[var(--pb-text-secondary)] line-clamp-2">{experience.description}</p>
      )}

      <div className="flex items-center justify-between pt-1 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {showEmploymentType && experience.employment_type && (
            <span className="text-xs text-[var(--pb-text-muted)] inline-flex items-center gap-1">
              <Briefcase size={11} />
              {experience.employment_type}
            </span>
          )}
          {showLocationType && experience.location_type && (
            <span className="text-xs text-[var(--pb-text-muted)] inline-flex items-center gap-1">
              <MapPin size={11} />
              {experience.location_type}
            </span>
          )}
        </div>
        {experience.is_current && (
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--pb-success-20)] text-[var(--pb-success)] border border-[var(--pb-success-30)]">
            <span className="w-1 h-1 rounded-full bg-[var(--pb-success)] animate-pulse" />
            Current
          </span>
        )}
      </div>

      {showSkills && experience.skills && experience.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {experience.skills.slice(0, 4).map((skill, i) => (
            <span
              key={i}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--pb-foreground-10)] text-[var(--pb-text-muted)]"
            >
              {skill}
            </span>
          ))}
          {experience.skills.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--pb-surface-elevated)] text-[var(--pb-text-muted)]">
              +{experience.skills.length - 4}
            </span>
          )}
        </div>
      )}
    </div>
  );
}