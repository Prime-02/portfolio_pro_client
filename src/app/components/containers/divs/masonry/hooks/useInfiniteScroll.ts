import { useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
  enabled: boolean;
  enablePagination: boolean;
  threshold: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  loadedPageRange: { min: number; max: number };
  totalPages?: number;
  isFetchingMore: boolean;
  isFetchingPrevious: boolean;
  loading: boolean;
  dataLength: number;
  onLoadNext: () => void;
  onLoadPrevious: () => void;
}

export const useInfiniteScroll = ({
  enabled,
  enablePagination,
  threshold,
  hasNextPage,
  hasPrevPage,
  loadedPageRange,
  totalPages,
  isFetchingMore,
  isFetchingPrevious,
  loading,
  dataLength,
  onLoadNext,
  onLoadPrevious,
}: UseInfiniteScrollProps) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !enablePagination) return;

    const observers: IntersectionObserver[] = [];

    // Bottom observer logic
    if (sentinelRef.current) {
      const bottomObserver = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (
            entry.isIntersecting &&
            !isFetchingMore &&
            !loading &&
            hasNextPage &&
            dataLength > 0 &&
            loadedPageRange.max < (totalPages || Infinity)
          ) {
            onLoadNext();
          }
        },
        {
          root: null,
          rootMargin: `0px 0px ${threshold}px 0px`,
          threshold: 0.1,
        }
      );
      bottomObserver.observe(sentinelRef.current);
      observers.push(bottomObserver);
    }

    // Top observer logic
    if (topSentinelRef.current) {
      const topObserver = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (
            entry.isIntersecting &&
            !isFetchingPrevious &&
            !loading &&
            hasPrevPage &&
            dataLength > 0 &&
            loadedPageRange.min > 1
          ) {
            onLoadPrevious();
          }
        },
        {
          root: null,
          rootMargin: `${threshold}px 0px 0px 0px`,
          threshold: 0.1,
        }
      );
      topObserver.observe(topSentinelRef.current);
      observers.push(topObserver);
    }

    return () => observers.forEach(observer => observer.disconnect());
  }, [
    enabled,
    enablePagination,
    isFetchingMore,
    isFetchingPrevious,
    loading,
    hasNextPage,
    hasPrevPage,
    totalPages,
    threshold,
    dataLength,
    loadedPageRange,
    onLoadNext,
    onLoadPrevious,
  ]);

  return { sentinelRef, topSentinelRef };
};
