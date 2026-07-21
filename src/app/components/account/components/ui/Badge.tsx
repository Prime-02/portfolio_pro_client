
// components/ui/Badge.tsx
export function ASBadge({
    children,
    variant = "default",
}: {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "danger";
}) {
    const variants = {
        default: "bg-(--foreground)/10 text-(--foreground)/70",
        success: "bg-(--accent)/15 text-(--accent)",
        warning: "bg-amber-500/15 text-amber-500",
        danger: "bg-red-500/15 text-red-500",
    };
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}
        >
            {children}
        </span>
    );
}
