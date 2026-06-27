"use client";

import { useId, useMemo, useState } from "react";
import { CertificationData, CertificationCardStyle, CertificationCardOverride } from "@/portfolio-builder/types/certification";
import SelectField from "../../bio/editor-components/SelectField";
import Toggle from "../../bio/editor-components/Toggle";
import ColorPicker from "../../bio/editor-components/ColorPicker";
import { sectionClass, sectionTitleClass } from "../../bio/editor-components/styles";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { useCertifications } from "@/lib/stores/certifications/useCertifications";

interface CertCardLayoutTabProps {
  data: CertificationData;
  onChange: <K extends keyof CertificationData>(key: K, value: CertificationData[K]) => void;
}

const CARD_STYLE_OPTIONS = [
  { value: "badge", label: "Badge — Icon, name, organization, validity" },
  { value: "compact", label: "Compact — Icon, name, org, issue date" },
  { value: "credential", label: "Credential — Full info with validity badge" },
  { value: "detailed", label: "Detailed — Full info with verification" },
  { value: "verification", label: "Verification — Left accent bar, validity focus" },
  { value: "minimal", label: "Minimal — Name, org, compact row" },
];

const CARD_SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const DATE_FORMAT_OPTIONS = [
  { value: "relative", label: "Relative (e.g. 2y ago)" },
  { value: "month-year", label: "Month Year (e.g. Jan 2023)" },
  { value: "year-only", label: "Year Only (e.g. 2023)" },
  { value: "full-date", label: "Full Date (e.g. Jan 15, 2023)" },
];

const OVERRIDE_TARGET_OPTIONS = [
  { id: "ids", code: "Specific Certification IDs" },
  { id: "issuing_organizations", code: "Issuing Organizations" },
  { id: "certification_names", code: "Certification Names" },
  { id: "has_expiration", code: "Has Expiration" },
  { id: "is_expired", code: "Is Expired" },
];

