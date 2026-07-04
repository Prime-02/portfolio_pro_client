// portfolio-builder/components/sections/bio/editor-components/CTATab.tsx

import { useState } from "react";
import { BioData, CTAVariant, CTAColorOverride, BioCTA } from "@/portfolio-builder/types/bio";
import Field from "./Field";
import ColorPicker from "./ColorPicker";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

interface CTATabProps {
  data: BioData;
  onChange: <K extends keyof BioData>(key: K, value: BioData[K]) => void;
}

const MAX_BUTTONS = 3;

const CTA_VARIANT_OPTIONS: { id: CTAVariant; code: string }[] = [
  { id: "primary", code: "Primary — Solid filled, highest emphasis" },
  { id: "secondary", code: "Secondary — Muted fill, supporting action" },
  { id: "outline", code: "Outline — Bordered, transparent fill" },
  { id: "ghost", code: "Ghost — No border or fill until hovered" },
  { id: "link", code: "Link — Underlined text, no button chrome" },
];

function validateUrl(url: string): string | null {
  if (!url.trim()) return null;
  const valid =
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("/") ||
    url.startsWith("#") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:");
  return valid ? null : 'URL must start with "https://", "/", "#", "mailto:", or "tel:"';
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-9 h-5 rounded-full transition-colors ${checked ? "bg-[var(--pb-foreground)]" : "bg-[var(--pb-foreground-20)]"
            }`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--pb-background)] transition-transform ${checked ? "translate-x-4" : "translate-x-0"
            }`}
        />
      </div>
      <span className="text-sm text-[var(--pb-text-secondary)]">{label}</span>
    </label>
  );
}

