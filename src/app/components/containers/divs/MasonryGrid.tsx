import React, {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

export interface MasonryGridProps {
  children: ReactNode;
  className?: string;
  gap?: number;
  totalItems?: number;
  loadedItems?: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  onLoadMore?: () => Promise<void> | void; // Make it clear this can be async
  loadingIndicator?: ReactNode;
  threshold?: number;
  isLoading?: boolean; // Add explicit loading state prop
}

const MasonryGrid = ({
  children,
  className = "",
  gap = 16,
  totalItems,
  loadedItems = React.Children.count(children),
  page,
  setPage,
  onLoadMore,
  loadingIndicator = <div>Loading...</div>,
  threshold = 0.1,
  isLoading = false, // Default to false
}: MasonryGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Track loading state internally to prevent race conditions
  const [internalLoading, setInternalLoading] = useState(false);
  const isCurrentlyLoading = isLoading || internalLoading;

  // Track last loaded count to detect when new items arrive
  const lastLoadedCountRef = useRef(loadedItems);

  const hasMore =
    typeof totalItems === "number" ? loadedItems < totalItems : true;

  const getColumnCount = useCallback(() => {
    if (!containerRef.current) return 1;

    const width = containerRef.current.offsetWidth;

    if (width >= 1280) return 5;
    if (width >= 768) return 4;
    if (width >= 640) return 3;
    return 2;
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCount());
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [getColumnCount]);

  // Smart load more function with better error handling
  const handleLoadMore = useCallback(async () => {
    if (!onLoadMore || isCurrentlyLoading || !hasMore) {
      return;
    }

    setInternalLoading(true);

    try {
      // Increment page first
      setPage((prev) => prev + 1);

      // Call the load more function
      await onLoadMore();
    } catch (error) {
      console.error("Error loading more items:", error);
      // Revert page increment on error
      setPage((prev) => Math.max(1, prev - 1));
    } finally {
      setInternalLoading(false);
    }
  }, [onLoadMore, isCurrentlyLoading, hasMore, setPage]);

  // Reset internal loading when new items are detected
  useEffect(() => {
    if (loadedItems > lastLoadedCountRef.current) {
      lastLoadedCountRef.current = loadedItems;
      setInternalLoading(false);
    }
  }, [loadedItems]);

  // Intersection Observer setup
  useEffect(() => {
    if (!hasMore || !onLoadMore) return;

    // Clean up existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const options = {
      root: null, // Use viewport as root for better performance
      rootMargin: "100px", // Start loading before reaching the bottom
      threshold,
    };

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;

      if (entry.isIntersecting && !isCurrentlyLoading && hasMore) {
        handleLoadMore();
      }
    }, options);

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, onLoadMore, isCurrentlyLoading, handleLoadMore, threshold]);

  // Organize children into columns with smart centering
  const childrenArray = React.Children.toArray(children);
  const columns = Array.from({ length: columnCount }, () => [] as ReactNode[]);

  // Calculate how many complete rows we have
  const completeRows = Math.floor(childrenArray.length / columnCount);
  const remainingItems = childrenArray.length % columnCount;

  childrenArray.forEach((child, index) => {
    const rowIndex = Math.floor(index / columnCount);
    const colIndex = index % columnCount;

    // For the last incomplete row, center the items
    if (rowIndex === completeRows && remainingItems > 0) {
      // Calculate offset to center the remaining items
      const offset = Math.floor((columnCount - remainingItems) / 2);
      const centeredColIndex = colIndex + offset;
      columns[centeredColIndex].push(child);
    } else {
      // For complete rows, distribute normally
      columns[colIndex].push(child);
    }
  });

  return (
    <div className={`w-full ${className}`}>
      {/* Masonry Grid */}
      <div ref={containerRef} className="flex" style={{ gap: `${gap}px` }}>
        {columns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex-1 flex flex-col"
            style={{ gap: `${gap}px` }}
          >
            {column}
          </div>
        ))}
      </div>

      <span
        ref={sentinelRef}
        className="w-8 h-8 rounded-full text-center  mx-auto flex items-center justify-center bg-[var(--background)] border-[var(--accent)] border text-xs"
      >
        {page}
      </span>

      {/* End of results indicator */}
      {!hasMore && totalItems !== undefined && totalItems > 0 && (
        <div className="text-center py-4 opacity-60">
          <p>Showing all {totalItems} items</p>
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;