export default function CertCardLayoutTab({ data, onChange }: CertCardLayoutTabProps) {
  const [expandedOverride, setExpandedOverride] = useState<number | null>(null);
  const { certifications } = useCertifications();

  // ── Dropdown option arrays derived from the certification store ─────────

  const certificationOptions = useMemo(
    () => certifications.map((cert) => ({ id: cert.id || useId(), code: `${cert.certification_name} — ${cert.issuing_organization}` })),
    [certifications]
  );

  const organizationOptions = useMemo(() => {
    const seen = new Set<string>();
    return certifications
      .map((c) => c.issuing_organization)
      .filter((o): o is string => !!o && !seen.has(o) && !!seen.add(o))
      .map((o) => ({ id: o, code: o }));
  }, [certifications]);

  const certNameOptions = useMemo(() => {
    const seen = new Set<string>();
    return certifications
      .map((c) => c.certification_name)
      .filter((n): n is string => !!n && !seen.has(n) && !!seen.add(n))
      .map((n) => ({ id: n, code: n }));
  }, [certifications]);

  // ─────────────────────────────────────────────────────────────────────────

  const updateOverride = (index: number, updates: Partial<CertificationCardOverride>) => {
    const updated = [...data.cardOverrides];
    updated[index] = { ...updated[index], ...updates };
    onChange("cardOverrides", updated);
  };

  const removeOverride = (index: number) => {
    onChange("cardOverrides", data.cardOverrides.filter((_, i) => i !== index));
  };

  const addOverride = () => {
    const newOverride: CertificationCardOverride = {
      target: {},
      style: "detailed",
    };
    onChange("cardOverrides", [...data.cardOverrides, newOverride]);
    setExpandedOverride(data.cardOverrides.length);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Default Card Style ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Default Card Style</h3>
        <SelectField
          label="Card Style"
          id="cardStyle"
          value={data.cardStyle}
          onChange={(v) => onChange("cardStyle", v as CertificationCardStyle)}
          options={CARD_STYLE_OPTIONS}
        />
        <SelectField
          label="Card Size"
          id="cardSize"
          value={data.cardSize}
          onChange={(v) => onChange("cardSize", v as "small" | "medium" | "large")}
          options={CARD_SIZE_OPTIONS}
        />
        <SelectField
          label="Date Display Format"
          id="dateDisplayFormat"
          value={data.dateDisplayFormat}
          onChange={(v) => onChange("dateDisplayFormat", v as CertificationData["dateDisplayFormat"])}
          options={DATE_FORMAT_OPTIONS}
        />
      </div>

      {/* ── Display Options ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Display Options</h3>
        <div className="space-y-3">
          <Toggle
            label="Show certification name"
            checked={data.showCertificationName}
            onChange={(v) => onChange("showCertificationName", v)}
          />
          <Toggle
            label="Show issuing organization"
            checked={data.showIssuingOrganization}
            onChange={(v) => onChange("showIssuingOrganization", v)}
          />
          <Toggle
            label="Show issue date"
            checked={data.showIssueDate}
            onChange={(v) => onChange("showIssueDate", v)}
          />
          <Toggle
            label="Show expiration date"
            checked={data.showExpirationDate}
            onChange={(v) => onChange("showExpirationDate", v)}
          />
          <Toggle
            label="Show certificate link"
            checked={data.showCertificateLink}
            onChange={(v) => onChange("showCertificateLink", v)}
          />
          <Toggle
            label="Show verification badge"
            checked={data.showVerificationBadge}
            onChange={(v) => onChange("showVerificationBadge", v)}
          />
          <Toggle
            label="Show validity indicator"
            checked={data.showValidityIndicator}
            onChange={(v) => onChange("showValidityIndicator", v)}
          />
          <Toggle
            label="Show description"
            checked={data.showDescription}
            onChange={(v) => onChange("showDescription", v)}
          />
        </div>
      </div>

      {/* ── Card Overrides ── */}
      <div className={sectionClass}>
        <div className="flex items-center justify-between">
          <h3 className={sectionTitleClass}>Style Overrides</h3>
          <button
            type="button"
            onClick={addOverride}
            className="text-xs px-2 py-1 rounded-md border border-[var(--pb-border)] hover:bg-[var(--pb-surface-hover)] transition-colors text-[var(--pb-text-primary)]"
          >
            + Add Override
          </button>
        </div>
        <p className="text-xs text-[var(--pb-text-muted)] mb-3">
          Style specific certification entries differently based on organization, name, or hand-picked IDs.
        </p>

        {data.cardOverrides.length === 0 && (
          <p className="text-xs text-[var(--pb-text-muted)]">No overrides configured.</p>
        )}

        {data.cardOverrides.map((override, index) => {
          const isExpanded = expandedOverride === index;
          const targetDesc =
            Object.entries(override.target)
              .filter(([, v]) => v !== undefined)
              .map(([k, v]) => {
                if (Array.isArray(v)) return `${k}: ${v.length} selected`;
                return `${k}: ${v}`;
              })
              .join(", ") || "No target set";

          return (
            <div
              key={index}
              className="border border-[var(--pb-border)] rounded-lg overflow-hidden bg-[var(--pb-surface)]"
            >
              <button
                type="button"
                onClick={() => setExpandedOverride(isExpanded ? null : index)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
              >
                <span className="text-xs text-[var(--pb-text-muted)]">Override {index + 1}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--pb-surface-elevated)] text-[var(--pb-text-muted)] border border-[var(--pb-border)] capitalize">
                  {override.style}
                </span>
                <span className="text-[10px] text-[var(--pb-text-muted)] truncate flex-1">
                  {targetDesc}
                </span>
                <span className="text-[var(--pb-text-muted)] text-xs">{isExpanded ? "▲" : "▼"}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOverride(index);
                  }}
                  className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] px-1"
                >
                  ✕
                </button>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-3 border-t border-[var(--pb-border)] pt-3">
                  {/* ── Target type toggle pills ── */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                      Target By
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {OVERRIDE_TARGET_OPTIONS.map((opt) => {
                        const isActive =
                          opt.id === "ids"
                            ? "ids" in override.target
                            : opt.id === "issuing_organizations"
                              ? "issuing_organizations" in override.target
                              : opt.id === "certification_names"
                                ? "certification_names" in override.target
                                : opt.id === "has_expiration"
                                  ? "has_expiration" in override.target
                                  : opt.id === "is_expired"
                                    ? "is_expired" in override.target
                                    : false;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              const next = { ...override.target } as Record<string, unknown>;
                              if (opt.id === "ids") {
                                if ("ids" in next) delete next.ids;
                                else next.ids = [];
                              } else if (opt.id === "issuing_organizations") {
                                if ("issuing_organizations" in next) delete next.issuing_organizations;
                                else next.issuing_organizations = [];
                              } else if (opt.id === "certification_names") {
                                if ("certification_names" in next) delete next.certification_names;
                                else next.certification_names = [];
                              } else if (opt.id === "has_expiration") {
                                if ("has_expiration" in next) delete next.has_expiration;
                                else next.has_expiration = true;
                              } else if (opt.id === "is_expired") {
                                if ("is_expired" in next) delete next.is_expired;
                                else next.is_expired = true;
                              }
                              updateOverride(index, { target: next as CertificationCardOverride["target"] });
                            }}
                            className={`text-xs px-2 py-1 rounded-md border transition-colors ${isActive
                              ? "border-[var(--pb-foreground)] bg-[var(--pb-foreground-10)] text-[var(--pb-text-primary)]"
                              : "border-[var(--pb-border)] text-[var(--pb-text-muted)] hover:border-[var(--pb-foreground-20)]"
                              }`}
                          >
                            {opt.code}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Certification IDs ── */}
                  {override.target.ids !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Certification IDs
                      </label>
                      <Dropdown
                        id={`override-ids-${index}`}
                        options={certificationOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search certifications..."
                        tag="certification"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.ids ?? []}
                        onSelect={(val) => {
                          const ids = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, {
                            target: { ...override.target, ids },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── Issuing Organizations ── */}
                  {override.target.issuing_organizations !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Issuing Organizations
                      </label>
                      <Dropdown
                        id={`override-orgs-${index}`}
                        options={organizationOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search organizations..."
                        tag="organization"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.issuing_organizations ?? []}
                        onSelect={(val) => {
                          const issuing_organizations = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, {
                            target: { ...override.target, issuing_organizations },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── Certification Names ── */}
                  {override.target.certification_names !== undefined && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                        Certification Names
                      </label>
                      <Dropdown
                        id={`override-names-${index}`}
                        options={certNameOptions}
                        multiple
                        selectAll
                        type="datalist"
                        placeholder="Search certification names..."
                        tag="certification_name"
                        valueKey="id"
                        displayKey="code"
                        includeNoneOption={false}
                        value={override.target.certification_names ?? []}
                        onSelect={(val) => {
                          const certification_names = Array.isArray(val) ? val : val ? [val] : [];
                          updateOverride(index, {
                            target: { ...override.target, certification_names },
                          });
                        }}
                      />
                    </div>
                  )}

                  {/* ── has_expiration toggle ── */}
                  {override.target.has_expiration !== undefined && (
                    <Toggle
                      label="Target certifications with expiration"
                      checked={override.target.has_expiration}
                      onChange={(v) =>
                        updateOverride(index, { target: { ...override.target, has_expiration: v } })
                      }
                    />
                  )}

                  {/* ── is_expired toggle ── */}
                  {override.target.is_expired !== undefined && (
                    <Toggle
                      label="Target expired certifications"
                      checked={override.target.is_expired}
                      onChange={(v) =>
                        updateOverride(index, { target: { ...override.target, is_expired: v } })
                      }
                    />
                  )}

                  {/* ── Override style ── */}
                  <SelectField
                    label="Override Style"
                    id={`override-style-${index}`}
                    value={override.style}
                    onChange={(v) => updateOverride(index, { style: v as CertificationCardStyle })}
                    options={CARD_STYLE_OPTIONS}
                  />

                  {/* ── Override display toggles ── */}
                  <div className="space-y-2">
                    <Toggle
                      label="Show certification name (override)"
                      checked={override.showCertificationName ?? data.showCertificationName}
                      onChange={(v) => updateOverride(index, { showCertificationName: v })}
                    />
                    <Toggle
                      label="Show issuing organization (override)"
                      checked={override.showIssuingOrganization ?? data.showIssuingOrganization}
                      onChange={(v) => updateOverride(index, { showIssuingOrganization: v })}
                    />
                    <Toggle
                      label="Show issue date (override)"
                      checked={override.showIssueDate ?? data.showIssueDate}
                      onChange={(v) => updateOverride(index, { showIssueDate: v })}
                    />
                    <Toggle
                      label="Show expiration date (override)"
                      checked={override.showExpirationDate ?? data.showExpirationDate}
                      onChange={(v) => updateOverride(index, { showExpirationDate: v })}
                    />
                    <Toggle
                      label="Show certificate link (override)"
                      checked={override.showCertificateLink ?? data.showCertificateLink}
                      onChange={(v) => updateOverride(index, { showCertificateLink: v })}
                    />
                    <Toggle
                      label="Show verification badge (override)"
                      checked={override.showVerificationBadge ?? data.showVerificationBadge}
                      onChange={(v) => updateOverride(index, { showVerificationBadge: v })}
                    />
                    <Toggle
                      label="Show validity indicator (override)"
                      checked={override.showValidityIndicator ?? data.showValidityIndicator}
                      onChange={(v) => updateOverride(index, { showValidityIndicator: v })}
                    />
                    <Toggle
                      label="Show description (override)"
                      checked={override.showDescription ?? data.showDescription}
                      onChange={(v) => updateOverride(index, { showDescription: v })}
                    />
                  </div>

                  {/* ── Accent color ── */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--pb-text-secondary)] mb-1.5">
                      Accent Color
                    </label>
                    <ColorPicker
                      id={`override-color-${index}`}
                      value={override.accentColor || ""}
                      onChange={(v) => updateOverride(index, { accentColor: v || undefined })}
                      placeholder="Default"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
