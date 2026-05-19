// src/app/profile/view/EmptyState.tsx

interface EmptyStateProps {
    visible: boolean;
}

export const EmptyState = ({ visible }: EmptyStateProps) => {
    if (!visible) return null;

    return (
        <div className="card rounded-2xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-(--accent)/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-(--accent)/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </div>
            <p className="text-(--foreground)/50 font-league-400">No profile data available</p>
        </div>
    );
};