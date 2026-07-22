import Image from "@/src/app/components/ui/Image";

export function ASAvatar({
    src,
    fallback,
    size = "md",
}: {
    src: string | null;
    fallback: string;
    size?: "sm" | "md" | "lg";
}) {
    const sizeClasses = {
        sm: "h-8 w-8 text-xs",
        md: "h-12 w-12 text-sm",
        lg: "h-20 w-20 text-lg",
    };
    const dimensions = {
        sm: 32,
        md: 48,
        lg: 80,
    };
    const initials = fallback
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div
            className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-(--accent)/15 text-(--accent) font-league-600 overflow-hidden`}
        >
            {src ? (
                <Image
                    src={src}
                    alt={fallback || "Profile picture"}
                    width={dimensions[size]}
                    height={dimensions[size]}
                    className="h-full w-full rounded-full object-cover"
                />
            ) : (
                initials
            )}
        </div>
    );
}
