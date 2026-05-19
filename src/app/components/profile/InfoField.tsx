// src/app/components/profile/InfoField.tsx

interface InfoFieldProps {
    label: string;
    value: string | number | boolean | null | undefined;
    isLink?: boolean;
    linkUrl?: string;
}

export const InfoField = ({ label, value, isLink, linkUrl }: InfoFieldProps) => {
    if (value === null || value === undefined || value === "") return null;

    const displayValue = typeof value === "boolean" ? (value ? "Yes" : "No") : value;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-(--accent)/20 last:border-b-0">
            <span className="text-sm font-league-500 text-(--foreground)/70 w-40 shrink-0 mb-1 sm:mb-0">
                {label}
            </span>
            {isLink ? (
                <a
                    href={linkUrl || (displayValue as string)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--accent) hover:underline font-league-400 transition-colors"
                >
                    {displayValue}
                </a>
            ) : (
                <span className="text-(--foreground) font-league-400">{displayValue}</span>
            )}
        </div>
    );
};