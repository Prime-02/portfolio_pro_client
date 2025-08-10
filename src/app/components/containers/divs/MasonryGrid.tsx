import React, {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import ImageCard, { ImageCardProps } from "../cards/ImageCard";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";

export type DistributionStrategy =
  | "center-out"
  | "left-to-right"
  | "right-to-left"
  | "balanced"
  | "random";
export type AlignItems = "start" | "center" | "end" | "stretch" | "baseline";
export type JustifyContent =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

export interface ResponsiveColumns {
  base?: number; // < 640px
  sm?: number; // >= 640px
  md?: number; // >= 768px
  lg?: number; // >= 1024px
  xl?: number; // >= 1280px
  "2xl"?: number; // >= 1536px
}

export interface DataMapping {
  imageUrl: string;
  title?: string;
  description?: string;
  id?: string;
  // Allow for additional custom field mappings
  [key: string]: string | undefined;
}

export interface PaginationConfig {
  page?: number;
  size?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  totalPages?: number;
  totalItems?: number;
}

export interface MasonryGridProps {
  // Data & API
  dataUrl?: string;
  accessToken?: string;
  queryParams?: Record<string, any>;
  dataPath?: string;
  dataMapping: DataMapping;
  staticData?: any[];

  // Pagination
  enablePagination?: boolean;
  paginationConfig?: PaginationConfig;
  onPaginationChange?: (page: number) => void;
  infiniteScroll?: boolean;
  infiniteScrollThreshold?: number; // Distance from bottom to trigger load (in pixels)
  maxPageGap?: number; // Maximum number of pages to keep in memory before removing old ones (default: 5)

  // Layout & Structure
  children?: ReactNode;
  className?: string;
  gap?: number | { x?: number; y?: number };
  padding?:
    | number
    | {
        x?: number;
        y?: number;
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
      };
  columns?: number | ResponsiveColumns;
  minColumnWidth?: number;
  maxColumns?: number;
  distributionStrategy?: DistributionStrategy;
  balanceHeights?: boolean;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
  columnAlignment?: AlignItems;

  // Animation & Transitions
  animated?: boolean;
  animationDuration?: number;
  staggerDelay?: number;
  fadeIn?: boolean;
  slideIn?: "top" | "bottom" | "left" | "right" | false;

  // Performance
  virtualized?: boolean;
  overscan?: number;

  // Loading & Error States
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  emptyStateComponent?: ReactNode;

  // ImageCard Props
  imageCardProps?: Partial<ImageCardProps>;

  // Custom styling
  containerStyle?: React.CSSProperties;
  columnStyle?: React.CSSProperties;
  columnClassName?: string;

  // Callbacks
  onColumnCountChange?: (count: number) => void;
  onResize?: (dimensions: { width: number; height: number }) => void;
  onDataLoad?: (data: any[]) => void;
  onError?: (error: any) => void;
  onItemClick?: (item: any, index: number, event: React.MouseEvent) => void;

  // Data transformation
  transformData?: (rawData: any[]) => any[];
}

const MasonryGrid = ({
  dataUrl,
  accessToken,
  queryParams = {},
  dataPath = "",
  dataMapping,
  staticData,
  enablePagination = false,
  paginationConfig = {},
  onPaginationChange,
  infiniteScroll = false,
  infiniteScrollThreshold = 100,
  maxPageGap = 5,
  children,
  className = "",
  gap = 16,
  padding = 0,
  columns = { base: 1, sm: 2, md: 3, xl: 4 },
  minColumnWidth,
  maxColumns = 6,
  distributionStrategy = "center-out",
  balanceHeights = false,
  alignItems = "stretch",
  justifyContent = "start",
  columnAlignment = "stretch",
  animated = false,
  animationDuration = 300,
  staggerDelay = 50,
  fadeIn = false,
  slideIn = false,
  virtualized = false,
  overscan = 5,
  loadingComponent,
  errorComponent,
  emptyStateComponent,
  imageCardProps = {},
  containerStyle = {},
  columnStyle = {},
  columnClassName = "",
  onColumnCountChange,
  onResize,
  onDataLoad,
  onError,
  onItemClick,
  transformData,
}: MasonryGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(1);
  const [isVisible, setIsVisible] = useState(!fadeIn);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(paginationConfig.page || 1);
  const [pagination, setPagination] =
    useState<PaginationConfig>(paginationConfig);

  // Track if we're fetching more data for infinite scroll
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isFetchingPrevious, setIsFetchingPrevious] = useState(false);

  // Track the range of pages we've loaded for bidirectional scroll
  const [loadedPageRange, setLoadedPageRange] = useState({ min: 1, max: 1 });

  // Track individual page data for memory management
  const [pageDataMap, setPageDataMap] = useState<Map<number, any[]>>(new Map());

  // Track when we should temporarily disable observers
  const [observersDisabled, setObserversDisabled] = useState(false);
  const observerTimeoutRef = useRef<NodeJS.Timeout>();

  const getNestedValue = useCallback((obj: any, path: string): any => {
    if (!path) return obj;
    return path.split(".").reduce((current, key) => {
      return current && typeof current === "object" ? current[key] : undefined;
    }, obj);
  }, []);

  const extractDataFromResponse = useCallback(
    (responseData: any): any[] => {
      if (!responseData) return [];
      if (!dataPath) {
        if (Array.isArray(responseData)) return responseData;
        if (responseData.data && Array.isArray(responseData.data))
          return responseData.data;
        if (responseData.results && Array.isArray(responseData.results))
          return responseData.results;
        if (responseData.items && Array.isArray(responseData.items))
          return responseData.items;
        return [];
      }
      const extractedData = getNestedValue(responseData, dataPath);
      return Array.isArray(extractedData) ? extractedData : [];
    },
    [dataPath, getNestedValue]
  );

  const extractPaginationInfo = useCallback(
    (responseData: any, page: number): PaginationConfig => {
      if (!enablePagination) return {};
      const defaultLimit = paginationConfig.size || 20;
      let paginationInfo: PaginationConfig = { ...paginationConfig };

      if (responseData?.pagination) {
        paginationInfo = { ...paginationInfo, ...responseData.pagination };
      } else if (responseData?.total !== undefined) {
        const totalPages = Math.ceil(responseData.total / defaultLimit);
        paginationInfo = {
          ...paginationInfo,
          totalItems: responseData.total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          page,
        };
      } else if (responseData?.meta) {
        const meta = responseData.meta;
        paginationInfo = {
          ...paginationInfo,
          totalItems: meta.total || meta.totalCount,
          totalPages: meta.totalPages || meta.lastPage,
          hasNextPage:
            meta.hasNextPage || page < (meta.totalPages || meta.lastPage),
          hasPrevPage: meta.hasPrevPage || page > 1,
          page: meta.currentPage || page,
        };
      } else {
        const dataArray = extractDataFromResponse(responseData);
        paginationInfo = {
          ...paginationInfo,
          hasNextPage: dataArray.length === defaultLimit,
          hasPrevPage: page > 1,
          page,
        };
      }
      return paginationInfo;
    },
    [enablePagination, paginationConfig, extractDataFromResponse]
  );

  const memoizedColumns = useMemo(
    () => columns,
    [typeof columns === "number" ? columns : JSON.stringify(columns)]
  );

  const gapValues = useMemo(() => {
    if (typeof gap === "number") return { x: gap, y: gap };
    return { x: gap.x || 16, y: gap.y || 16 };
  }, [gap]);

  const paddingValues = useMemo(() => {
    if (typeof padding === "number") {
      return { top: padding, bottom: padding, left: padding, right: padding };
    }
    if (typeof padding === "object" && "x" in padding) {
      return {
        top: padding.y || 0,
        bottom: padding.y || 0,
        left: padding.x || 0,
        right: padding.x || 0,
      };
    }
    return {
      top: padding.top || 0,
      bottom: padding.bottom || 0,
      left: padding.left || 0,
      right: padding.right || 0,
    };
  }, [padding]);

  const getColumnCount = useCallback(() => {
    if (!containerRef.current) return 1;
    const width = containerRef.current.offsetWidth;
    const availableWidth = width - paddingValues.left - paddingValues.right;

    if (minColumnWidth) {
      const calculatedColumns = Math.floor(
        availableWidth / (minColumnWidth + gapValues.x)
      );
      return Math.min(Math.max(calculatedColumns, 1), maxColumns);
    }

    if (typeof memoizedColumns === "number") return memoizedColumns;

    if (width >= 1536)
      return (
        memoizedColumns["2xl"] ||
        memoizedColumns.xl ||
        memoizedColumns.lg ||
        memoizedColumns.md ||
        memoizedColumns.sm ||
        memoizedColumns.base ||
        1
      );
    if (width >= 1280)
      return (
        memoizedColumns.xl ||
        memoizedColumns.lg ||
        memoizedColumns.md ||
        memoizedColumns.sm ||
        memoizedColumns.base ||
        1
      );
    if (width >= 1024)
      return (
        memoizedColumns.lg ||
        memoizedColumns.md ||
        memoizedColumns.sm ||
        memoizedColumns.base ||
        1
      );
    if (width >= 768)
      return (
        memoizedColumns.md || memoizedColumns.sm || memoizedColumns.base || 1
      );
    if (width >= 640) return memoizedColumns.sm || memoizedColumns.base || 1;
    return memoizedColumns.base || 1;
  }, [
    minColumnWidth,
    maxColumns,
    gapValues.x,
    paddingValues.left,
    paddingValues.right,
    memoizedColumns,
  ]);

  // Stable query params to prevent unnecessary re-fetches
  const stableQueryParams = useMemo(
    () => queryParams,
    [JSON.stringify(queryParams)]
  );

  const fetchData = useCallback(
    async (page = 1, append = false, prepend = false) => {
      if (!dataUrl && !staticData) return;

      // Prevent multiple concurrent requests
      if (append) {
        if (isFetchingMore) return;
        setIsFetchingMore(true);
        setObserversDisabled(true); // Disable observers during fetch
      } else if (prepend) {
        if (isFetchingPrevious) return;
        setIsFetchingPrevious(true);
        setObserversDisabled(true); // Disable observers during fetch
      } else {
        setLoading(true);
        setObserversDisabled(true); // Disable observers during fetch
      }

      setError(null);

      try {
        let result: any[] = [];
        let responseData: any = null;

        if (staticData) {
          result = Array.isArray(staticData) ? staticData : [staticData];
        } else if (dataUrl) {
          const params = {
            ...stableQueryParams,
            ...(enablePagination && {
              page: page.toString(),
              limit: (paginationConfig.size || 20).toString(),
            }),
          };

          responseData = await GetAllData({
            access: accessToken,
            url: dataUrl,
            type: "gallery_data",
            data: Object.keys(params).length > 0 ? params : undefined,
          });

          if (responseData) {
            result = extractDataFromResponse(responseData);
            const paginationInfo = extractPaginationInfo(responseData, page);
            setPagination(paginationInfo);
          }
        }

        if (transformData && typeof transformData === "function") {
          result = transformData(result);
        }

        if (!Array.isArray(result)) {
          console.warn(
            "Data transformation did not return an array, wrapping in array"
          );
          result = [result];
        }

        // Store page data in map for memory management
        setPageDataMap((prevMap) => {
          const newMap = new Map(prevMap);
          newMap.set(page, result);
          return newMap;
        });

        // Update loaded page range
        setLoadedPageRange((prevRange) => {
          const newRange = {
            min: prepend ? Math.min(prevRange.min, page) : prevRange.min,
            max: append ? Math.max(prevRange.max, page) : prevRange.max,
          };

          // If not appending or prepending, reset range to current page
          if (!append && !prepend) {
            newRange.min = page;
            newRange.max = page;
          }

          return newRange;
        });

        // Use functional state update to manage data with memory constraints
        setData((prevData) => {
          let newData;

          if (prepend || append) {
            // For infinite scroll, manage memory by removing distant pages
            setPageDataMap((currentMap) => {
              const updatedMap = new Map(currentMap);
              const currentRange = prepend
                ? {
                    min: Math.min(loadedPageRange.min, page),
                    max: loadedPageRange.max,
                  }
                : {
                    min: loadedPageRange.min,
                    max: Math.max(loadedPageRange.max, page),
                  };

              const pageSpan = currentRange.max - currentRange.min + 1;

              // If we exceed maxPageGap, remove the farthest pages
              if (pageSpan > maxPageGap) {
                if (prepend) {
                  // Remove pages from the end when prepending
                  const pagesToRemove = pageSpan - maxPageGap;
                  for (let i = 0; i < pagesToRemove; i++) {
                    const pageToRemove = currentRange.max - i;
                    updatedMap.delete(pageToRemove);
                  }
                  // Update the range
                  setLoadedPageRange((prev) => ({
                    ...prev,
                    max: prev.max - pagesToRemove,
                  }));
                } else {
                  // Remove pages from the beginning when appending
                  const pagesToRemove = pageSpan - maxPageGap;
                  for (let i = 0; i < pagesToRemove; i++) {
                    const pageToRemove = currentRange.min + i;
                    updatedMap.delete(pageToRemove);
                  }
                  // Update the range
                  setLoadedPageRange((prev) => ({
                    ...prev,
                    min: prev.min + pagesToRemove,
                  }));
                }
              }

              return updatedMap;
            });

            // Reconstruct data from page map
            setPageDataMap((currentMap) => {
              const sortedPages = Array.from(currentMap.keys()).sort(
                (a, b) => a - b
              );
              newData = sortedPages.reduce((acc, pageNum) => {
                const pageData = currentMap.get(pageNum) || [];
                return [...acc, ...pageData];
              }, [] as any[]);

              onDataLoad?.(newData);
              return currentMap;
            });

            return newData || prevData;
          } else {
            // For initial load or non-infinite scroll, replace data
            newData = result;
            // Clear page map for fresh start
            setPageDataMap(new Map([[page, result]]));
            onDataLoad?.(newData);
            return newData;
          }
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
        onError?.(err);
      } finally {
        // Re-enable observers after a delay to allow DOM to settle
        const enableObserversAfterDelay = () => {
          if (observerTimeoutRef.current) {
            clearTimeout(observerTimeoutRef.current);
          }
          observerTimeoutRef.current = setTimeout(() => {
            setObserversDisabled(false);
          }, 300); // 300ms delay to let DOM settle
        };

        if (append) {
          setIsFetchingMore(false);
          enableObserversAfterDelay();
        } else if (prepend) {
          setIsFetchingPrevious(false);
          enableObserversAfterDelay();
        } else {
          setLoading(false);
          enableObserversAfterDelay();
        }
      }
    },
    [
      dataUrl,
      staticData,
      accessToken,
      transformData,
      extractDataFromResponse,
      extractPaginationInfo,
      onDataLoad,
      onError,
      enablePagination,
      paginationConfig.size,
      stableQueryParams,
      isFetchingMore,
      isFetchingPrevious,
      maxPageGap,
      loadedPageRange,
    ]
  );

  // Reset current page when queryParams change
  useEffect(() => {
    setCurrentPage(1);
    setData([]); // Clear existing data when params change
    setLoadedPageRange({ min: 1, max: 1 });
    setPageDataMap(new Map()); // Clear page data map
  }, [JSON.stringify(stableQueryParams)]);

  // Initial data fetch
  useEffect(() => {
    if (staticData) {
      // Handle static data immediately
      fetchData(1, false);
      return;
    }

    if (!accessToken || !dataUrl) return;

    // Only fetch if we don't have data or if currentPage changed
    fetchData(currentPage, false);
  }, [accessToken, dataUrl, currentPage]);

  const handlePageChange = useCallback(
    (page: number, direction: "next" | "prev" | "initial" = "initial") => {
      // Prevent duplicate page changes
      if (
        page === currentPage ||
        (direction === "next" && page > currentPage && isFetchingMore) ||
        (direction === "prev" && page < currentPage && isFetchingPrevious)
      ) {
        return;
      }

      setCurrentPage(page);
      onPaginationChange?.(page);

      if (infiniteScroll) {
        if (direction === "next") {
          fetchData(page, true, false);
        } else if (direction === "prev") {
          fetchData(page, false, true);
        } else {
          fetchData(page, false, false);
        }
      } else {
        fetchData(page, false, false);
      }
    },
    [
      currentPage,
      onPaginationChange,
      infiniteScroll,
      fetchData,
      isFetchingMore,
      isFetchingPrevious,
    ]
  );

  // Intersection Observer for infinite scroll - bidirectional
  useEffect(() => {
    if (!infiniteScroll || !enablePagination) return;

    const observers: IntersectionObserver[] = [];

    // Bottom sentinel for loading next pages
    if (sentinelRef.current) {
      const bottomObserver = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;

          if (
            entry.isIntersecting &&
            !isFetchingMore &&
            !loading &&
            pagination.hasNextPage &&
            data.length > 0 &&
            loadedPageRange.max < (pagination.totalPages || Infinity)
          ) {
            console.log(
              "Bottom sentinel in view, loading next page:",
              loadedPageRange.max + 1
            );
            handlePageChange(loadedPageRange.max + 1, "next");
          }
        },
        {
          root: null,
          rootMargin: `0px 0px ${infiniteScrollThreshold}px 0px`,
          threshold: 0.1,
        }
      );

      bottomObserver.observe(sentinelRef.current);
      observers.push(bottomObserver);
    }

    // Top sentinel for loading previous pages
    if (topSentinelRef.current) {
      const topObserver = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;

          if (
            entry.isIntersecting &&
            !isFetchingPrevious &&
            !loading &&
            pagination.hasPrevPage &&
            data.length > 0 &&
            loadedPageRange.min > 1
          ) {
            console.log(
              "Top sentinel in view, loading previous page:",
              loadedPageRange.min - 1
            );
            handlePageChange(loadedPageRange.min - 1, "prev");
          }
        },
        {
          root: null,
          rootMargin: `${infiniteScrollThreshold}px 0px 0px 0px`,
          threshold: 0.1,
        }
      );

      topObserver.observe(topSentinelRef.current);
      observers.push(topObserver);
    }

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [
    infiniteScroll,
    enablePagination,
    isFetchingMore,
    isFetchingPrevious,
    loading,
    pagination.hasNextPage,
    pagination.hasPrevPage,
    pagination.totalPages,
    handlePageChange,
    infiniteScrollThreshold,
    data.length,
    loadedPageRange,
  ]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        if (!containerRef.current) return;

        const newColumnCount = getColumnCount();
        const rect = containerRef.current.getBoundingClientRect();
        const newDimensions = { width: rect.width, height: rect.height };

        setColumnCount(newColumnCount);
        setDimensions(newDimensions);

        onColumnCountChange?.(newColumnCount);
        onResize?.(newDimensions);
      }, 150);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [getColumnCount, onColumnCountChange, onResize]);

  useEffect(() => {
    if (fadeIn && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [fadeIn, isVisible]);

  const getDistributionOrder = useCallback(
    (columnCount: number): number[] => {
      switch (distributionStrategy) {
        case "left-to-right":
          return Array.from({ length: columnCount }, (_, i) => i);
        case "right-to-left":
          return Array.from(
            { length: columnCount },
            (_, i) => columnCount - 1 - i
          );
        case "center-out":
          const center = Math.floor(columnCount / 2);
          const order: number[] = [];
          if (columnCount === 1) return [0];
          if (columnCount === 2) return [0, 1];
          order.push(center);
          for (let i = 1; i <= center; i++) {
            if (center + i < columnCount) order.push(center + i);
            if (center - i >= 0) order.push(center - i);
          }
          return order;
        case "random":
          const indices = Array.from({ length: columnCount }, (_, i) => i);
          for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
          }
          return indices;
        case "balanced":
        default:
          return Array.from({ length: columnCount }, (_, i) => i);
      }
    },
    [distributionStrategy]
  );

  const mapDataToImageCardProps = useCallback(
    (
      item: any,
      index: number
    ): ImageCardProps & { "data-album-id"?: string } => {
      const getFieldValue = (
        fieldMapping: string | undefined,
        fallback?: any
      ) => {
        if (!fieldMapping) return fallback;
        return getNestedValue(item, fieldMapping) || fallback;
      };

      const itemId = getFieldValue(dataMapping.id);

      return {
        image_url: getFieldValue(dataMapping.imageUrl),
        title: getFieldValue(dataMapping.title),
        description: getFieldValue(dataMapping.description),
        imageAlt: getFieldValue(dataMapping.title) || "Image",
        aspectRatio: "auto",
        size: "md",
        onClick: (e: React.MouseEvent) => {
          if (imageCardProps?.onClick) {
            imageCardProps.onClick(e);
          }
          if (onItemClick) {
            onItemClick(item, index, e);
          }
        },
        "data-album-id": itemId,
        ...Object.entries(dataMapping).reduce(
          (acc, [key, fieldName]) => {
            if (
              !["imageUrl", "title", "description", "id"].includes(key) &&
              fieldName
            ) {
              acc[key] = getFieldValue(fieldName);
            }
            return acc;
          },
          {} as Record<string, any>
        ),
        ...imageCardProps,
      };
    },
    [dataMapping, imageCardProps, onItemClick, getNestedValue]
  );

  const createColumns = useMemo(() => {
    const dataToUse =
      data.length > 0 ? data : children ? React.Children.toArray(children) : [];

    const columns = Array.from(
      { length: columnCount },
      () => [] as ReactNode[]
    );
    const columnHeights = new Array(columnCount).fill(0);
    const distributionOrder = getDistributionOrder(columnCount);

    if (distributionStrategy === "balanced" && balanceHeights) {
      dataToUse.forEach((item, index) => {
        const shortestColumnIndex = columnHeights.indexOf(
          Math.min(...columnHeights)
        );

        if (data.length > 0) {
          const imageCardProps = mapDataToImageCardProps(item, index);
          const itemId = getNestedValue(item, dataMapping.id || "id") || index;
          columns[shortestColumnIndex].push(
            <ImageCard key={itemId} {...imageCardProps} />
          );
        } else {
          columns[shortestColumnIndex].push(item);
        }

        columnHeights[shortestColumnIndex] += 1;
      });
    } else {
      dataToUse.forEach((item, index) => {
        const columnIndex = distributionOrder[index % distributionOrder.length];

        if (data.length > 0) {
          const imageCardProps = mapDataToImageCardProps(item, index);
          const itemId = getNestedValue(item, dataMapping.id || "id") || index;
          columns[columnIndex].push(
            <ImageCard key={itemId} {...imageCardProps} />
          );
        } else {
          columns[columnIndex].push(item);
        }
      });
    }

    return columns;
  }, [
    data,
    children,
    columnCount,
    distributionStrategy,
    balanceHeights,
    getDistributionOrder,
    mapDataToImageCardProps,
    getNestedValue,
    dataMapping,
  ]);

  const alignItemsClass = useMemo(() => {
    switch (alignItems) {
      case "start":
        return "items-start";
      case "center":
        return "items-center";
      case "end":
        return "items-end";
      case "stretch":
        return "items-stretch";
      case "baseline":
        return "items-baseline";
      default:
        return "items-stretch";
    }
  }, [alignItems]);

  const justifyContentClass = useMemo(() => {
    switch (justifyContent) {
      case "start":
        return "justify-start";
      case "center":
        return "justify-center";
      case "end":
        return "justify-end";
      case "between":
        return "justify-between";
      case "around":
        return "justify-around";
      case "evenly":
        return "justify-evenly";
      default:
        return "justify-start";
    }
  }, [justifyContent]);

  const columnAlignmentClass = useMemo(() => {
    switch (columnAlignment) {
      case "start":
        return "items-start";
      case "center":
        return "items-center";
      case "end":
        return "items-end";
      case "stretch":
        return "items-stretch";
      case "baseline":
        return "items-baseline";
      default:
        return "items-stretch";
    }
  }, [columnAlignment]);

  const containerClasses = useMemo(
    () =>
      `flex ${alignItemsClass} ${justifyContentClass} w-full h-full ${className}`,
    [alignItemsClass, justifyContentClass, className]
  );

  const animationStyles = useMemo(() => {
    const baseStyles: React.CSSProperties = {};

    if (animated || fadeIn) {
      baseStyles.transition = `all ${animationDuration}ms ease-in-out`;
    }

    if (fadeIn) {
      baseStyles.opacity = isVisible ? 1 : 0;
    }

    if (slideIn && isVisible) {
      const transforms: Record<string, string> = {
        top: "translateY(-20px)",
        bottom: "translateY(20px)",
        left: "translateX(-20px)",
        right: "translateX(20px)",
      };

      if (!isVisible) {
        baseStyles.transform = transforms[slideIn] || "translateY(-20px)";
      }
    }

    return baseStyles;
  }, [animated, fadeIn, animationDuration, isVisible, slideIn]);

  if (loading && !data.length) {
    return (
      loadingComponent || (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      )
    );
  }

  if (error && !data.length) {
    return (
      errorComponent || (
        <div className="flex justify-center items-center py-8 text-red-500">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">Error loading data</div>
            <div className="text-sm opacity-80">{error.message}</div>
          </div>
        </div>
      )
    );
  }

  if (!data.length && !children) {
    return (
      emptyStateComponent || (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">No items found</div>
            <div className="text-sm opacity-80">
              There are no items to display
            </div>
          </div>
        </div>
      )
    );
  }

  return (
    <div className="relative">
      {/* Top Infinite Scroll Sentinel */}
      {infiniteScroll && enablePagination && loadedPageRange.min > 1 && (
        <div
          ref={topSentinelRef}
          className="w-full flex justify-center py-4"
          style={{ minHeight: "20px" }}
        >
          {isFetchingPrevious && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className={containerClasses}
        style={{
          gap: `${gapValues.x}px`,
          padding: `${paddingValues.top}px ${paddingValues.right}px ${paddingValues.bottom}px ${paddingValues.left}px`,
          ...animationStyles,
          ...containerStyle,
        }}
      >
        {createColumns.map((column, columnIndex) => (
          <div
            key={columnIndex}
            className={`flex-1 flex flex-col ${columnAlignmentClass} ${columnClassName}`}
            style={{
              gap: `${gapValues.y}px`,
              ...(animated && staggerDelay
                ? {
                    animationDelay: `${columnIndex * staggerDelay}ms`,
                  }
                : {}),
              ...columnStyle,
            }}
          >
            {column}
          </div>
        ))}
      </div>

      {/* Bottom Infinite Scroll Sentinel */}
      {infiniteScroll && enablePagination && pagination.hasNextPage && (
        <div
          ref={sentinelRef}
          className="w-full flex justify-center py-4"
          style={{ minHeight: "20px" }}
        >
          {isFetchingMore && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
          )}
        </div>
      )}

      {/* Loading indicator when loading more items */}
      {loading && data.length > 0 && !infiniteScroll && (
        <div className="w-full flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;