function ColorOverrideSection({
  override,
  onChange,
}: {
  override?: CTAColorOverride;
  onChange: (v: CTAColorOverride) => void;
}) {
  const [open, setOpen] = useState(
    !!(override?.bg || override?.text || override?.border)
  );

  const update = (key: keyof CTAColorOverride, value: string) => {
    onChange({ ...override, [key]: value || undefined });
  };

  const clear = (key: keyof CTAColorOverride) => {
    const next = { ...override };
    delete next[key];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-text-primary)] transition-colors"
      >
        <span
          className={`inline-block transition-transform duration-150 ${open ? "rotate-90" : ""
            }`}
        >
          ▶
        </span>
        Theme Color Overrides
        {(override?.bg || override?.text || override?.border) && (
          <span className="ml-1 px-1.5 py-0.5 rounded bg-[var(--pb-accent-20)] text-[var(--pb-accent)] text-[10px]">
            active
          </span>
        )}
      </button>

      {open && (
        <div className="pl-3 border-l border-[var(--pb-border)] space-y-3">
          <p className="text-xs text-[var(--pb-text-muted)] leading-relaxed">
            Overrides the variant's default colors. Leave blank to use the variant default.
          </p>

          {/* Background */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Field label="Background" htmlFor="ctaBg">
                <ColorPicker
                  id="ctaBg"
                  value={override?.bg || ""}
                  onChange={(v) => update("bg", v)}
                  placeholder="Variant default"
                />
              </Field>
            </div>
            {override?.bg && (
              <button
                type="button"
                onClick={() => clear("bg")}
                className="mt-5 text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors"
                title="Clear override"
              >
                ✕
              </button>
            )}
          </div>

          {/* Text */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Field label="Text" htmlFor="ctaText">
                <ColorPicker
                  id="ctaText"
                  value={override?.text || ""}
                  onChange={(v) => update("text", v)}
                  placeholder="Variant default"
                />
              </Field>
            </div>
            {override?.text && (
              <button
                type="button"
                onClick={() => clear("text")}
                className="mt-5 text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors"
                title="Clear override"
              >
                ✕
              </button>
            )}
          </div>

          {/* Border */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Field label="Border" htmlFor="ctaBorder">
                <ColorPicker
                  id="ctaBorder"
                  value={override?.border || ""}
                  onChange={(v) => update("border", v)}
                  placeholder="Variant default"
                />
              </Field>
            </div>
            {override?.border && (
              <button
                type="button"
                onClick={() => clear("border")}
                className="mt-5 text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors"
                title="Clear override"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── URL Picker Component ────────────────────────────────────────────
const EXTERNAL_LINK_ID = "__external__";

function UrlPicker({
  value,
  username,
  onChange,
}: {
  value: string;
  username?: string;
  onChange: (url: string) => void;
}) {
  const internalOptions = [
    { id: `/${username}/profile`, code: "Your Profile" },
    { id: `/${username}/projects`, code: "Your Projects" },
    { id: `/${username}/socials`, code: "Your Social Media Handles" },
    { id: `/${username}/experience`, code: "Your Experiences" },
    { id: `/${username}/certification`, code: "Your Certifications" },
    { id: `/${username}/education`, code: "Your Education" },
    { id: `/${username}/skills`, code: "Your Skills" },
    { id: `/${username}/testimonials`, code: "Your Testimonials" },
  ];

  const [mode, setMode] = useState<"internal" | "external">(() => {
    const isInternal = internalOptions.some((opt) => opt.id === value);
    return isInternal ? "internal" : value.trim() ? "external" : "internal";
  });

  const isInternalUrl = internalOptions.some((opt) => opt.id === value);

  const dropdownValue =
    mode === "internal" && isInternalUrl
      ? value
      : mode === "external"
        ? EXTERNAL_LINK_ID
        : "";

  const allOptions = [
    ...internalOptions,
    { id: EXTERNAL_LINK_ID, code: "🔗 External Link..." },
  ];

  return (
    <div className="space-y-3">
      <Dropdown
        options={allOptions}
        label="Link Destination"
        value={dropdownValue}
        onSelect={(val) => {
          if (val === EXTERNAL_LINK_ID) {
            setMode("external");
            onChange("");
          } else {
            setMode("internal");
            onChange(val as string);
          }
        }}
        placeholder="Choose a page or external link..."
        size="sm"
        includeNoneOption={false}
        clearable={false}
      />

      {mode === "external" && (
        <Textinput
          label="External URL"
          value={value}
          onChange={(e) => onChange(e)}
          placeholder='e.g. "https://example.com" or "mailto:hello@example.com"'
          error={value.trim() ? validateUrl(value) || undefined : undefined}
        />
      )}
    </div>
  );
}

export default function CTATab({ data, onChange }: CTATabProps) {
  const [collapsed, setCollapsed] = useState<Record<number, boolean>>({});
  const { userInfo } = useUserSettings();
  const buttons = data.ctaButtons || [];
  const atLimit = buttons.length >= MAX_BUTTONS;

  const toggleCollapsed = (index: number) =>
    setCollapsed((prev) => ({ ...prev, [index]: !prev[index] }));

  const addButton = () => {
    const newButton: BioCTA = {
      label: "Get in Touch",
      url: `/${userInfo?.username || ""}/profile`,
      variant: "primary",
      openInNewTab: false,
    };
    onChange("ctaButtons", [...buttons, newButton]);
  };

  const updateButton = (index: number, updates: Partial<BioCTA>) => {
    const updated = [...buttons];
    updated[index] = { ...updated[index], ...updates };
    onChange("ctaButtons", updated);
  };

  const removeButton = (index: number) => {
    const updated = buttons.filter((_, i) => i !== index);
    onChange("ctaButtons", updated.length > 0 ? updated : undefined);
  };

  const reorderButton = (from: number, to: number) => {
    if (to < 0 || to >= buttons.length) return;
    const updated = [...buttons];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange("ctaButtons", updated);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-medium text-[var(--pb-text-primary)]">
            Call-to-Action Buttons
          </h3>
          <p className="text-xs text-[var(--pb-text-muted)]">
            {buttons.length} / {MAX_BUTTONS} buttons
          </p>
        </div>
        <button
          type="button"
          onClick={addButton}
          disabled={atLimit}
          className={`text-sm transition-colors px-3 py-1 rounded-md ${atLimit
            ? "text-[var(--pb-text-disabled)] cursor-not-allowed"
            : "text-[var(--pb-text-primary)] hover:bg-[var(--pb-surface-hover)] border border-[var(--pb-border)]"
            }`}
          title={atLimit ? `Maximum of ${MAX_BUTTONS} buttons allowed` : undefined}
        >
          + Add Button
        </button>
      </div>

      {/* ── Empty state ───────────────────────────────────────── */}
      {buttons.length === 0 && (
        <div className="rounded-lg border border-dashed border-[var(--pb-border)] px-4 py-6 text-center">
          <p className="text-sm text-[var(--pb-text-secondary)]">No buttons yet.</p>
          <p className="text-xs text-[var(--pb-text-muted)] mt-1">
            Add up to {MAX_BUTTONS} call-to-action buttons to guide visitors.
          </p>
        </div>
      )}

      {/* ── Button cards ──────────────────────────────────────── */}
      {buttons.map((btn, index) => {
        const isCollapsed = collapsed[index];
        const urlError = validateUrl(btn.url);
        const cardLabel = btn.label.trim() || `Button ${index + 1}`;

        return (
          <div
            key={index}
            className="border border-[var(--pb-border)] rounded-lg overflow-hidden bg-[var(--pb-card-bg)]"
          >
            {/* Card header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--pb-surface)]">
              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => reorderButton(index, index - 1)}
                  disabled={index === 0}
                  className="text-[var(--pb-text-muted)] hover:text-[var(--pb-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed leading-none text-[10px]"
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => reorderButton(index, index + 1)}
                  disabled={index === buttons.length - 1}
                  className="text-[var(--pb-text-muted)] hover:text-[var(--pb-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed leading-none text-[10px]"
                  title="Move down"
                >
                  ▼
                </button>
              </div>

              {/* Label + variant badge */}
              <button
                type="button"
                onClick={() => toggleCollapsed(index)}
                className="flex-1 flex items-center gap-2 text-left min-w-0"
              >
                <span className="text-sm text-[var(--pb-text-primary)] truncate font-medium">
                  {cardLabel}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--pb-surface-elevated)] text-[var(--pb-text-muted)] shrink-0 capitalize border border-[var(--pb-border)]">
                  {btn.variant}
                </span>
                {urlError && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--pb-error-bg)] text-[var(--pb-error)] shrink-0 border border-[var(--pb-error-border)]">
                    invalid url
                  </span>
                )}
                <span className="ml-auto text-[var(--pb-text-muted)] text-xs">
                  {isCollapsed ? "▼" : "▲"}
                </span>
              </button>

              {/* Remove */}
              <button
                type="button"
                onClick={() => removeButton(index)}
                className="text-xs text-[var(--pb-text-muted)] hover:text-[var(--pb-error)] transition-colors shrink-0 px-1"
                title="Remove button"
              >
                ✕
              </button>
            </div>

            {/* Card body */}
            {!isCollapsed && (
              <div className="p-4 space-y-4">
                <div className="w-full">
                  <Textinput
                    label="Label"
                    value={btn.label}
                    onChange={(e) => updateButton(index, { label: e })}
                    placeholder='e.g. "View My Work"'
                  />
                </div>

                <UrlPicker
                  value={btn.url}
                  username={userInfo?.username || ""}
                  onChange={(newUrl) => updateButton(index, { url: newUrl })}
                />

                <div className="w-full">
                  <Dropdown
                    options={CTA_VARIANT_OPTIONS}
                    label="Variant"
                    value={btn.variant}
                    onSelect={(val) => updateButton(index, { variant: val as CTAVariant })}
                    placeholder="Select variant"
                    size="sm"
                    includeNoneOption={false}
                    clearable={false}
                  />
                </div>

                <Toggle
                  label="Open in new tab"
                  checked={btn.openInNewTab || false}
                  onChange={(v) => updateButton(index, { openInNewTab: v })}
                />

                <ColorOverrideSection
                  override={btn.colorOverride}
                  onChange={(v) => updateButton(index, { colorOverride: v })}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}