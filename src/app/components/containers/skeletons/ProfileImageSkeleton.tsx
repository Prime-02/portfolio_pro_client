import React from "react";

// Utility function for class merging (inline implementation)
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(" ");
};

type ProfileImageSkeletonProps = {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  showShimmer?: boolean;
  variant?: "default" | "subtle" | "bordered";
  showIcon?: boolean;
  "aria-label"?: string;
  testId?: string;
};

const ProfileImageSkeleton: React.FC<ProfileImageSkeletonProps> = ({
  size = "md",
  rounded = "full",
  className,
  showShimmer = true,
  variant = "default",
  showIcon = true,
  "aria-label": ariaLabel = "Loading profile image",
  testId,
}) => {
  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
    "2xl": "h-32 w-32",
    full: "h-full w-full", // Added full size option
  } as const;

  const roundedClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    full: "rounded-full",
  } as const;

  const variantClasses = {
    default: "bg-gray-200 dark:bg-gray-700",
    subtle: "bg-gray-100 dark:bg-gray-800",
    bordered:
      "bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600",
  } as const;

  const shimmerClasses = showShimmer
    ? "animate-pulse relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent dark:before:via-white/10"
    : "animate-pulse";

  // Profile icon SVG
  const ProfileIcon = () => (
    <svg
      className="h-1/2 w-1/2 text-[var(--foreground)]"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div
      className={cn(
        "flex-shrink-0 flex items-center justify-center",
        size === "full" ? "h-full w-full" : sizeClasses[size],
        roundedClasses[rounded],
        variantClasses[variant],
        shimmerClasses,
        className
      )}
      aria-label={ariaLabel}
      data-testid={testId}
      role="img"
      aria-busy="true"
    >
      {showIcon && <ProfileIcon />}
    </div>
  );
};

// CSS for shimmer animation (add to your global styles)
const shimmerKeyframes = `
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
`;

export default ProfileImageSkeleton;
export { shimmerKeyframes };