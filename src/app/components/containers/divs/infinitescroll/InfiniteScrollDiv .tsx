"use client";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import SimpleBarCore from "simplebar-core";
import { toast } from "@/app/components/toastify/Toastify";
import { PortfoliosResponseData } from "@/app/components/types and interfaces/ProjectsAndPortfolios";

export interface ResponseData {
  [key: string]: string; // Or a more specific type if you know the structure
}

interface InfiniteScrollData {
  data: object[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  refetch: () => void;
}

interface InfiniteScrollProps {
  baseUrl: string;
  skipParam?: string;
  limitParam?: string;
  initialLimit?: number;
  threshold?: number;
  children: (props: InfiniteScrollData) => ReactNode;
  headers?: Record<string, string>;
  timeout?: number;
}

const InfiniteScrollDiv: React.FC<InfiniteScrollProps> = ({
  baseUrl,
  skipParam = "skip",
  limitParam = "limit",
  initialLimit = 20,
  threshold = 100,
  children,
  headers = {},
  timeout = 8000,
}) => {
  const [data, setData] = useState<object[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState<number>(0);
  const scrollRef = useRef<SimpleBarCore | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialMount = useRef<boolean>(true);
  const { loader, accentColor } = useTheme();
  const LoaderComponent = getLoader(loader);

  const constructUrl = useCallback(
    (skipValue: number, limitValue: number): string => {
      try {
        const url = new URL(baseUrl);
        url.searchParams.set(skipParam, skipValue.toString());
        url.searchParams.set(limitParam, limitValue.toString());
        return url.toString();
      } catch (err: unknown) {
        toast.error(`Invalid base URL: ${baseUrl}`);
        throw err; // Re-throw the original error
      }
    },
    [baseUrl, skipParam, limitParam]
  );

  const fetchData = useCallback(
    async (skipValue: number, isInitial: boolean = false): Promise<void> => {
      // Prevent multiple simultaneous requests
      if (loading && !isInitial) return;

      // Don't fetch if no more data available
      if (!hasMore && !isInitial) return;

      // Abort previous request if it exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      setLoading(true);
      if (isInitial) {
        setError(null);
      }

      try {
        const url = constructUrl(skipValue, initialLimit);

        const responseData = await GetAllData({
          access: "",
          url: url,
          type: "Portfolio Data",
        });
        console.log("URL: ", url);
        clearTimeout(timeoutId);

        // Since GetAllData returns response.data, responseData is already the parsed data
        // No need to check content-type or parse JSON

        if (!responseData) {
          throw new Error("No data received from server");
        }

        // Handle different response structures
        const items: PortfoliosResponseData = Array.isArray(responseData)
          ? responseData
          : [];

        if (items.length === 0) {
          setHasMore(false);
        } else {
          setData((prevData) => (isInitial ? items : [...prevData, ...items]));
          setSkip(skipValue + items.length);

          // Check if we received fewer items than requested (end of data)
          if (items.length < initialLimit) {
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [constructUrl, initialLimit, headers, timeout]
  );

  // Refetch function
  const refetch = useCallback(() => {
    setData([]);
    setSkip(0);
    setHasMore(true);
    setError(null);
    fetchData(0, true);
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    if (isInitialMount.current && baseUrl) {
      fetchData(0, true);
      isInitialMount.current = false;
    }
  }, [baseUrl, fetchData]);

  // Reset data when baseUrl changes (but not on initial mount)
  useEffect(() => {
    if (!isInitialMount.current) {
      setData([]);
      setSkip(0);
      setHasMore(true);
      setError(null);
      fetchData(0, true);
    }
  }, [baseUrl]);

  // Scroll handler with debouncing
  const handleScroll = useCallback((): void => {
    if (!scrollRef.current) {
      console.log("No scroll ref");
      return;
    }

    // Get the SimpleBar's scroll element
    const scrollElement = scrollRef.current.getScrollElement();
    if (!scrollElement) {
      console.log("No scroll element");
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = scrollElement;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    console.log("Scroll values:", {
      scrollTop,
      scrollHeight,
      clientHeight,
      scrollBottom,
      threshold,
      loading,
      hasMore,
      error,
    });

    if (scrollBottom <= threshold && !loading && hasMore && !error) {
      console.log("Triggering fetch...");
      fetchData(skip);
    }
  }, [threshold, skip, loading, hasMore, error, fetchData]);

  useEffect(() => {
    console.log("ScrollRef current:", scrollRef.current);
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.getScrollElement();
      if (scrollElement) {
        console.log("Element height:", scrollElement.scrollHeight);
        console.log("Client height:", scrollElement.clientHeight);
        console.log(
          "Has scroll:",
          scrollElement.scrollHeight > scrollElement.clientHeight
        );
      }
    }
  }, [data]); // Check when data changes

  // Attach scroll listener with proper cleanup
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.getScrollElement();
      if (scrollElement) {
        scrollElement.addEventListener("scroll", handleScroll, {
          passive: true,
        });
        return () => scrollElement.removeEventListener("scroll", handleScroll);
      }
    }
  }, [handleScroll]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <SimpleBar
      ref={scrollRef}
      className="h-full overflow-y-auto"
      style={{
        height: "600px",
      }}
    >
      {children({
        data,
        loading,
        error,
        hasMore,
        refetch,
      })}

      {loading && LoaderComponent && (
        <div className="flex justify-center items-center py-4">
          <LoaderComponent color={accentColor.color} />
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-4">
          <div className="mb-2">{error}</div>
          <button
            onClick={() => fetchData(skip)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !hasMore && data.length > 0 && (
        <div className="text-gray-500 text-center py-4">
          No more data to load
        </div>
      )}

      {!loading && !hasMore && data.length === 0 && !error && (
        <div className="text-gray-500 text-center py-4">No data available</div>
      )}
    </SimpleBar>
  );
};

export default InfiniteScrollDiv;
