// src/app/components/profile/ErrorMessage.tsx

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

export const ErrorMessage = ({ message, onRetry }: ErrorMessageProps) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="card p-8 rounded-xl text-center max-w-md">
            <svg
                className="w-16 h-16 text-(--accent) mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
            </svg>
            <h3 className="text-xl font-league-600 text-(--foreground) mb-2">
                Something went wrong
            </h3>
            <p className="text-(--foreground)/60 font-league-400 mb-6">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="px-6 py-2 rounded-lg bg-(--accent) text-(--background) font-league-500 hover:bg-(--accent)/90 transition-colors"
                >
                    Try Again
                </button>
            )}
        </div>
    </div>
);