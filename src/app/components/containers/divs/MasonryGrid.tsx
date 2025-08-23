import React, {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from "react";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import { MdWarning } from "react-icons/md";
import { ArrowDown } from "lucide-react";

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
  minColumnWidth?: number;
  enablePullToRefresh?: boolean;
  onRefresh?: () => Promise<void> | void;
  customMessage?: string;
}

const MasonryGrid = ({
  children,
  className = "",
  gap = 1,
  totalItems,
  loadedItems = React.Children.count(children),
  page,
  setPage,
  onLoadMore,
  threshold = 0.1,
  isLoading = false,
  minColumnWidth = 0,
  enablePullToRefresh = true,
  onRefresh,
  customMessage,
}: MasonryGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef(false);
  const pendingPageRef = useRef(page);
  const touchStartYRef = useRef(0);
  const isPullingRef = useRef(false);
  const failsafeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastValidColumnCountRef = useRef<number>(1);
  // const columnCalculationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile-specific state
  const [columnCount, setColumnCount] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLoadMoreArrow, setShowLoadMoreArrow] = useState(false);
  const [gridStabilized, setGridStabilized] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    hasTouch: false,
    pixelRatio: 1,
    preferReducedMotion: false,
  });

  const hasMore = useMemo(() => {
    return typeof totalItems === "number" ? loadedItems < totalItems : true;
  }, [totalItems, loadedItems]);

  // Enhanced column calculation with better validation
  const getColumnCount = useCallback(() => {
    if (!containerRef.current || !isHydrated) return 1;

    try {
      const containerWidth = containerRef.current.offsetWidth;

      // Ensure we have valid dimensions
      if (!containerWidth || containerWidth < 100) {
        return lastValidColumnCountRef.current || 1;
      }

      const availableWidth = containerWidth - gap * 1;
      let calculatedColumns = 1;

      // Use minColumnWidth if provided, otherwise use breakpoint strategy
      if (minColumnWidth > 0) {
        calculatedColumns = Math.max(
          1,
          Math.floor(availableWidth / minColumnWidth)
        );
      } else {
        // Mobile-first breakpoint strategy with more precise calculations
        if (containerWidth < 480) {
          calculatedColumns = 1;
        } else if (containerWidth < 640) {
          calculatedColumns = 2;
        } else if (containerWidth < 768) {
          calculatedColumns = 3;
        } else if (containerWidth < 1024) {
          calculatedColumns = 3;
        } else if (containerWidth < 1280) {
          calculatedColumns = 4;
        } else if (containerWidth < 1536) {
          calculatedColumns = 5;
        } else {
          calculatedColumns = 6;
        }
      }

      // Ensure reasonable bounds
      calculatedColumns = Math.min(Math.max(calculatedColumns, 1), 8);

      // Store last valid calculation
      if (calculatedColumns > 0) {
        lastValidColumnCountRef.current = calculatedColumns;
      }

      return calculatedColumns;
    } catch (error) {
      console.warn("Error calculating column count:", error);
      return lastValidColumnCountRef.current || 2;
    }
  }, [isHydrated, minColumnWidth, gap]);

  // Detect device capabilities and preferences
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateDeviceInfo = () => {
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth <= 768;

      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const pixelRatio = window.devicePixelRatio || 1;
      const preferReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      setDeviceInfo({ isMobile, hasTouch, pixelRatio, preferReducedMotion });
    };

    updateDeviceInfo();

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // FAILSAFE: Grid system consistency checker and corrector
  useEffect(() => {
    if (!isHydrated || !containerRef.current) return;

    let consecutiveValidChecks = 0;
    const requiredValidChecks = 3; // Need 3 consecutive valid checks to consider stable

    const checkAndCorrectGrid = () => {
      if (!containerRef.current) return;

      const expectedColumnCount = getColumnCount();
      // const actualColumnElements = containerRef.current.children.length;

      // Check if the current column count makes sense
      const isValidColumnCount =
        expectedColumnCount > 0 &&
        expectedColumnCount <= 8 &&
        expectedColumnCount !== columnCount;

      const hasValidContainer = containerRef.current.offsetWidth > 0;
      const hasValidCalculation = expectedColumnCount > 0;

      if (hasValidContainer && hasValidCalculation && isValidColumnCount) {
        console.log(
          `[Failsafe] Correcting column count: ${columnCount} → ${expectedColumnCount}`
        );
        setColumnCount(expectedColumnCount);
        consecutiveValidChecks = 0; // Reset counter when correction is made
        setGridStabilized(false);
      } else if (
        hasValidContainer &&
        hasValidCalculation &&
        expectedColumnCount === columnCount
      ) {
        consecutiveValidChecks++;

        if (consecutiveValidChecks >= requiredValidChecks && !gridStabilized) {
          setGridStabilized(true);
          console.log(`[Failsafe] Grid stabilized with ${columnCount} columns`);
        }
      } else {
        consecutiveValidChecks = 0;
      }

      // Additional check for stuck states
      const containerWidth = containerRef.current.offsetWidth;
      if (containerWidth > 1200 && columnCount === 1) {
        console.log(
          "[Failsafe] Detected stuck single-column on wide screen, forcing recalculation"
        );
        setColumnCount(getColumnCount());
        setGridStabilized(false);
      } else if (containerWidth < 500 && columnCount > 2) {
        console.log(
          "[Failsafe] Detected too many columns on narrow screen, forcing recalculation"
        );
        setColumnCount(getColumnCount());
        setGridStabilized(false);
      }
    };

    // Initial check after a short delay
    const initialTimeout = setTimeout(checkAndCorrectGrid, 100);

    // Set up periodic checks (more frequent initially, then less frequent)
    let checkInterval = 1000; // Start with 1 second

    const scheduleNextCheck = () => {
      failsafeIntervalRef.current = setTimeout(() => {
        checkAndCorrectGrid();

        // Gradually increase interval if grid is stable
        if (gridStabilized && checkInterval < 5000) {
          checkInterval = Math.min(checkInterval * 1.5, 5000);
        } else if (!gridStabilized) {
          checkInterval = 1000; // Reset to frequent checks if unstable
        }

        scheduleNextCheck();
      }, checkInterval);
    };

    scheduleNextCheck();

    return () => {
      clearTimeout(initialTimeout);
      if (failsafeIntervalRef.current) {
        clearTimeout(failsafeIntervalRef.current);
        failsafeIntervalRef.current = null;
      }
    };
  }, [isHydrated, columnCount, getColumnCount, gridStabilized]);

  // Monitor scroll position to show/hide load more arrow
  useEffect(() => {
    if (!hasMore || !isOnline || !sentinelRef.current) {
      setShowLoadMoreArrow(false);
      return;
    }

    const handleScroll = () => {
      if (!sentinelRef.current) return;

      const sentinelRect = sentinelRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const shouldShowArrow =
        sentinelRect.top > windowHeight + 100 && !isLoading;
      setShowLoadMoreArrow(shouldShowArrow);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isOnline, isLoading]);

  // Scroll to sentinel to trigger loading
  const scrollToLoadMore = useCallback(() => {
    if (!sentinelRef.current) return;

    const sentinelRect = sentinelRef.current.getBoundingClientRect();
    const currentScrollY = window.scrollY;
    const targetScrollY =
      currentScrollY + sentinelRect.top - window.innerHeight / 2;

    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth",
    });

    setShowLoadMoreArrow(false);
  }, []);

  // Handle hydration with mobile-optimized initial setup
  useLayoutEffect(() => {
    setIsHydrated(true);
    const initialCount = getColumnCount();
    setColumnCount(initialCount);
    lastValidColumnCountRef.current = initialCount;
  }, [getColumnCount]);

  // Enhanced resize handler with debouncing and failsafe triggers
  useEffect(() => {
    if (!isHydrated) return;

    let timeoutId: NodeJS.Timeout;
    let isOrientationChange = false;

    const updateColumnCount = () => {
      const newCount = getColumnCount();
      if (newCount !== columnCount && newCount > 0) {
        console.log(
          `[Resize] Updating column count: ${columnCount} → ${newCount}`
        );
        setColumnCount(newCount);
        setGridStabilized(false); // Reset stability when resizing
      }
    };

    const handleOrientationChange = () => {
      isOrientationChange = true;
      setGridStabilized(false); // Always reset on orientation change

      clearTimeout(timeoutId);
      // Faster response for orientation changes
      timeoutId = setTimeout(() => {
        updateColumnCount();
        isOrientationChange = false;
      }, 50);
    };

    const handleResize = () => {
      if (isOrientationChange) return;

      setGridStabilized(false); // Reset stability on any resize
      clearTimeout(timeoutId);

      const delay = deviceInfo.preferReducedMotion ? 200 : 100;
      timeoutId = setTimeout(updateColumnCount, delay);
    };

    // Also listen for font loading which can affect layout
    const handleFontLoad = () => {
      setTimeout(updateColumnCount, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);
    document.addEventListener(
      "fonts" in document ? "fontsready" : "DOMContentLoaded",
      handleFontLoad
    );

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      document.removeEventListener(
        "fonts" in document ? "fontsready" : "DOMContentLoaded",
        handleFontLoad
      );
      clearTimeout(timeoutId);
    };
  }, [getColumnCount, isHydrated, deviceInfo.preferReducedMotion, columnCount]);

  // Enhanced load more with mobile network considerations
  const handleLoadMore = useCallback(async () => {
    if (
      !onLoadMore ||
      loadingRef.current ||
      isLoading ||
      !hasMore ||
      !isOnline
    ) {
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
      if (deviceInfo.isMobile) {
        // Could trigger a toast notification here
      }
    } finally {
      loadingRef.current = false;
    }
  }, [onLoadMore, isLoading, hasMore, isOnline, setPage, deviceInfo.isMobile]);

  // Pull-to-refresh functionality
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enablePullToRefresh || !onRefresh || window.scrollY > 0) return;
      touchStartYRef.current = e.touches[0].clientY;
    },
    [enablePullToRefresh, onRefresh]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (
        !enablePullToRefresh ||
        !onRefresh ||
        window.scrollY > 0 ||
        isRefreshing
      )
        return;

      const currentY = e.touches[0].clientY;
      const pullDistance = Math.max(0, currentY - touchStartYRef.current);

      if (pullDistance > 10) {
        isPullingRef.current = true;
        setPullDistance(Math.min(pullDistance, 120));

        if (pullDistance > 50) {
          e.preventDefault();
        }
      }
    },
    [enablePullToRefresh, onRefresh, isRefreshing]
  );

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

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    enablePullToRefresh,
    deviceInfo.hasTouch,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  ]);

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
      rootMargin: deviceInfo.isMobile ? "25px" : "50px",
      threshold,
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        !loadingRef.current &&
        !isLoading &&
        hasMore &&
        isOnline
      ) {
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
  }, [
    hasMore,
    onLoadMore,
    isHydrated,
    threshold,
    deviceInfo.isMobile,
    isOnline,
  ]);

  // Create skeleton loading cards
  const createSkeletonCards = useCallback(() => {
    return Array.from({ length: columnCount }).map((_, i) => (
      <ImageCard
        key={`loading-${i}`}
        id={`loading-${i}`}
        image_url=""
        isLoading={true}
      />
    ));
  }, [columnCount]);

  // Optimized children distribution with loading cards
  const distributedColumns = useMemo(() => {
    let allChildren: ReactNode[];

    if (isLoading && React.Children.count(children) === 0) {
      allChildren = createSkeletonCards();
    } else {
      allChildren = React.Children.toArray(children);
      if (isLoading && hasMore) {
        allChildren = [...allChildren, ...createSkeletonCards()];
      }
    }

    const columns = Array.from(
      { length: columnCount },
      () => [] as ReactNode[]
    );

    // Round-robin distribution for balanced layout
    allChildren.forEach((child, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(child);
    });

    return columns;
  }, [children, columnCount, isLoading, hasMore, createSkeletonCards]);

  // Calculate mobile-optimized gap
  const mobileGap = useMemo(() => {
    if (!deviceInfo.isMobile) return gap;
    return Math.max(gap, 2);
  }, [gap, deviceInfo.isMobile]);

  // Loading skeleton optimized for mobile
  if (!isHydrated) {
    return (
      <div className={`w-full overflow-auto ${className}`}>
        <div
          className="flex animate-pulse"
          style={{ gap: `${mobileGap}px`, padding: `0 ${mobileGap / 2}px` }}
        >
          {Array.from({ length: deviceInfo.isMobile ? 1 : 2 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col"
              style={{ gap: `${mobileGap}px` }}
            >
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
    <div className={`w-full overflow-auto relative ${className}`}>

      {/* Pull-to-refresh indicator */}
      {enablePullToRefresh && (pullDistance > 0 || isRefreshing) && (
        <div
          className="flex justify-center items-center transition-transform duration-200 ease-out"
          style={{
            transform: `translateY(${Math.min(pullDistance - 50, 0)}px)`,
            height: Math.max(0, pullDistance - 50),
            opacity: pullDistance > 50 ? 1 : pullDistance / 50,
          }}
        >
          <div
            className={`${isRefreshing ? "animate-spin" : ""} rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent`}
          >
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
          minHeight: deviceInfo.isMobile ? "100vh" : "auto",
        }}
      >
        {distributedColumns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className="flex-1 flex flex-col"
            style={{
              gap: `${mobileGap}px`,
              minWidth: deviceInfo.isMobile ? "0" : `${minColumnWidth}px`,
            }}
          >
            {column}
          </div>
        ))}
      </div>

      {/* Bouncing Load More Arrow */}
      {showLoadMoreArrow && hasMore && isOnline && !isLoading && (
        <div className="fixed bottom-6 right-0 z-50">
          <button
            onClick={scrollToLoadMore}
            className={`
              bg-[var(--background)] text-[var(--foreground)] rounded-full shadow-lg cursor-pointer border border-[var(--accent)]
              transition-all duration-300 ease-in-out transform hover:scale-90
              ${deviceInfo.preferReducedMotion ? "" : "animate-bounce"}
              ${deviceInfo.isMobile ? "p-1" : "p-2"}
            `}
            style={{
              animationDuration: deviceInfo.preferReducedMotion ? "0s" : "1s",
            }}
            aria-label="Load more items"
          >
            <ArrowDown />
          </button>
        </div>
      )}

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
              <MdWarning />
              <span className="text-sm">
                {"You're offline. Check your connection."}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && totalItems !== undefined && totalItems > 0 && (
        <div className="text-center py-8 opacity-60">
          <div className={`${deviceInfo.isMobile ? "px-6" : ""}`}>
            <p className={`${deviceInfo.isMobile ? "text-base" : "text-sm"}`}>
              {customMessage
                ? customMessage
                : `Showing all ${totalItems} item${totalItems !== 1 ? "s" : ""}`}
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
