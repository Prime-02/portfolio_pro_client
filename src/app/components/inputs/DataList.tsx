import React, { useState, useEffect, useRef } from "react";
import { Textinput } from "./Textinput";
import { useTheme } from "../theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import { getColorShade } from "../utilities/syncFunctions/syncs";
import { PostAllData } from "../utilities/asyncFunctions/lib/crud";
import { getLoader } from "../loaders/Loader";
import Button from "../buttons/Buttons";

interface SearchItem {
  [key: string]: string | number | boolean | null | undefined;
}

type DataListProps = {
  url: string;
  onSetValue: (query: string) => void;
  onSelectItem?: (item: SearchItem) => void;
  dataPath?: string; // Path to nested data (e.g., "data.results" or "response.items")
  displayKeys?: string[]; // Keys to display from each item
  separator?: string; // Separator for multiple keys (default: ", ")
  placeholder?: string;
  minQueryLength?: number; // Minimum query length to trigger search
  debounceDelay?: number; // Debounce delay in milliseconds
  maxResults?: number; // Maximum number of results to show
  noResultsText?: string;
  searchingText?: string;
};

const DataList = ({
  url,
  onSetValue,
  onSelectItem,
  dataPath = "",
  displayKeys = ["name", "title", "label"],
  separator = ", ",
  placeholder = "Search...",
  minQueryLength = 2,
  debounceDelay = 300,
  maxResults = 10,
  noResultsText = "No results found",
  searchingText = "Searching...",
}: DataListProps) => {
  const { theme, loader, accentColor } = useTheme();
  const { loading, setLoading } = useGlobalState();
  const [searchResult, setSearchResults] = useState<SearchItem[]>([]);
  const [query, setQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const [isItemSelected, setIsItemSelected] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout>();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const LoaderComponent = getLoader(loader);

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

  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const searchKeyWord = async () => {
    if (query.length < minQueryLength) return;

    setIsSearching(true);
    setLoading("querring_from_data_list");
    setShowDropdown(true);

    try {
      const queryRes = await PostAllData({
        access: undefined,
        data: { query: query },
        url: url,
      });

      if (queryRes) {
        const extractedData = extractNestedData(queryRes, dataPath);
        const limitedResults = maxResults
          ? extractedData.slice(0, maxResults)
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
    const displayText = formatDisplayText(item);
    setIsItemSelected(true); // Flag that an item was selected
    setQuery(displayText);
    onSetValue(displayText);
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
    <div className="relative w-full" ref={dropdownRef}>
      <Textinput
        value={query}
        onChange={(value) => {
          setQuery(value);
          onSetValue(value);
        }}
        onKeyDown={handleKeyDown}
        label={placeholder}
        labelBgHex={theme.background}
        labelBgHexIntensity={10}
      />

      {showDropdown && query.length >= minQueryLength && (
        <div
          className="absolute top-14 rounded-3xl min-h-32 w-full z-20 border border-[var(--accent)]  shadow-lg overflow-hidden"
          style={{
            backgroundColor: getColorShade(theme.background, 10),
            maxHeight: "300px",
            overflowY: "auto",
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
            <div className="py-2">
              {searchResult.map((item, index) => (
                <div
                  key={index}
                  className={`px-4 py-3 cursor-pointer transition-colors duration-200 ${
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
                  onSetValue(query);
                  setShowDropdown(false);
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
      )}
    </div>
  );
};

export default DataList;
