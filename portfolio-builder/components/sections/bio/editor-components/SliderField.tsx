// portfolio-builder/components/sections/bio/editor-components/SliderField.tsx

import Field from "./Field";

interface SliderFieldProps {
  label: string;
  htmlFor: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
}

export default function SliderField({
  label,
  htmlFor,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: SliderFieldProps) {
  return (
    <Field label={label} htmlFor={htmlFor}>
      <div className="flex items-center gap-3">
        <input
          id={htmlFor}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 appearance-none bg-neutral-700 rounded-full accent-white cursor-pointer"
        />
        <span className="text-sm text-neutral-300 tabular-nums w-16 text-right">
          {value}
          {unit}
        </span>
      </div>
    </Field>
  );
}
