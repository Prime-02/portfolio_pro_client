import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Textinput } from "./Textinput";
import { useTheme } from "../theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import { getColorShade } from "../utilities/syncFunctions/syncs";
import { PostAllData, GetAllData } from "../utilities/asyncFunctions/lib/crud";
import { getLoader } from "../loaders/Loader";
import Button from "../buttons/Buttons";
import { Accent, Theme } from "../types and interfaces/loaderTypes";

interface SearchItem {
  [key: string]: string | number | boolean | null | undefined;
}

// Type for multiple state setters
type StateSetters = {
  [key: string]: (value: string) => void;
};

type DataListProps = {
  url: string;
  onSetValue: (query: string) => void;
  onSelectItem?: (item: SearchItem) => void;
  dataPath?: string; // Path to nested data (e.g., "data.results" or "response.items")
  displayKeys?: string[]; // Keys to display from each item
  valueKeys?: string[]; // Keys to collect values from (fallback to displayKeys if not provided)
  separator?: string; // Separator for multiple keys (default: ", ")
  placeholder?: string;
  minQueryLength?: number; // Minimum query length to trigger search
  debounceDelay?: number; // Debounce delay in milliseconds
  maxResults?: number; // Maximum number of results to show
  noResultsText?: string;
  searchingText?: string;
  // New props for multiple state setting
  stateSetters?: StateSetters; // Object mapping displayKeys to state setters
  multiStateMode?: boolean; // Enable multiple state setting mode
  stateKeyMapping?: { [displayKey: string]: string }; // Map displayKeys to different state keys
  // New props for GET request support
  requestMethod?: "GET" | "POST"; // Request method (default: POST)
  queryParam?: string; // Query parameter name for GET requests (default: 'query')
  additionalParams?: Record<string, number | boolean | null>; // Additional query parameters for GET requests
  labelBgHexIntensity?: number;
  desc?: string;
  maxLength?: number;
};

interface DropdownContentProps {
  isVisible: boolean;
  triggerRect: DOMRect | null;
  searchResult: SearchItem[];
  isSearching: boolean;
  hasSearched: boolean;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  handleItemSelect: (item: SearchItem, index: number) => void;
  formatDisplayText: (item: SearchItem) => string;
  noResultsText: string;
  searchingText: string;
  query: string;
  onSetValue: (value: string) => void;
  setShowDropdown: (show: boolean) => void;
  theme: Theme;
  accentColor: Accent;
  loading: string[];
  onSelectItem?: (item: SearchItem) => void; // Add this line
}

