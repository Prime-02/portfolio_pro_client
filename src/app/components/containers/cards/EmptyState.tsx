import React from "react";
import Image from "next/image";
import Button from "../../buttons/Buttons";

interface EmptyStateProps {
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>; // Accepts Lucide icons or other SVG components
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  className?: string;
  imageUrl?: string; // New prop for custom image URL
  imageWidth?: number; // New prop for image width
  imageHeight?: number; // New prop for image height
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No items found",
  description = "Try adjusting your search criteria.",
  actionText = "",
  onAction,
  hasFilters = false,
  onClearFilters,
  className = "",
  imageUrl = "/vectors/undraw_search-engines_k649.svg", // Default image URL
  imageWidth = 100, // Default width
  imageHeight = 100, // Default height
}) => {
  
  return (
    <div
      className={`col-span-full  flex flex-col items-center justify-center py-12 `}
    >
      {imageUrl && (
        <Image
          width={imageWidth}
          height={imageHeight}
          alt="Nothing found"
          src={imageUrl}
        />
      )}
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text- mb-2">{title}</h3>
        <p className="text- mb-4">{description}</p>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          {hasFilters && onClearFilters && (
            <button
              onClick={onClearFilters}
              className="px-4 py-2 bg- text-white rounded-lg hover:bg- transition-colors"
            >
              Clear Filters
            </button>
          )}

          {actionText && onAction && (
            <Button
              variant="primary"
              size="md"
              text={actionText}
              onClick={() => {
                onAction();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;