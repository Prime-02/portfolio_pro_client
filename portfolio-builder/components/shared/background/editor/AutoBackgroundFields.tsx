// portfolio-builder/components/shared/background/editor/AutoBackgroundFields.tsx

import type { SectionBackground } from "../types/sectionBackground";
import type { BackgroundModule, FieldType } from "./BackgroundRegistry.tsx";
import ColorPicker from "@/src/app/components/inputs/ColorPicker";
import { PBCheckBox, PBDropdown, PBRangeInput } from "../../ui/inputs";
import CheckBox from "@/src/app/components/inputs/CheckBox";

interface AutoBackgroundFieldsProps {
  module: BackgroundModule;
  bg: SectionBackground;
  onUpdate: (value: Partial<SectionBackground>) => void;
}

/**
 * Automatically renders editor fields for a background module based on its
 * field descriptors. Zero manual UI code needed when adding a new background.
 */
export function AutoBackgroundFields({ module, bg, onUpdate }: AutoBackgroundFieldsProps) {
  return (
    <div className="flex flex-col gap-4">
      {module.fields.map((field, idx) => (
        <FieldRenderer key={`${field.kind}-${field.label}-${idx}`} field={field} bg={bg} onUpdate={onUpdate} />
      ))}
    </div>
  );
}

function FieldRenderer({
  field,
  bg,
  onUpdate,
}: {
  field: FieldType;
  bg: SectionBackground;
  onUpdate: (v: Partial<SectionBackground>) => void;
}) {
  switch (field.kind) {
    case "color":
      return (
        <div>
          <label className="block text-xs text-[var(--pb-text-muted)] mb-1">{field.label}</label>
          <ColorPicker value={(bg as any)[field.key] ?? field.defaultValue} onChange={(v) => onUpdate({ [field.key]: v })} />
        </div>
      );

    case "slider": {
      const val = (bg as any)[field.key] ?? field.defaultValue;
      return (
        <div>
          <PBRangeInput
            label={field.label}
            min={field.min}
            max={field.max}
            step={field.step}
            value={val}
            onChange={(v) => onUpdate({ [field.key]: v })}
          />
        </div>
      );
    }

    case "text":
      return (
        <div>
          <label className="block text-sm font-medium text-[var(--pb-text-secondary)] mb-1.5">{field.label}</label>
          <input
            type="text"
            value={(bg as any)[field.key] ?? field.defaultValue}
            onChange={(e) => onUpdate({ [field.key]: e.target.value })}
            className="w-full bg-[var(--pb-input-bg)] border border-[var(--pb-input-border)] rounded-lg px-3 py-2 text-sm"
            placeholder={field.placeholder}
          />
        </div>
      );

    case "checkbox":
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <PBCheckBox
            isChecked={(bg as any)[field.key] ?? field.defaultValue}
            setIsChecked={(e: boolean) => onUpdate({ [field.key]: e })}
          />
          <span className="text-sm text-[var(--pb-text-secondary)]">{field.label}</span>
        </label>
      );

    case "dropdown":
      return (
        <div>
          <label className="block text-xs text-[var(--pb-text-muted)] mb-1">{field.label}</label>
          <PBDropdown
            options={field.options}
            onSelect={(v) => onUpdate({ [field.key]: v })}
            value={(bg as any)[field.key] ?? field.defaultValue}
            size="sm"
            variant="outlined"
          />
        </div>
      );

    case "group":
      return (
        <div className="grid grid-cols-2 gap-3">
          {field.fields.map((sub, i) => (
            <FieldRenderer key={i} field={sub} bg={bg} onUpdate={onUpdate} />
          ))}
        </div>
      );

    case "custom":
      return <>{field.render(bg, onUpdate)}</>;

    default:
      return null;
  }
}

// ── Shared reusable field components (for use in custom renderers) ─────────

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-[var(--pb-text-muted)] mb-1">{label}</label>
      <ColorPicker value={value} onChange={onChange} />
    </div>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <PBRangeInput
        label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e))}
        className="w-full h-1.5 appearance-none bg-[var(--pb-foreground-20)] rounded-full accent-[#ffffff] cursor-pointer"
      />
    </div>
  );
}

export function TextField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--pb-text-secondary)] mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[var(--pb-input-bg)] border border-[var(--pb-input-border)] rounded-lg px-3 py-2 text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <CheckBox isChecked={checked} setIsChecked={onChange} />
      <span className="text-sm text-[var(--pb-text-secondary)]">{label}</span>
    </label>
  );
}
