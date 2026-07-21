// components/ui/Card.tsx
export function ASCard({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-xl border border-(--foreground)/10 bg-(--background) p-6 ${className}`}
        >
            {children}
        </div>
    );
}
