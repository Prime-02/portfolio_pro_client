import React from "react";
import { RefreshCw } from "lucide-react";
import Image from "next/image";
import Button from "../../buttons/Buttons";
import { useTheme } from "../../theme/ThemeContext ";

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
  const { isDarkMode } = useTheme();
  
  const getErrorMessage = () => {
    if (description) return description;
    if (error instanceof Error) return error.message;
    if (typeof error === "string") return error;
    return "Something went wrong. Please try again.";
  };

  const errorMessage = getErrorMessage();

  // Theme-specific styles
  const containerStyles = isDarkMode 
    ? "bg-red-900/20 border-red-700" 
    : "bg-red-50 border-red-500";

  const titleStyles = isDarkMode 
    ? "text-red-100" 
    : "text-red-900";

  const textStyles = isDarkMode 
    ? "text-red-200" 
    : "text-red-700";

  return (
    <div
      className={`col-span-full flex flex-col items-center justify-center w-sm py-12 ${className}`}
    >
      <div className={`${containerStyles} border rounded-xl p-6 text-center max-w-md`}>
        <Image
          src={"/vectors/undraw_monitor_ypga.svg"}
          width={100}
          height={100}
          className="mx-auto"
          alt="Failed to load portfolio"
        />
        <h3 className={`text-lg font-semibold mb-2 ${titleStyles}`}>
          {title}
        </h3>
        <p className={`mb-4 ${textStyles}`}>
          {errorMessage}
        </p>
        <span className="w-full flex items-center justify-center">
          {onRetry && (
            <Button
              icon2={<RefreshCw size={16} />}
              size="md"
              variant="primary"
              customColor="red"
              text={retryText}
              onClick={onRetry}
            />
          )}
        </span>
      </div>
    </div>
  );
};

export default ErrorDisplay;