// src/app/components/profile/EmptyProfile.tsx
"use client";

interface EmptyProfileProps {
    isOwnProfile: boolean;
    onSetupProfile?: () => void;
}

export const EmptyProfile = ({ isOwnProfile, onSetupProfile }: EmptyProfileProps) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="card p-8 rounded-2xl text-center max-w-sm">
                <div className="w-16 h-16 rounded-full bg-(--foreground)/5 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-(--foreground)/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h3 className="text-xl font-league-600 text-(--foreground) mb-2">No Profile Found</h3>
                <p className="text-(--foreground)/60 font-league-400 text-sm">
                    {isOwnProfile ? "Complete your profile to get started." : "This user hasn't set up their profile yet."}
                </p>
                {isOwnProfile && (
                    <button
                        onClick={onSetupProfile}
                        className="mt-5 px-6 py-2.5 bg-(--accent) text-(--background) rounded-xl font-league-500 text-sm hover:bg-(--accent)/90 transition-all"
                    >
                        Set Up Profile
                    </button>
                )}
            </div>
        </div>
    );
};