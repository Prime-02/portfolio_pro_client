import React from "react";

interface AbsoluteSearchingProps {
  count?: number; // Number of skeleton items to display
  containerHeight?: string; // Height of the container (e.g., "h-[300px]", "h-full")
  className?: string; // Additional Tailwind classes
}

const AbsoluteSearching: React.FC<AbsoluteSearchingProps> = ({
  count = 10,
  containerHeight = "h-full",
  className = "",
}) => {
  return (
    <div
      className={`w-full overflow-hidden flex flex-col gap-1 p-2 ${containerHeight} ${className}`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="w-full bg-gray-200 rounded animate-pulse"
          style={{
            height: `calc((${containerHeight} - 1rem) / ${count})`,
          }}
        />
      ))}
    </div>
  );
};

export default AbsoluteSearching;
