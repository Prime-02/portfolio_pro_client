// components/certifications/PageHeader.tsx
import { ReactNode } from "react";

interface PageHeaderProps {
    icon: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function PageHeader({ icon, title, description, action, className = "" }: PageHeaderProps) {
    return (
        <div className={`mb-10 ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[var(--accent)]/10">
                        {icon}
                    </div>
                    <h1 className="text-3xl font-league-700 tracking-tight">{title}</h1>
                </div>
                {action && <div>{action}</div>}
            </div>
            {description && (
                <p className="text-[var(--foreground)]/60 pl-14">
                    {description}
                </p>
            )}
        </div>
    );
}