// src/app/components/profile/Badge.tsx

interface BadgeProps {
    children: React.ReactNode;
    active?: boolean;
    color?: "accent" | "primary" | "secondary";
    size?: "sm" | "md" | "lg";
    className?: string
}

export const Badge = ({
    children,
    active = false,
    color = "accent",
    size = "md",
    className
}: BadgeProps) => {
    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-2 text-base",
    };

    const colorClasses = {
        accent: active
            ? "bg-(--accent) text-(--background)"
            : "bg-(--accent)/10 text-(--accent)",
        primary: active
            ? "bg-(--foreground) text-(--background)"
            : "bg-(--foreground)/10 text-(--foreground)",
        secondary: active
            ? "bg-(--secondary_theme) border text-(--background)"
            : "bg-(--secondary_theme)/10 border text-(--secondary_theme)",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full font-league-500 ${className} ${sizeClasses[size]} ${colorClasses[color]}`}
        >
            {children}
        </span>
    );
};