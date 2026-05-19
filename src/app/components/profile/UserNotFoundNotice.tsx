// src/app/components/profile/UserNotFoundNotice.tsx
interface UserNotFoundNoticeProps {
    username: string;
}

export const UserNotFoundNotice = ({ username }: UserNotFoundNoticeProps) => {
    return (
        <div className="mb-6 p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
           {` The user "${username}" doesn't exist. Showing your profile instead.`}
        </div>
    );
};