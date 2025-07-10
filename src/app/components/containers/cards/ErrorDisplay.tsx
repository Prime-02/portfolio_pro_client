import React from "react";
import { RefreshCw } from "lucide-react";
import Image from "next/image";

interface ErrorDisplayProps {
  error?: Error | string | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
  retryText?: string;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  title = "Failed to load content",
  description,
  retryText = "Try Again",
  className = "",
}) => {
  const getErrorMessage = () => {
    if (description) return description;
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Something went wrong. Please try again.";
  };

  const errorMessage = getErrorMessage();

  return (
    <div
      className={`col-span-full flex flex-col items-center justify-center py-12 ${className}`}
    >
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md">
        <Image
          src={"/vectors/undraw_monitor_ypga.svg"}
          width={100}
          height={100}
          className="mx-auto"
          alt="Failed to load portfolio"
        />
        <h3 className="text-lg font-semibold text-red-900 mb-2">{title}</h3>
        <p className="text-red-700 mb-4">{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mx-auto"
          >
            <RefreshCw size={16} />
            {retryText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorDisplay;
