// src/app/components/profile/LoadingSpinner.tsx

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    message?: string;
}

export const LoadingSpinner = ({
    size = "lg",
    message = "Loading...",
}: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-10 h-10",
        lg: "w-16 h-16",
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div
                className={`${sizeClasses[size]} border-4 border-(--foreground)/10 border-t-(--accent) rounded-full animate-spin`}
            />
            <p className="text-(--foreground)/60 font-league-400">{message}</p>
        </div>
    );
};