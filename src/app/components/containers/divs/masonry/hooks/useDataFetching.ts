// ==================== COMPLETE HOOKS IMPLEMENTATION ====================

// hooks/useDataFetching.ts
import { useState, useCallback, useEffect, useMemo } from 'react';
import { extractDataFromResponse, extractPaginationInfo } from '../utils/dataUtils';
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { PaginationConfig } from '@/app/components/types and interfaces/masonry';

interface UseDataFetchingProps {
  dataUrl?: string;
  accessToken?: string;
  queryParams: Record<string, any>;
  dataPath?: string;
  staticData?: any[];
  enablePagination: boolean;
  paginationConfig: PaginationConfig;
  transformData?: (data: any[]) => any[];
  onDataLoad?: (data: any[]) => void;
  onError?: (error: any) => void;
  maxPageGap: number;
}

export const useDataFetching = ({
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
}: UseDataFetchingProps) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [pagination, setPagination] = useState<PaginationConfig>(paginationConfig);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isFetchingPrevious, setIsFetchingPrevious] = useState(false);
  const [loadedPageRange, setLoadedPageRange] = useState({ min: 1, max: 1 });
  const [pageDataMap, setPageDataMap] = useState<Map<number, any[]>>(new Map());

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
      } else if (prepend) {
        if (isFetchingPrevious) return;
        setIsFetchingPrevious(true);
      } else {
        setLoading(true);
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
            result = extractDataFromResponse(responseData, dataPath);
            const paginationInfo = extractPaginationInfo(responseData, page, paginationConfig.size || 20);
            setPagination(paginationInfo);
          }
        }

        if (transformData && typeof transformData === 'function') {
          result = transformData(result);
        }

        if (!Array.isArray(result)) {
          console.warn('Data transformation did not return an array, wrapping in array');
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
                ? { min: Math.min(loadedPageRange.min, page), max: loadedPageRange.max }
                : { min: loadedPageRange.min, max: Math.max(loadedPageRange.max, page) };

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
                  setLoadedPageRange(prev => ({ ...prev, max: prev.max - pagesToRemove }));
                } else {
                  // Remove pages from the beginning when appending
                  const pagesToRemove = pageSpan - maxPageGap;
                  for (let i = 0; i < pagesToRemove; i++) {
                    const pageToRemove = currentRange.min + i;
                    updatedMap.delete(pageToRemove);
                  }
                  setLoadedPageRange(prev => ({ ...prev, min: prev.min + pagesToRemove }));
                }
              }

              return updatedMap;
            });

            // Reconstruct data from page map
            const sortedPages = Array.from(pageDataMap.keys()).sort((a, b) => a - b);
            newData = sortedPages.reduce((acc, pageNum) => {
              const pageData = pageDataMap.get(pageNum) || [];
              return [...acc, ...pageData];
            }, [] as any[]);

            onDataLoad?.(newData);
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
        console.error('Error fetching data:', err);
        setError(err);
        onError?.(err);
      } finally {
        if (append) {
          setIsFetchingMore(false);
        } else if (prepend) {
          setIsFetchingPrevious(false);
        } else {
          setLoading(false);
        }
      }
    },
    [
      dataUrl,
      staticData,
      accessToken,
      transformData,
      onDataLoad,
      onError,
      enablePagination,
      paginationConfig.size,
      stableQueryParams,
      isFetchingMore,
      isFetchingPrevious,
      maxPageGap,
      loadedPageRange,
      dataPath,
      pageDataMap,
    ]
  );

  // Reset current page when queryParams change
  useEffect(() => {
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

    // Only fetch if we don't have data
    if (data.length === 0) {
      fetchData(1, false);
    }
  }, [accessToken, dataUrl, staticData]);

  return {
    data,
    loading,
    error,
    pagination,
    isFetchingMore,
    isFetchingPrevious,
    loadedPageRange,
    fetchData,
    setData,
    setLoadedPageRange,
    setPageDataMap,
  };
};
