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
        <div className={`mb-6 sm:mb-8 md:mb-10 ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-2 sm:mb-3">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[var(--accent)]/10 shrink-0">
                        {icon}
                    </div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-league-700 tracking-tight break-words">
                        {title}
                    </h1>
                </div>
                {action && (
                    <div className="w-full sm:w-auto">
                        {action}
                    </div>
                )}
            </div>
            {description && (
                <p className="text-sm sm:text-base text-[var(--foreground)]/60 pl-10 sm:pl-14">
                    {description}
                </p>
            )}
        </div>
    );
}