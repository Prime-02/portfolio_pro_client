// src/app/components/profile/SectionHeader.tsx

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
}

export const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => (
    <div className="mb-6 pb-2 border-b-2 border-(--accent)">
        <h2 className="text-2xl font-league-600 text-(--foreground)">{title}</h2>
        {subtitle && (
            <p className="text-sm font-league-400 text-(--foreground)/60 mt-1">
                {subtitle}
            </p>
        )}
    </div>
);