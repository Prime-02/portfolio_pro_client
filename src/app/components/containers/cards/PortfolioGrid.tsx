import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import PortfolioCard from "./PortfolioCard";
import LoadingSkeletons from "../skeletons/LoadingSkeletons";
import ErrorDisplay from "./ErrorDisplay";
import EmptyState from "./EmptyState";

export interface Portfolio {
  id?: string;
  name?: string;
  description?: string;
  cover_image_url?: string;
  cover_image_thumbnail?: string;
  is_public?: boolean;
  is_default?: boolean;
  created_at?: string;
  project_count?: number;
  owner?: {
    username?: string;
    profile?: {
      profile_picture?: string;
      profession?: string;
      location?: string;
      years_of_experience?: number;
      open_to_work?: boolean;
      availability?: string;
    };
  };
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  actionText?: string;
  action?: () => void;
  // [key: string]: any;
}

interface ErrorDisplayProps {
  error: Error | string | null;
  onRetry?: () => void;
  title?: string;
  // [key: string]: any;
}

interface PortfolioGridProps {
  data?: Portfolio[];
  loading?: boolean;
  error?: Error | string | null;
  hasMore?: boolean;
  onRefetch?: () => void;
  viewMode?: "grid" | "list" | string;
  setViewMode?: (viewMode: "grid" | "list") => void;
  onPortfolioClick?: (portfolio: Portfolio) => void;
  onPortfolioView?: (portfolio: Portfolio) => void;
  onPortfolioLike?: (portfolio: Portfolio) => void;
  onPortfolioShare?: (portfolio: Portfolio) => void;
  searchTerm?: string;
  filterTag?: string;
  onClearFilters?: () => void;
  emptyStateProps?: EmptyStateProps;
  errorProps?: ErrorDisplayProps;
  className?: string;
}

const PortfolioGrid: React.FC<PortfolioGridProps> = ({
  data,
  loading,
  error,
  hasMore,
  onRefetch,
  viewMode = "grid",
  setViewMode,
  onPortfolioClick,
  onPortfolioView,
  onPortfolioLike,
  onPortfolioShare,
  searchTerm = "",
  filterTag = "",
  onClearFilters,
  emptyStateProps = {},
  errorProps = {},
  className = "",
}) => {
  const [isListView, setIsListView] = useState(viewMode === "list");

  // Sync internal state with prop
  useEffect(() => {
    setIsListView(viewMode === "list");
  }, [viewMode]);

  // Handle view mode changes
  const handleViewModeChange = (newViewMode: "grid" | "list") => {
    setIsListView(newViewMode === "list");
    if (setViewMode) {
      setViewMode(newViewMode);
    }
  };

  const gridClasses = isListView
    ? "grid-cols-1 max-w-4xl mx-auto"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  const hasFilters = Boolean(searchTerm || filterTag);

  return (
    <div
      className={className}
      onClick={() => {
        handleViewModeChange("list");
      }}
    >
      {/* Portfolio Grid/List */}
      <div className={`grid gap-6 ${gridClasses}`}>
        {/* Error State */}
        {error && (
          <ErrorDisplay
            onRetry={onRefetch}
            title="Failed to load portfolios"
            {...errorProps}
          />
        )}

        {/* Empty State */}
        {!loading && !error && (!data || data.length === 0) && (
          <EmptyState
            title="No portfolios found"
            description={
              hasFilters
                ? "Try adjusting your search or filter criteria."
                : "Be the first to share your portfolio!"
            }
            hasFilters={hasFilters}
            onClearFilters={onClearFilters}
            {...emptyStateProps}
            actionText="Create Portfolio"
          />
        )}

        {/* Portfolio Cards */}
        {data &&
          data.map((portfolio, index) => (
            <PortfolioCard
              key={portfolio.id || `portfolio-${index}`}
              portfolio={portfolio}
              isListView={isListView}
              onPortfolioClick={onPortfolioClick}
              onView={onPortfolioView}
              onLike={onPortfolioLike}
              onShare={onPortfolioShare}
            />
          ))}

        {/* Loading Skeletons */}
        {loading && (
          <LoadingSkeletons
            count={isListView ? 4 : 8}
            isListView={isListView}
          />
        )}
      </div>

      {/* Load More Indicator */}
      {!loading && hasMore && (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500">
            <RefreshCw size={16} className="animate-spin" />
            <span>Loading more portfolios...</span>
          </div>
        </div>
      )}

      {/* End of Results */}
      {!loading && !hasMore && data && data.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {`You've reached the end of the portfolios!
`}{" "}
          </p>
        </div>
      )}
    </div>
  );
};

export default PortfolioGrid;
