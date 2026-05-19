// src/app/components/profile/edit-components/TabBar.tsx

export type TabKey = "personal" | "profile";

interface TabBarProps {
    activeTab: TabKey;
    onTabChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    {
        key: "personal",
        label: "Personal",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
    {
        key: "profile",
        label: "Profile",
        icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
];

export const TabBar = ({ activeTab, onTabChange }: TabBarProps) => {
    return (
        <div className="card rounded-2xl p-1.5 flex gap-1">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onTabChange(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-league-500 transition-all duration-200
                        ${activeTab === tab.key
                            ? "bg-(--accent) text-(--background)"
                            : "text-(--foreground)/60 hover:text-(--foreground) hover:bg-(--foreground)/5"
                        }`}
                >
                    {tab.icon}
                    {tab.label}
                </button>
            ))}
        </div>
    );
};