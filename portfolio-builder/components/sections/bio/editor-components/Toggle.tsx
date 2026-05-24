// portfolio-builder/components/sections/bio/editor-components/Toggle.tsx

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export default function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-9 h-5 rounded-full transition-colors ${checked ? "bg-foreground" : "bg-foreground/20"
            }`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform ${checked ? "translate-x-4" : "translate-x-0"
            }`}
        />
      </div>
      <div>
        <p className="text-sm text-foreground/70">{label}</p>
        {description && <p className="text-xs text-foreground/40 mt-0.5">{description}</p>}
      </div>
    </label>
  );
}