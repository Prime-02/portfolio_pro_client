import React from "react";
import { getColorShade } from "../../utilities/syncFunctions/syncs";
import { useTheme } from "../../theme/ThemeContext ";
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
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No items found",
  description = "Try adjusting your search criteria.",
  actionText = "",
  onAction,
  hasFilters = false,
  onClearFilters,
  className = "",
}) => {
  const { theme } = useTheme();
  return (
    <div
      style={{
        backgroundColor: getColorShade(theme.background, 10),
      }}
      className={`col-span-full shadow-xl rounded-2xl flex flex-col items-center justify-center py-12 ${className}`}
    >
      <Image
        width={100}
        height={100}
        alt="Nothing found"
        src={"/vectors/undraw_search-engines_k649.svg"}
      />
      <div className="text-center ">
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
