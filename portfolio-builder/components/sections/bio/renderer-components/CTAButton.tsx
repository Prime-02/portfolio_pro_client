// portfolio-builder/components/sections/bio/renderer-components/CTAButton.tsx

interface CTAButtonProps {
  label: string;
  url: string;
  variant?: "primary" | "secondary" | "outline";
  openInNewTab?: boolean;
  className?: string;
}

export function CTAButton({ label, url, variant = "primary", openInNewTab, className = "" }: CTAButtonProps) {
  const baseClass = "inline-flex items-center px-6 py-3 rounded-lg font-medium text-sm transition-colors";

  const variantClasses = {
    primary: "bg-white text-black hover:bg-neutral-200",
    secondary: "bg-neutral-700 text-white hover:bg-neutral-600",
    outline: "border border-neutral-500 text-white hover:bg-neutral-800",
  };

  return (
    <a
      href={url}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      className={`${baseClass} ${variantClasses[variant]} ${className}`}
    >
      {label}
    </a>
  );
}
