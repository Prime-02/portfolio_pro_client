import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  /** px before the sentinel reaches viewport to trigger load. Default 200 */
  rootMargin?: string;
}

/**
 * Returns a ref to attach to the sentinel element.
 * When the sentinel enters the viewport (and hasMore is true and not loading)
 * it calls onLoadMore.
 */
export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = "200px",
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  const observe = useCallback(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    return observe();
  }, [hasMore, isLoading, observe]);

  return sentinelRef;
}
