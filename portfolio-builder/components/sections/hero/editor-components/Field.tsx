// portfolio-builder/components/sections/hero/editor-components/Field.tsx

interface FieldProps {
    label: string;
    htmlFor: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}

export default function Field({ label, htmlFor, className, required, children }: FieldProps) {
    return (
        <div className={`space-y-1.5 ${className || ""}`}>
            <label htmlFor={htmlFor} className="block text-sm font-medium text-[var(--pb-text-secondary)]">
                {label}
                {required && <span className="text-[var(--pb-error)] ml-1">*</span>}
            </label>
            {children}
        </div>
    );
}