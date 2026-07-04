// portfolio-builder/components/sections/bio/editor-components/Toggle.tsx

import { PBCheckBox, PBSwitch } from "@/portfolio-builder/components/shared/ui/inputs";

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export default function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <PBSwitch
        isSwitched={checked}
        onSwitch={onChange}
      />
      <div>
        <p className="text-sm text-foreground/70">{label}</p>
        {description && <p className="text-xs text-foreground/40 mt-0.5">{description}</p>}
      </div>
    </label>
  );
}