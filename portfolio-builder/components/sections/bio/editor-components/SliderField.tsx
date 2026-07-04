// portfolio-builder/components/sections/bio/editor-components/SliderField.tsx

import { PBRangeInput } from "@/portfolio-builder/components/shared/ui/inputs";

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}

export default function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: SliderFieldProps) {
  return (
    <PBRangeInput
      label={label}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={onChange}
    />
  );
}