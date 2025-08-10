// hooks/useColumnCalculation.ts
import { ResponsiveColumns } from '@/app/components/types and interfaces/masonry';
import { useCallback, useMemo } from 'react';

interface UseColumnCalculationProps {
  columns: number | ResponsiveColumns;
  minColumnWidth?: number;
  maxColumns: number;
  containerWidth: number;
  gapX: number;
  paddingLeft: number;
  paddingRight: number;
}

export const useColumnCalculation = ({
  columns,
  minColumnWidth,
  maxColumns,
  containerWidth,
  gapX,
  paddingLeft,
  paddingRight,
}: UseColumnCalculationProps) => {
  const memoizedColumns = useMemo(
    () => columns,
    [typeof columns === "number" ? columns : JSON.stringify(columns)]
  );

  const getColumnCount = useCallback(() => {
    const availableWidth = containerWidth - paddingLeft - paddingRight;

    if (minColumnWidth) {
      const calculatedColumns = Math.floor(
        availableWidth / (minColumnWidth + gapX)
      );
      return Math.min(Math.max(calculatedColumns, 1), maxColumns);
    }

    if (typeof memoizedColumns === "number") return memoizedColumns;

    if (containerWidth >= 1536)
      return memoizedColumns["2xl"] || memoizedColumns.xl || memoizedColumns.lg || 
             memoizedColumns.md || memoizedColumns.sm || memoizedColumns.base || 1;
    if (containerWidth >= 1280)
      return memoizedColumns.xl || memoizedColumns.lg || memoizedColumns.md || 
             memoizedColumns.sm || memoizedColumns.base || 1;
    if (containerWidth >= 1024)
      return memoizedColumns.lg || memoizedColumns.md || memoizedColumns.sm || 
             memoizedColumns.base || 1;
    if (containerWidth >= 768)
      return memoizedColumns.md || memoizedColumns.sm || memoizedColumns.base || 1;
    if (containerWidth >= 640) 
      return memoizedColumns.sm || memoizedColumns.base || 1;
    return memoizedColumns.base || 1;
  }, [
    minColumnWidth,
    maxColumns,
    gapX,
    paddingLeft,
    paddingRight,
    memoizedColumns,
    containerWidth,
  ]);

  return { getColumnCount };
};
