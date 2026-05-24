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
    primary: "bg-[var(--pb-foreground)] text-[var(--pb-background)] hover:opacity-90",
    secondary: "bg-[var(--pb-surface-elevated)] text-[var(--pb-text-primary)] hover:bg-[var(--pb-surface-hover)] border border-[var(--pb-border)]",
    outline: "border border-[var(--pb-border)] text-[var(--pb-text-primary)] hover:bg-[var(--pb-surface-hover)]",
    ghost: "text-[var(--pb-text-primary)] hover:bg-[var(--pb-surface-hover)]",
    link: "text-[var(--pb-foreground)] hover:underline underline-offset-4 px-0 py-0",
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