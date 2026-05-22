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
            <label htmlFor={htmlFor} className="block text-sm font-medium text-neutral-300">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {children}
        </div>
    );
}