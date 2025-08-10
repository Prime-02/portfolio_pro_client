// components/MasonryGrid.tsx
import React, {
  ReactNode,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

import { getNestedValue } from "../utils/dataUtils";
import { getDistributionOrder } from "../utils/distributionStrategies";
import { useColumnCalculation } from "../hooks/useColumnCalculation";
import { useDataFetching } from "../hooks/useDataFetching";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { InfiniteScrollSentinel } from "./InfiniteScrollSentinel";
import { MasonryColumn } from "./MasonryColumn";
import ImageCard, { ImageCardProps } from "../../../cards/ImageCard";
import {
  DistributionStrategy,
  AlignItems,
  JustifyContent,
  ResponsiveColumns,
  DataMapping,
  PaginationConfig,
} from "@/app/components/types and interfaces/masonry";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { getLoader } from "@/app/components/loaders/Loader";

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
  infiniteScrollThreshold?: number;
  maxPageGap?: number;

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

const MasonryGrid: React.FC<MasonryGridProps> = ({
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
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(1);
  const [isVisible, setIsVisible] = useState(!fadeIn);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [currentPage, setCurrentPage] = useState(paginationConfig.page || 1);

  // Calculate gap and padding values
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

  // Use column calculation hook
  const { getColumnCount } = useColumnCalculation({
    columns,
    minColumnWidth,
    maxColumns,
    containerWidth: dimensions.width,
    gapX: gapValues.x,
    paddingLeft: paddingValues.left,
    paddingRight: paddingValues.right,
  });

  // Use data fetching hook
  const {
    data,
    loading,
    error,
    pagination,
    isFetchingMore,
    isFetchingPrevious,
    loadedPageRange,
    fetchData,
  } = useDataFetching({
    dataUrl,
    accessToken,
    queryParams,
    dataPath,
    staticData,
    enablePagination,
    paginationConfig,
    transformData,
    onDataLoad,
    onError,
    maxPageGap,
  });

  // Handle page changes
  const handlePageChange = useCallback(
    (page: number, direction: "next" | "prev" | "initial" = "initial") => {
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

  // Use infinite scroll hook
  const { sentinelRef, topSentinelRef } = useInfiniteScroll({
    enabled: infiniteScroll,
    enablePagination,
    threshold: infiniteScrollThreshold,
    hasNextPage: pagination.hasNextPage || false,
    hasPrevPage: pagination.hasPrevPage || false,
    loadedPageRange,
    totalPages: pagination.totalPages,
    isFetchingMore,
    isFetchingPrevious,
    loading,
    dataLength: data.length,
    onLoadNext: () => handlePageChange(loadedPageRange.max + 1, "next"),
    onLoadPrevious: () => handlePageChange(loadedPageRange.min - 1, "prev"),
  });

  // Map data to ImageCard props
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
        aspectRatio: imageCardProps.aspectRatio || "auto",
        size: imageCardProps.size || "md",
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
    [dataMapping, imageCardProps, onItemClick]
  );

  // Create columns layout
  const createColumns = useMemo(() => {
    const dataToUse =
      data.length > 0 ? data : children ? React.Children.toArray(children) : [];
    const columns = Array.from(
      { length: columnCount },
      () => [] as ReactNode[]
    );
    const columnHeights = new Array(columnCount).fill(0);
    const distributionOrder = getDistributionOrder(
      columnCount,
      distributionStrategy
    );

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
    mapDataToImageCardProps,
    dataMapping,
  ]);

  // CSS class calculations
  const alignItemsClass = useMemo(() => {
    const classes = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    };
    return classes[alignItems];
  }, [alignItems]);

  const justifyContentClass = useMemo(() => {
    const classes = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    };
    return classes[justifyContent];
  }, [justifyContent]);

  const containerClasses = useMemo(
    () =>
      `flex ${alignItemsClass} ${justifyContentClass} w-full h-full ${className}`,
    [alignItemsClass, justifyContentClass, className]
  );

  // Animation styles
  const animationStyles = useMemo(() => {
    const baseStyles: React.CSSProperties = {};

    if (animated || fadeIn) {
      baseStyles.transition = `all ${animationDuration}ms ease-in-out`;
    }

    if (fadeIn) {
      baseStyles.opacity = isVisible ? 1 : 0;
    }

    if (slideIn && !isVisible) {
      const transforms: Record<string, string> = {
        top: "translateY(-20px)",
        bottom: "translateY(20px)",
        left: "translateX(-20px)",
        right: "translateX(20px)",
      };
      baseStyles.transform = transforms[slideIn] || "translateY(-20px)";
    }

    return baseStyles;
  }, [animated, fadeIn, animationDuration, isVisible, slideIn]);

  // Resize observer effect
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

  // Fade in effect
  useEffect(() => {
    if (fadeIn && !isVisible) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [fadeIn, isVisible]);

  const { loader, accentColor } = useTheme();
  const LoaderComponent = getLoader(loader) || null;

  // Loading state
  if (loading && !data.length) {
    return (
      loadingComponent || (
        <div className="flex justify-center items-center py-8">
          {LoaderComponent ? (
            <LoaderComponent color={accentColor.color} />
          ) : (
            <span>Loading...</span>
          )}
        </div>
      )
    );
  }

  // Error state
  if (error && !data.length) {
    return errorComponent || <ErrorState error={error} />;
  }

  // Empty state
  if (!data.length && !children) {
    return emptyStateComponent || <EmptyState />;
  }

  return (
    <div className="relative">
      {/* Top Infinite Scroll Sentinel */}
      {infiniteScroll && enablePagination && loadedPageRange.min > 1 && (
        <InfiniteScrollSentinel
          ref={topSentinelRef}
          isLoading={isFetchingPrevious}
          position="top"
        />
      )}

      {/* Main Grid Container */}
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
          <MasonryColumn
            key={columnIndex}
            gapY={gapValues.y}
            alignItems={columnAlignment}
            columnClassName={columnClassName}
            columnStyle={columnStyle}
            animated={animated}
            staggerDelay={staggerDelay}
            columnIndex={columnIndex}
          >
            {column}
          </MasonryColumn>
        ))}
      </div>

      {/* Bottom Infinite Scroll Sentinel */}
      {infiniteScroll && enablePagination && pagination.hasNextPage && (
        <InfiniteScrollSentinel
          ref={sentinelRef}
          isLoading={isFetchingMore}
          position="bottom"
        />
      )}

      {/* Loading indicator for regular pagination */}
      {loading && data.length > 0 && !infiniteScroll && (
        <div className="w-full flex justify-center py-4">
          {LoaderComponent ? (
            <LoaderComponent color={accentColor.color} />
          ) : (
            <span>Loading...</span>
          )}
        </div>
      )}
    </div>
  );
};

export default MasonryGrid;
