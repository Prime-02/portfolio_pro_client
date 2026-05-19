// src/app/components/profile/ProfileNotFound.tsx
"use client";

import { useRouter } from "next/navigation";

export const ProfileNotFound = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="card p-8 rounded-2xl text-center max-w-sm">
                <div className="w-16 h-16 rounded-full bg-(--foreground)/5 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-(--foreground)/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 className="text-xl font-league-600 text-(--foreground) mb-2">Page Not Found</h3>
                <p className="text-(--foreground)/60 font-league-400 mb-6 text-sm">
                    {`The page you're looking for doesn't exist or you don't have access.`}
                </p>
                <button
                    onClick={() => router.push("/")}
                    className="px-6 py-2.5 bg-(--accent) text-(--background) rounded-xl font-league-500 text-sm hover:bg-(--accent)/90 transition-all"
                >
                    Go Back Home
                </button>
            </div>
        </div>
    );
};