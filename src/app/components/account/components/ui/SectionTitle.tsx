// components/ui/SectionTitle.tsx
export function ASSectionTitle({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h2
            className={`font-league-600 ${className} text-xl tracking-tight text-(--foreground)`}
        >
            {children}
        </h2>
    );
}
