// portfolio-builder/components/sections/bio/editor-components/Field.tsx

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}

export default function Field({ label, htmlFor, className, required, children, hint }: FieldProps) {
  return (
    <div className={`space-y-1.5 ${className || ""}`}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-[var(--pb-text-secondary)]">
        {label}
        {required && <span className="text-[var(--pb-error)] ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[var(--pb-text-muted)] mt-0.5">{hint}</p>}
    </div>
  );
}