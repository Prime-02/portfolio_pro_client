import React, {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";

export interface MasonryGridProps {
  children: ReactNode;
  className?: string;
  gap?: number;
  totalItems?: number;
  loadedItems?: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  onLoadMore?: () => Promise<void> | void;
  loadingIndicator?: ReactNode;
  threshold?: number;
  isLoading?: boolean;
  minColumnWidth?: number; // New: minimum column width for content readability
  enablePullToRefresh?: boolean; // New: pull to refresh functionality
  onRefresh?: () => Promise<void> | void; // New: refresh callback
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
  threshold = 0.1,
  isLoading = false,
  minColumnWidth = 280, // Mobile-optimized minimum column width
  enablePullToRefresh = false,
  onRefresh,
}: MasonryGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);
  const pendingPageRef = useRef(page);
  const touchStartYRef = useRef(0);
  const isPullingRef = useRef(false);
  
  // Mobile-specific state
  const [columnCount, setColumnCount] = useState(1); // Start with single column for mobile-first
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    hasTouch: false,
    pixelRatio: 1,
    preferReducedMotion: false,
  });

  const hasMore = useMemo(() => {
    return typeof totalItems === "number" ? loadedItems < totalItems : true;
  }, [totalItems, loadedItems]);

  // Detect device capabilities and preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateDeviceInfo = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;
      
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const pixelRatio = window.devicePixelRatio || 1;
      const preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      setDeviceInfo({ isMobile, hasTouch, pixelRatio, preferReducedMotion });
    };

    updateDeviceInfo();
    
    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Mobile-optimized column calculation
  const getColumnCount = useCallback(() => {
    if (!containerRef.current || !isHydrated) return 1;
    
    try {
      const containerWidth = containerRef.current.offsetWidth;
      const availableWidth = containerWidth - (gap * 2); // Account for container padding
      
      // Calculate based on minimum column width rather than arbitrary breakpoints
      const maxPossibleColumns = Math.floor(availableWidth / minColumnWidth);
      
      // Mobile-first breakpoint strategy
      if (containerWidth < 480) {
        return 1; // Always single column on very small screens
      } else if (containerWidth < 640) {
        return Math.min(2, maxPossibleColumns);
      } else if (containerWidth < 768) {
        return Math.min(2, maxPossibleColumns);
      } else if (containerWidth < 1024) {
        return Math.min(3, maxPossibleColumns);
      } else if (containerWidth < 1280) {
        return Math.min(4, maxPossibleColumns);
      } else {
        return Math.min(5, maxPossibleColumns);
      }
    } catch {
      return 1;
    }
  }, [isHydrated, minColumnWidth, gap]);

  // Handle hydration with mobile-optimized initial setup
  useLayoutEffect(() => {
    setIsHydrated(true);
    const initialCount = getColumnCount();
    setColumnCount(initialCount);
  }, [getColumnCount]);

  // Mobile-optimized resize handler with faster response for orientation changes
  useEffect(() => {
    if (!isHydrated) return;

    let timeoutId: NodeJS.Timeout;
    let isOrientationChange = false;
    
    const handleOrientationChange = () => {
      isOrientationChange = true;
      // Faster response for orientation changes
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newCount = getColumnCount();
        setColumnCount(prevCount => prevCount !== newCount ? newCount : prevCount);
        isOrientationChange = false;
      }, 50); // Reduced from 100ms
    };
    
    const handleResize = () => {
      if (isOrientationChange) return; // Skip if orientation change already handled
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newCount = getColumnCount();
        setColumnCount(prevCount => prevCount !== newCount ? newCount : prevCount);
      }, deviceInfo.preferReducedMotion ? 200 : 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      clearTimeout(timeoutId);
    };
  }, [getColumnCount, isHydrated, deviceInfo.preferReducedMotion]);

  // Enhanced load more with mobile network considerations
  const handleLoadMore = useCallback(async () => {
    if (!onLoadMore || loadingRef.current || isLoading || !hasMore || !isOnline) {
      return;
    }

    loadingRef.current = true;
    const targetPage = pendingPageRef.current + 1;

    try {
      await onLoadMore();
      
      if (pendingPageRef.current === targetPage - 1) {
        setPage(targetPage);
        pendingPageRef.current = targetPage;
      }
    } catch (error) {
      console.error("Error loading more items:", error);
      // Show user-friendly error on mobile
      if (deviceInfo.isMobile) {
        // Could trigger a toast notification here
      }
    } finally {
      loadingRef.current = false;
    }
  }, [onLoadMore, isLoading, hasMore, isOnline, setPage, deviceInfo.isMobile]);

  // Pull-to-refresh functionality
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enablePullToRefresh || !onRefresh || window.scrollY > 0) return;
    touchStartYRef.current = e.touches[0].clientY;
  }, [enablePullToRefresh, onRefresh]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enablePullToRefresh || !onRefresh || window.scrollY > 0 || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const pullDistance = Math.max(0, currentY - touchStartYRef.current);
    
    if (pullDistance > 10) {
      isPullingRef.current = true;
      setPullDistance(Math.min(pullDistance, 120)); // Max pull distance
      
      // Prevent default scroll when pulling
      if (pullDistance > 50) {
        e.preventDefault();
      }
    }
  }, [enablePullToRefresh, onRefresh, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!enablePullToRefresh || !onRefresh || !isPullingRef.current) return;
    
    isPullingRef.current = false;
    
    if (pullDistance > 80) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error("Error refreshing:", error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
  }, [enablePullToRefresh, onRefresh, pullDistance]);

  // Add touch event listeners for pull-to-refresh
  useEffect(() => {
    if (!enablePullToRefresh || !deviceInfo.hasTouch) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enablePullToRefresh, deviceInfo.hasTouch, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Sync external state
  useEffect(() => {
    pendingPageRef.current = page;
  }, [page]);

  useEffect(() => {
    if (!isLoading) {
      loadingRef.current = false;
    }
  }, [isLoading]);

  // Mobile-optimized intersection observer
  useEffect(() => {
    if (!hasMore || !onLoadMore || !isHydrated) {
      return;
    }

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const options = {
      root: null,
      // Smaller rootMargin on mobile to prevent excessive loading
      rootMargin: deviceInfo.isMobile ? "25px" : "50px",
      threshold,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loadingRef.current && !isLoading && hasMore && isOnline) {
        handleLoadMore();
      }
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [hasMore, onLoadMore, isHydrated, threshold, deviceInfo.isMobile, isOnline]);

  // Optimized children distribution
  const distributedColumns = useMemo(() => {
    const childrenArray = React.Children.toArray(children);
    const columns = Array.from({ length: columnCount }, () => [] as ReactNode[]);

    // Round-robin distribution for balanced layout
    childrenArray.forEach((child, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(child);
    });

    return columns;
  }, [children, columnCount]);

  // Calculate mobile-optimized gap
  const mobileGap = useMemo(() => {
    if (!deviceInfo.isMobile) return gap;
    // Larger gaps on mobile for better touch targets
    return Math.max(gap, 24);
  }, [gap, deviceInfo.isMobile]);

  // Loading skeleton optimized for mobile
  if (!isHydrated) {
    return (
      <div className={`w-full overflow-auto ${className}`}>
        <div className="flex animate-pulse" style={{ gap: `${mobileGap}px`, padding: `0 ${mobileGap / 2}px` }}>
          {Array.from({ length: deviceInfo.isMobile ? 1 : 2 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col" style={{ gap: `${mobileGap}px` }}>
              <div className="h-32 bg-gray-200 rounded-lg"></div>
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-40 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-auto ${className}`}>
      {/* Pull-to-refresh indicator */}
      {enablePullToRefresh && (pullDistance > 0 || isRefreshing) && (
        <div 
          className="flex justify-center items-center transition-transform duration-200 ease-out"
          style={{ 
            transform: `translateY(${Math.min(pullDistance - 50, 0)}px)`,
            height: Math.max(0, pullDistance - 50),
            opacity: pullDistance > 50 ? 1 : pullDistance / 50
          }}
        >
          <div className={`${isRefreshing ? 'animate-spin' : ''} rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent`}>
            {!isRefreshing && pullDistance > 80 && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Masonry Grid */}
      <div 
        ref={containerRef} 
        className="flex" 
        style={{ 
          gap: `${mobileGap}px`,
          padding: `0 ${mobileGap / 2}px`,
          minHeight: deviceInfo.isMobile ? '100vh' : 'auto' // Ensure proper mobile viewport
        }}
      >
        {distributedColumns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex-1 flex flex-col"
            style={{ 
              gap: `${mobileGap}px`,
              minWidth: deviceInfo.isMobile ? '0' : `${minColumnWidth}px` // Prevent overflow on mobile
            }}
          >
            {column}
          </div>
        ))}
      </div>

      {/* Invisible sentinel for intersection observer */}
      {hasMore && isOnline && (
        <div
          ref={sentinelRef}
          className="w-full h-1"
          style={{ marginTop: mobileGap }}
          aria-hidden="true"
        />
      )}

      {/* Offline indicator */}
      {!isOnline && (
        <div className="flex justify-center py-6">
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">You're offline. Check your connection.</span>
            </div>
          </div>
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && totalItems !== undefined && totalItems > 0 && (
        <div className="text-center py-8 opacity-60">
          <div className={`${deviceInfo.isMobile ? 'px-6' : ''}`}>
            <p className={`${deviceInfo.isMobile ? 'text-base' : 'text-sm'}`}>
              Showing all {totalItems} item{totalItems !== 1 ? 's' : ''}
            </p>
            {deviceInfo.isMobile && enablePullToRefresh && (
              <p className="text-xs text-gray-400 mt-2">Pull down to refresh</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;