// Dropdown component to be rendered in portal
const DropdownContent: React.FC<DropdownContentProps> = ({
  isVisible,
  triggerRect,
  searchResult,
  isSearching,
  hasSearched,
  selectedIndex,
  setSelectedIndex,
  handleItemSelect,
  formatDisplayText,
  noResultsText,
  searchingText,
  query,
  onSetValue,
  setShowDropdown,
  loading,
  onSelectItem,
}) => {
  const { theme, loader, accentColor } = useTheme();
  const LoaderComponent = getLoader(loader);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate position and check if dropdown should flip
  useEffect(() => {
    if (isVisible && triggerRect && dropdownRef.current) {
      const dropdownHeight = dropdownRef.current.offsetHeight || 300;
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
  }, [isVisible, triggerRect, searchResult, isSearching]);

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !document
          .querySelector("[data-datalist-trigger]")
          ?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isVisible, setShowDropdown, setSelectedIndex]);

  if (!isVisible || !triggerRect) return null;

  const dropdownStyle: React.CSSProperties = {
    position: "fixed",
    left: triggerRect.left,
    width: triggerRect.width,
    minHeight: "128px",
    maxHeight: "300px",
    zIndex: 999999, // Extremely high z-index
    backgroundColor: getColorShade(theme.background, 10),
    ...(position === "top"
      ? { bottom: window.innerHeight - triggerRect.top + 4 }
      : { top: triggerRect.bottom + 4 }),
  };

  // Custom skeleton loading component
  const SkeletonItem = ({ delay = 0 }: { delay?: number }) => {
    const [opacity, setOpacity] = useState(0.3);

    useEffect(() => {
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          setOpacity((prev) => (prev === 0.3 ? 0.7 : 0.3));
        }, 800);

        return () => clearInterval(interval);
      }, delay);

      return () => clearTimeout(timer);
    }, [delay]);

    return (
      <div className="px-4 py-3">
        <div
          className="h-4 rounded-full transition-opacity duration-800 ease-in-out"
          style={{
            backgroundColor: getColorShade(theme.foreground, 15),
            opacity: opacity,
          }}
        />
      </div>
    );
  };

  return (
    <div
      ref={dropdownRef}
      className="rounded-3xl border border-[var(--accent)] shadow-lg"
      style={dropdownStyle}
      data-datalist-portal
    >
      <div
        className="overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        style={{ maxHeight: "300px" }}
        onWheel={(e) => {
          // Prevent scroll from bubbling to parent elements
          e.stopPropagation();
        }}
      >
        {isSearching ? (
          // Loading skeletons
          <div className="py-2">
            {[...Array(3)].map((_, index) => (
              <SkeletonItem key={index} delay={index * 100} />
            ))}
          </div>
        ) : searchResult.length > 0 ? (
          // Search results
          <div className="p-2">
            {searchResult.map((item, index) => (
              <div
                key={index}
                className={`px-4 py-3 cursor-pointer transition-colors duration-200  rounded-lg ${
                  selectedIndex === index
                    ? "bg-[var(--accent)]"
                    : "hover:bg-[var(--accent)]"
                }`}
                style={{
                  backgroundColor:
                    selectedIndex === index ? `${accentColor}20` : undefined,
                }}
                onClick={() => handleItemSelect(item, index)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div
                  className="font-medium text-sm truncate"
                  style={{ color: theme.foreground }}
                  title={formatDisplayText(item)}
                >
                  {formatDisplayText(item)}
                </div>
              </div>
            ))}
          </div>
        ) : hasSearched ? (
          // No results
          <div className="py-8 text-center">
            <div
              className="text-sm opacity-70"
              style={{ color: theme.foreground }}
            >
              {noResultsText}
            </div>
            <Button
              variant="ghost"
              text="Click to add manually"
              className="mx-auto mt-2"
              onClick={() => {
                // Create a manual item object using the query
                const manualItem: SearchItem = {
                  name: query,
                  title: query,
                  label: query,
                  value: query,
                  isManual: true,
                };
                handleItemSelect(manualItem, -1);
              }}
            />
          </div>
        ) : null}

        {/* Loading indicator at bottom */}
        {loading.includes("querring_from_data_list") && (
          <div
            className="px-4 py-2 border-t"
            style={{ borderColor: getColorShade(theme.foreground, 20) }}
          >
            <div className="flex items-center justify-center space-x-2">
              {LoaderComponent && (
                <LoaderComponent size={20} color={accentColor.color} />
              )}
              <span
                className="text-xs opacity-70"
                style={{ color: theme.foreground }}
              >
                {searchingText}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DataList = ({
  url,
  onSetValue,
  onSelectItem,
  dataPath = "",
  displayKeys = ["name", "title", "label"],
  valueKeys, // New prop - will fallback to displayKeys if not provided
  separator = ", ",
  placeholder = "Search...",
  minQueryLength = 2,
  debounceDelay = 300,
  maxResults = 10,
  noResultsText = "No results found",
  searchingText = "Searching...",
  // New props
  stateSetters,
  multiStateMode = false,
  stateKeyMapping,
  // GET request props
  requestMethod = "POST",
  queryParam = "query",
  additionalParams = {},
  labelBgHexIntensity = 0,
  desc,
  maxLength,
}: DataListProps) => {
  const { theme, accentColor } = useTheme();
  const { loading, setLoading } = useGlobalState();
  const [searchResult, setSearchResults] = useState<SearchItem[]>([]);
  const [query, setQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const [isItemSelected, setIsItemSelected] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const inputRef = useRef<HTMLDivElement>(null);

  // Use valueKeys if provided, otherwise fallback to displayKeys
  const effectiveValueKeys = valueKeys || displayKeys;

  // Ensure component is mounted before using portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update trigger position when showing dropdown or on scroll/resize
  useEffect(() => {
    const updateTriggerRect = () => {
      if (inputRef.current) {
        setTriggerRect(inputRef.current.getBoundingClientRect());
      }
    };

    if (showDropdown) {
      updateTriggerRect();

      const handleReposition = () => {
        updateTriggerRect();
      };

      window.addEventListener("scroll", handleReposition, true);
      window.addEventListener("resize", handleReposition);

      return () => {
        window.removeEventListener("scroll", handleReposition, true);
        window.removeEventListener("resize", handleReposition);
      };
    }
  }, [showDropdown]);

  // Debounced search function
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Don't search if an item was just selected
    if (isItemSelected) {
      setIsItemSelected(false);
      return;
    }

    if (query.length >= minQueryLength) {
      debounceRef.current = setTimeout(() => {
        searchKeyWord();
      }, debounceDelay);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
      setHasSearched(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Extract nested data from response
  const extractNestedData = (data: unknown, path: string): SearchItem[] => {
    if (!path) return Array.isArray(data) ? (data as SearchItem[]) : [];

    const keys = path.split(".");
    let result: unknown = data;

    for (const key of keys) {
      if (
        result &&
        typeof result === "object" &&
        result !== null &&
        key in result
      ) {
        result = (result as Record<string, unknown>)[key];
      } else {
        return [];
      }
    }

    return Array.isArray(result) ? (result as SearchItem[]) : [];
  };

  // Get nested property value
  const getNestedValue = (obj: SearchItem, path: string): unknown => {
    const keys = path.split(".");
    let result: unknown = obj;

    for (const key of keys) {
      if (
        result &&
        typeof result === "object" &&
        result !== null &&
        key in result
      ) {
        result = (result as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }

    return result;
  };

  // Format display text from item using specified keys
  const formatDisplayText = (item: SearchItem): string => {
    if (!item || typeof item !== "object") return String(item || "");

    const values = displayKeys
      .map((key) => {
        const value = getNestedValue(item, key);
        return value ? String(value).trim() : "";
      })
      .filter((value) => value.length > 0);

    return values.length > 0
      ? values.join(separator)
      : String(item.id || item.value || "Unknown");
  };

  // New function to format value text using valueKeys
  const formatValueText = (item: SearchItem): string => {
    if (!item || typeof item !== "object") return String(item || "");

    const values = effectiveValueKeys
      .map((key) => {
        const value = getNestedValue(item, key);
        return value ? String(value).trim() : "";
      })
      .filter((value) => value.length > 0);

    return values.length > 0
      ? values.join(separator)
      : String(item.id || item.value || "Unknown");
  };

  // Updated function to set multiple states based on effectiveValueKeys
  const setMultipleStates = (item: SearchItem) => {
    if (!multiStateMode || !stateSetters) return;

    effectiveValueKeys.forEach((valueKey) => {
      const value = getNestedValue(item, valueKey);

      // Use stateKeyMapping if provided, otherwise use valueKey directly
      const stateKey = stateKeyMapping?.[valueKey] || valueKey;

      // Set state if setter exists for this key
      if (stateSetters[stateKey] && value !== undefined && value !== null) {
        stateSetters[stateKey](String(value));
      }
    });
  };

  // Function to build query URL for GET requests
  const buildQueryUrl = (baseUrl: string, searchQuery: string): string => {
    const url = new URL(baseUrl, window.location.origin);

    // Add the main query parameter
    url.searchParams.set(queryParam, searchQuery);

    // Add additional parameters
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    // Add maxResults as limit if specified
    if (maxResults) {
      url.searchParams.set("limit", String(maxResults));
    }

    return url.toString();
  };

  const searchKeyWord = async () => {
    if (query.length < minQueryLength) return;

    setIsSearching(true);
    setLoading("querring_from_data_list");

    // Update trigger position before showing dropdown
    if (inputRef.current) {
      setTriggerRect(inputRef.current.getBoundingClientRect());
    }
    setShowDropdown(true);

    try {
      let queryRes;

      if (requestMethod === "GET") {
        // Use GetAllData for GET requests with query building
        const queryUrl = buildQueryUrl(url, query);
        queryRes = await GetAllData({
          url: queryUrl,
          type: "Skill Suggestion",
        });
      } else {
        // Use PostAllData for POST requests (backward compatibility)
        queryRes = await PostAllData({
          access: undefined,
          data: {
            [queryParam]: query,
            ...additionalParams,
            ...(maxResults && { limit: maxResults }),
          },
          url: url,
        });
      }

      if (queryRes) {
        const extractedData = extractNestedData(queryRes, dataPath);
        const limitedResults =
          requestMethod === "GET" && maxResults
            ? extractedData.slice(0, maxResults) // Apply client-side limit for GET if not handled by server
            : extractedData;
        setSearchResults(limitedResults);
        setHasSearched(true);
      }
    } catch (error) {
      console.log("Search error:", error);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
      setLoading("");
    }
  };

  const handleItemSelect = (item: SearchItem, index: number) => {
    const valueText = formatValueText(item); // Use valueKeys for the actual value
    if (index) {
      console.log(index);
    }

    setIsItemSelected(true); // Flag that an item was selected
    setQuery(formatDisplayText(item)); // Use displayKeys for what's shown in input

    // Set the value using valueKeys
    onSetValue(valueText);

    // New functionality: set multiple states if enabled
    if (multiStateMode) {
      setMultipleStates(item);
    }

    // Call onSelectItem callback if provided
    if (onSelectItem) onSelectItem(item);

    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || searchResult.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResult.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : searchResult.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleItemSelect(searchResult[selectedIndex], selectedIndex);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div>
      <div className="relative w-full" ref={inputRef} data-datalist-trigger>
        <Textinput
          value={query}
          onChange={(value) => {
            setQuery(value);
            onSetValue(value);
          }}
          onKeyDown={handleKeyDown}
          label={placeholder}
          labelBgHex={theme.background}
          labelBgHexIntensity={labelBgHexIntensity ? labelBgHexIntensity : 10}
          desc={desc}
          maxLength={maxLength}
        />
      </div>

      {/* Render dropdown in portal when visible and mounted */}
      {isMounted &&
        query.length >= minQueryLength &&
        typeof document !== "undefined" &&
        createPortal(
          <DropdownContent
            isVisible={showDropdown}
            triggerRect={triggerRect}
            searchResult={searchResult}
            isSearching={isSearching}
            hasSearched={hasSearched}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            handleItemSelect={handleItemSelect}
            formatDisplayText={formatDisplayText}
            noResultsText={noResultsText}
            searchingText={searchingText}
            query={query}
            onSetValue={onSetValue}
            setShowDropdown={setShowDropdown}
            theme={theme}
            accentColor={accentColor}
            loading={loading}
            onSelectItem={onSelectItem} // Add this line
          />,
          document.body
        )}
    </div>
  );
};

export default DataList;
