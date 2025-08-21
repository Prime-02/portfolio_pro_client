import { useGlobalState } from "@/app/globalStateProvider";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { getColorShade } from "../../utilities/syncFunctions/syncs";
import { useTheme } from "../../theme/ThemeContext ";
import { GetAllData } from "../../utilities/asyncFunctions/lib/crud";
import AbsoluteSearching from "../skeletons/AbsoluteSearching";
import EmptyState from "./EmptyState";
import { SearchResultProp } from "../../types and interfaces/SearchResTypes";
import Link from "next/link";
import { Textinput } from "../../inputs/Textinput";

type SearchComponentProps = {
  querry?: string | undefined;
  onQuery?: (querry: string) => void;
  placeholder?: string;
  className?: string;
  labelBgHexIntensity?: number
};



type SearchResPropData = {
  category: string
  name: string
  id: string
}
type SearchResProp = {
  data: SearchResPropData[]
}

const SearchPopover = ({
  querry = "",
  onQuery,
  placeholder = "Type at least 2 characters to search...",
  className = "",
  labelBgHexIntensity = 10,
}: SearchComponentProps) => {
  const [searchRes, setSearchRes] = useState<SearchResultProp[]>([]);
  const [internalQuery, setInternalQuery] = useState(querry);
  const [hasSearched, setHasSearched] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const { loading, setLoading, accessToken, userData } = useGlobalState();
  const { theme } = useTheme();

  // Refs for debouncing and popover positioning
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSearchQueryRef = useRef<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchBD = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSearchRes([]);
        setHasSearched(true);
        setShowPopover(false);
        return;
      }

      abortControllerRef.current = new AbortController();
      lastSearchQueryRef.current = searchQuery;

      setLoading("absolute_searching");
      setHasSearched(true);
      setShowPopover(true);

      try {
        const response : SearchResProp = await GetAllData({
          access: accessToken,
          url: `?search=${encodeURIComponent(searchQuery)}`,
          type: "Absolute Search",
          // signal: abortControllerRef.current.signal,
        });

        // Ensure we have a valid array response
        const results = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        if (searchQuery === lastSearchQueryRef.current) {
          setSearchRes(results);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchRes([]);
      } finally {
        if (searchQuery === lastSearchQueryRef.current) {
          setLoading("");
        }
      }
    },
    [accessToken]
  );

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Clear previous search request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Don't search for empty queries or if query hasn't changed
      if (!searchQuery.trim() || searchQuery === lastSearchQueryRef.current) {
        if (!searchQuery.trim()) {
          setSearchRes([]);
          setHasSearched(false);
          setShowPopover(false);
        }
        return;
      }

      // Set debounce timer
      debounceTimerRef.current = setTimeout(() => {
        searchBD(searchQuery);
      }, 300); // 300ms delay - adjust as needed
    },
    [accessToken, searchBD] // Dependencies for useCallback
  );

  const handleQueryChange = useCallback(
    (newQuery: string) => {
      // Update local state
      setInternalQuery(newQuery);

      // Notify parent if callback exists
      if (onQuery) {
        onQuery(newQuery);
      }

      // Trigger debounced search
      debouncedSearch(newQuery);
    },
    [onQuery, debouncedSearch]
  );

  // const handleInputFocus = () => {
  //   if (internalQuery.length >= 2) {
  //     setShowPopover(true);
  //   }
  // };

  // const handleInputBlur = () => {
  //   // Delay hiding popover to allow for clicking on results
  //   setTimeout(() => {
  //     setShowPopover(false);
  //   }, 200);
  // };

  const handleResultClick = () => {
    setShowPopover(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showPopover) {
        setShowPopover(false);
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showPopover]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div>
        <Textinput
          ref={inputRef}
          value={internalQuery}
          type="search"
          label="Search..."
          labelStyle="bg-inherit"
          labelBgHex={theme.background}
          labelBgHexIntensity={labelBgHexIntensity}
          onChange={handleQueryChange}
          // onFocus={handleInputFocus}
          // onBlur={handleInputBlur}
          placeholder={placeholder}
        />
      </div>

      {/* Search Results Popover */}
      {showPopover && (
        <div
          style={{
            backgroundColor: getColorShade(theme.background, 10),
          }}
          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg shadow-xl border border-[var(--accent)] overflow-hidden"
        >
          <div className="max-h-96 overflow-y-auto">
            {loading.includes("absolute_searching") ? (
              <AbsoluteSearching />
            ) : !hasSearched ? (
              <div className="p-8 text-center">
                <p className="text-[var(--text-secondary)]">
                  Start typing to search...
                </p>
              </div>
            ) : searchRes.length < 1 ? (
              <EmptyState />
            ) : (
              <div className="divide-y divide-[var(--accent)]">
                {Array.isArray(searchRes) && searchRes.length > 0 ? (
                  <div className="divide-y divide-[var(--accent)]">
                    {searchRes.map((res, i) => (
                      <Link
                        href={`/${userData.username}/${res.id || res.name || res.slug || ""}`}
                        key={i}
                        className="block hover:bg-[var(--accent)] hover:bg-opacity-10 transition-colors duration-200"
                        onClick={handleResultClick}
                      >
                        <div className="p-4">
                          <div className="text-sm text-[var(--text-secondary)] mb-1">
                            {res.category}
                          </div>
                          <div className="font-medium text-[var(--text-primary)]">
                            {res.name}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPopover;
