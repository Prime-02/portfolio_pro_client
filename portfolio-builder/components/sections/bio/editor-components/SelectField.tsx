// portfolio-builder/components/sections/bio/editor-components/SelectField.tsx

import { inputClass } from "./styles";
import Field from "./Field";
import Dropdown from "@/src/app/components/inputs/DynamicDropdown";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  hint?: string;
}

export default function SelectField({ label, id, value, onChange, options, hint }: SelectFieldProps) {
  const formattedArray = options.map((opt) => ({
    id: opt.value,
    code: opt.label,
  }));
  return (
    <Dropdown
      options={formattedArray}
      value={value}
      onSelect={(e) => onChange(e as string)}
      includeNoneOption={false}
    />
  );
}