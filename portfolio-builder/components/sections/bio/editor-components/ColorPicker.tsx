// portfolio-builder/components/sections/bio/editor-components/ColorPicker.tsx

import { inputClass } from "./styles";

interface ColorPickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ColorPicker({ id, value, onChange, placeholder }: ColorPickerProps) {
  return (
    <div className="flex gap-2">
      <input
        id={id}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded cursor-pointer border border-neutral-700"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </div>
  );
}
