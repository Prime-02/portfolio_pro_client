// portfolio-builder/components/sections/certification/renderer-components/CertificationCard.tsx

import { useMemo } from "react";
import type { CertificationItem } from "./layoutProps";
import type { CardConfig } from "./resolveCardOverride";
import { Award, Shield, ExternalLink, Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface CertificationCardProps {
  certification: CertificationItem;
  config: CardConfig;
  cardSize: "small" | "medium" | "large";
  fullWidth?: boolean;
}

const SIZE_PADDING = { small: "p-3", medium: "p-4", large: "p-5" } as const;
const BADGE_SIZE = { small: "w-10 h-10", medium: "w-12 h-12", large: "w-14 h-14" } as const;
const NAME_SIZE = { small: "text-sm", medium: "text-base", large: "text-lg" } as const;
const ORG_SIZE = { small: "text-xs", medium: "text-sm", large: "text-base" } as const;

function formatDate(dateStr: string | null | undefined, format: CardConfig["dateDisplayFormat"]): string {
  if (!dateStr) return "N/A";
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

function isExpired(expirationDate?: string | null): boolean {
  if (!expirationDate) return false;
  const d = new Date(expirationDate);
  if (isNaN(d.getTime())) return false;
  return d.getTime() < Date.now();
}

function daysUntilExpiry(expirationDate?: string | null): number | null {
  if (!expirationDate) return null;
  const d = new Date(expirationDate);
  if (isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  if (diff < 0) return null;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function CertificationCard({
  certification,
  config,
  cardSize,
  fullWidth = true,
}: CertificationCardProps) {
  const {
    style,
    showCertificationName,
    showIssuingOrganization,
    showIssueDate,
    showExpirationDate,
    showCertificateLink,
    showVerificationBadge,
    showValidityIndicator,
    showDescription,
    dateDisplayFormat,
    accentColor,
  } = config;

  const pad = SIZE_PADDING[cardSize];
  const badge = BADGE_SIZE[cardSize];
  const nameText = NAME_SIZE[cardSize];
  const orgText = ORG_SIZE[cardSize];
  const widthClass = fullWidth ? "w-full" : "";

  const expired = isExpired(certification.expiration_date);
  const daysLeft = daysUntilExpiry(certification.expiration_date);

  const accentStyle = accentColor
    ? ({ "--card-accent": accentColor } as React.CSSProperties)
    : undefined;

  const issueDateFormatted = useMemo(
    () => formatDate(certification.issue_date, dateDisplayFormat),
    [certification.issue_date, dateDisplayFormat],
  );

  const expiryDateFormatted = useMemo(
    () => formatDate(certification.expiration_date, dateDisplayFormat),
    [certification.expiration_date, dateDisplayFormat],
  );

  // ── Minimal ──────────────────────────────────────────────────────────────
  if (style === "minimal") {
    return (
      <div
        className={`${widthClass} ${pad} rounded-lg border border-[var(--pb-border)] bg-[var(--pb-surface)] flex items-center gap-3 transition-all hover:border-[var(--pb-foreground-20)]`}
        style={accentStyle}
      >
        <div className={`${badge} rounded-lg bg-[var(--pb-foreground-10)] flex items-center justify-center shrink-0`}>
          <Award className="w-5 h-5 text-[var(--pb-foreground)]" />
        </div>
        <div className="flex-1 min-w-0">
          {showCertificationName && (
            <p className={`${nameText} font-medium text-[var(--pb-text-primary)] truncate`}>
              {certification.certification_name}
            </p>
          )}
          {showIssuingOrganization && (
            <p className="text-xs text-[var(--pb-text-muted)] truncate">{certification.issuing_organization}</p>
          )}
        </div>
        {showValidityIndicator && expired && (
          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-[var(--pb-error-20)] text-[var(--pb-error)] border border-[var(--pb-error-30)]">
            Expired
          </span>
        )}
      </div>
    );
  }

  // ── Compact ──────────────────────────────────────────────────────────────
  if (style === "compact") {
    return (
      <div
        className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] flex items-start gap-3 transition-all hover:border-[var(--pb-foreground-20)]`}
        style={accentStyle}
      >
        <div className={`${badge} rounded-xl bg-[var(--pb-foreground-10)] flex items-center justify-center shrink-0`}>
          <Award className="w-5 h-5 text-[var(--pb-foreground)]" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          {showCertificationName && (
            <p className={`${nameText} font-semibold text-[var(--pb-text-primary)]`}>
              {certification.certification_name}
            </p>
          )}
          {showIssuingOrganization && (
            <p className={`${orgText} text-[var(--pb-text-secondary)]`}>{certification.issuing_organization}</p>
          )}
          {showIssueDate && (
            <p className="text-[10px] text-[var(--pb-text-muted-60)] flex items-center gap-1">
              <Calendar size={10} />
              {issueDateFormatted}
            </p>
          )}
        </div>
        {showValidityIndicator && (
          <div className="shrink-0">
            {expired ? (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--pb-error-20)] text-[var(--pb-error)] border border-[var(--pb-error-30)]">
                <AlertTriangle size={10} />
                Expired
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--pb-success-20)] text-[var(--pb-success)] border border-[var(--pb-success-30)]">
                <CheckCircle size={10} />
                Valid
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Verification ─────────────────────────────────────────────────────────
  if (style === "verification") {
    return (
      <div
        className={`${widthClass} ${pad} rounded-xl border-l-4 border-[var(--pb-foreground-30)] bg-[var(--pb-surface)] space-y-3 transition-all hover:border-l-[var(--pb-foreground)]`}
        style={accentColor ? { borderLeftColor: accentColor } : accentStyle}
      >
        <div className="flex items-start gap-3">
          <div className={`${badge} rounded-xl bg-[var(--pb-foreground-10)] flex items-center justify-center shrink-0`}>
            <Shield className="w-5 h-5 text-[var(--pb-foreground)]" />
          </div>
          <div className="flex-1 min-w-0">
            {showCertificationName && (
              <p className={`${nameText} font-semibold text-[var(--pb-text-primary)]`}>
                {certification.certification_name}
              </p>
            )}
            {showIssuingOrganization && (
              <p className={`${orgText} text-[var(--pb-text-secondary)] flex items-center gap-1`}>
                <Award size={12} />
                {certification.issuing_organization}
              </p>
            )}
          </div>
          <div className="text-right shrink-0 space-y-1">
            {showIssueDate && (
              <p className="text-xs text-[var(--pb-text-muted)] whitespace-nowrap flex items-center gap-1 justify-end">
                <Calendar size={10} />
                {issueDateFormatted}
              </p>
            )}
            {showExpirationDate && certification.expiration_date && (
              <p className="text-[10px] text-[var(--pb-text-muted-60)] whitespace-nowrap flex items-center gap-1 justify-end">
                <Clock size={10} />
                {expired ? `Expired ${expiryDateFormatted}` : `Until ${expiryDateFormatted}`}
              </p>
            )}
          </div>
        </div>

        {showValidityIndicator && (
          <div className="flex items-center gap-2 pt-1">
            {expired ? (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--pb-error-20)] text-[var(--pb-error)] border border-[var(--pb-error-30)]">
                <AlertTriangle size={11} />
                Expired
              </span>
            ) : daysLeft !== null && daysLeft <= 30 ? (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--pb-warning-20)] text-[var(--pb-warning)] border border-[var(--pb-warning-30)]">
                <Clock size={11} />
                Expires in {daysLeft}d
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--pb-success-20)] text-[var(--pb-success)] border border-[var(--pb-success-30)]">
                <CheckCircle size={11} />
                {certification.expiration_date ? `Valid until ${expiryDateFormatted}` : "No expiration"}
              </span>
            )}
          </div>
        )}

        {showCertificateLink && (certification.certificate_external_url || certification.certificate_internal_url) && (
          <a
            href={certification.certificate_external_url || certification.certificate_internal_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--pb-info)] hover:text-[var(--pb-info-hover)] transition-colors"
          >
            <ExternalLink size={11} />
            View Certificate
          </a>
        )}
      </div>
    );
  }

  // ── Detailed ───────────────────────────────────────────────────────────
  if (style === "detailed") {
    return (
      <div
        className={`${widthClass} ${pad} rounded-2xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-4 transition-all hover:border-[var(--pb-foreground-20)] hover:shadow-sm`}
        style={accentStyle}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`${badge} rounded-xl bg-[var(--pb-foreground-10)] flex items-center justify-center shrink-0`}>
              <Award className="w-5 h-5 text-[var(--pb-foreground)]" />
            </div>
            <div>
              {showCertificationName && (
                <p className={`${nameText} font-bold text-[var(--pb-text-primary)]`}>
                  {certification.certification_name}
                </p>
              )}
              {showIssuingOrganization && (
                <p className={`${orgText} text-[var(--pb-text-secondary)] flex items-center gap-1 mt-0.5`}>
                  <Shield size={13} />
                  {certification.issuing_organization}
                </p>
              )}
            </div>
          </div>
          <div className="text-right shrink-0 space-y-1">
            {showValidityIndicator && (
              <div>
                {expired ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--pb-error-20)] text-[var(--pb-error)] border border-[var(--pb-error-30)]">
                    <AlertTriangle size={10} />
                    Expired
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--pb-success-20)] text-[var(--pb-success)] border border-[var(--pb-success-30)]">
                    <CheckCircle size={10} />
                    Valid
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2">
          {showIssueDate && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-secondary)]">
              <Calendar size={11} />
              Issued {issueDateFormatted}
            </span>
          )}
          {showExpirationDate && certification.expiration_date && (
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border ${
              expired
                ? "bg-[var(--pb-error-20)] border-[var(--pb-error-30)] text-[var(--pb-error)]"
                : daysLeft !== null && daysLeft <= 30
                ? "bg-[var(--pb-warning-20)] border-[var(--pb-warning-30)] text-[var(--pb-warning)]"
                : "bg-[var(--pb-surface-elevated)] border-[var(--pb-border)] text-[var(--pb-text-secondary)]"
            }`}>
              <Clock size={11} />
              {expired ? `Expired ${expiryDateFormatted}` : `Until ${expiryDateFormatted}`}
            </span>
          )}
          {showVerificationBadge && (
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-[var(--pb-foreground-10)] border border-[var(--pb-border)] text-[var(--pb-text-secondary)]">
              <Shield size={11} />
              Verified
            </span>
          )}
        </div>

        {/* Certificate link */}
        {showCertificateLink && (certification.certificate_external_url || certification.certificate_internal_url) && (
          <a
            href={certification.certificate_external_url || certification.certificate_internal_url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--pb-info)] hover:text-[var(--pb-info-hover)] transition-colors"
          >
            <ExternalLink size={14} />
            View Certificate
          </a>
        )}
      </div>
    );
  }

  // ── Credential (default) ─────────────────────────────────────────────────
  return (
    <div
      className={`${widthClass} ${pad} rounded-xl border border-[var(--pb-border)] bg-[var(--pb-surface)] space-y-2.5 transition-all hover:border-[var(--pb-foreground-20)]`}
      style={accentStyle}
    >
      <div className="flex items-start gap-3">
        <div className={`${badge} rounded-lg bg-[var(--pb-foreground-10)] flex items-center justify-center shrink-0`}>
          <Award className="w-5 h-5 text-[var(--pb-foreground)]" />
        </div>
        <div className="flex-1 min-w-0">
          {showCertificationName && (
            <p className={`${nameText} font-semibold text-[var(--pb-text-primary)] truncate`}>
              {certification.certification_name}
            </p>
          )}
          {showIssuingOrganization && (
            <p className={`${orgText} text-[var(--pb-text-secondary)]`}>{certification.issuing_organization}</p>
          )}
        </div>
        <div className="text-right shrink-0 space-y-0.5">
          {showIssueDate && (
            <p className="text-xs text-[var(--pb-text-muted)] whitespace-nowrap">{issueDateFormatted}</p>
          )}
          {showExpirationDate && certification.expiration_date && (
            <p className="text-[10px] text-[var(--pb-text-muted-60)] whitespace-nowrap">
              {expired ? `Expired` : `Until ${expiryDateFormatted}`}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {showVerificationBadge && (
            <span className="text-xs text-[var(--pb-text-muted)] inline-flex items-center gap-1">
              <Shield size={11} />
              Verified
            </span>
          )}
        </div>
        {showValidityIndicator && (
          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
            expired
              ? "bg-[var(--pb-error-20)] text-[var(--pb-error)] border-[var(--pb-error-30)]"
              : daysLeft !== null && daysLeft <= 30
              ? "bg-[var(--pb-warning-20)] text-[var(--pb-warning)] border-[var(--pb-warning-30)]"
              : "bg-[var(--pb-success-20)] text-[var(--pb-success)] border-[var(--pb-success-30)]"
          }`}>
            <span className={`w-1 h-1 rounded-full ${expired ? "bg-[var(--pb-error)]" : daysLeft !== null && daysLeft <= 30 ? "bg-[var(--pb-warning)]" : "bg-[var(--pb-success)]"} ${!expired ? "animate-pulse" : ""}`} />
            {expired ? "Expired" : daysLeft !== null && daysLeft <= 30 ? `${daysLeft}d left` : "Valid"}
          </span>
        )}
      </div>

      {showCertificateLink && (certification.certificate_external_url || certification.certificate_internal_url) && (
        <a
          href={certification.certificate_external_url || certification.certificate_internal_url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[var(--pb-info)] hover:text-[var(--pb-info-hover)] transition-colors"
        >
          <ExternalLink size={10} />
          View Certificate
        </a>
      )}
    </div>
  );
}
