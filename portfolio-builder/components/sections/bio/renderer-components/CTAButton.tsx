// portfolio-builder/components/sections/bio/renderer-components/CTAButton.tsx

interface CTAButtonProps {
  label: string;
  url: string;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  openInNewTab?: boolean;
  className?: string;
}

export function CTAButton({ label, url, variant = "primary", openInNewTab, className = "" }: CTAButtonProps) {
  const baseClass = "inline-flex items-center px-6 py-3 rounded-lg font-medium text-sm transition-colors";

  const variantClasses: Record<string, string> = {
    primary: "bg-[var(--pb-accent)] text-white hover:opacity-90",
    secondary: "bg-[var(--pb-accent-10)] text-[var(--pb-accent)] hover:bg-[var(--pb-accent-20)]",
    outline: "border border-[var(--pb-accent)] text-[var(--pb-accent)] hover:bg-[var(--pb-accent-10)]",
    ghost: "text-[var(--pb-accent)] hover:bg-[var(--pb-accent-10)]",
    link: "text-[var(--pb-accent)] hover:underline underline-offset-4 px-0 py-0",
  };

  return (
    <a
      href={url}
      target={openInNewTab ? "_blank" : undefined}
      rel={openInNewTab ? "noopener noreferrer" : undefined}
      className={`${baseClass} ${variantClasses[variant] || variantClasses.primary} ${className}`}
    >
      {label}
    </a>
  );
}