// src/app/profile/view/StatCard.tsx

import { Briefcase, BadgeCheck, Clock, MapPin } from "lucide-react";

type StatIcon = "briefcase" | "badge" | "clock" | "map-pin";

interface StatCardProps {
    value: string | number;
    label: string;
    icon?: StatIcon;
}

const icons: Record<StatIcon, React.ReactNode> = {
    briefcase: <Briefcase className="w-3.5 h-3.5" />,
    badge: <BadgeCheck className="w-3.5 h-3.5" />,
    clock: <Clock className="w-3.5 h-3.5" />,
    "map-pin": <MapPin className="w-3.5 h-3.5" />,
};

export const StatCard = ({ value, label, icon }: StatCardProps) => {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-(--foreground)/[0.03] border border-(--foreground)/5 hover:border-(--accent)/20 hover:bg-(--accent)/[0.02] transition-all duration-200">
            {icon && (
                <div className="w-8 h-8 rounded-lg bg-(--accent)/10 flex items-center justify-center text-(--accent) shrink-0 mt-0.5">
                    {icons[icon]}
                </div>
            )}
            <div className="flex flex-col min-w-0">
                <span className="text-sm font-league-600 text-(--foreground) truncate">{value}</span>
                <span className="text-xs font-league-400 text-(--foreground)/40">{label}</span>
            </div>
        </div>
    );
};