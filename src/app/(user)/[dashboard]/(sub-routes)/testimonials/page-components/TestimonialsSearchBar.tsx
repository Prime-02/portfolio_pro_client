import Button from "@/app/components/buttons/Buttons";
import Popover from "@/app/components/containers/divs/PopOver";
import { Textinput } from "@/app/components/inputs/Textinput";
import {
  findMatch,
  PathUtil,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { Check } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

export interface TestimonialQueryParams {
  q: string;
  filter: string;
  [key: string]: string | number | boolean | string[] | null | undefined;
}

const TestimonialsSearchBar = () => {
  const {
    currentUser,
    checkParams,
    currentPath,
    router,
    currentPathWithQuery,
  } = useGlobalState();

  // Default values - used when no URL params exist
  const defaultValues: TestimonialQueryParams = {
    q: "",
    filter: "summary",
  };

  const [queryParams, setQueryParams] =
    useState<TestimonialQueryParams>(defaultValues);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Use ref to track debounce timeout
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to filter out empty values from query object
  const filterEmptyValues = (obj: TestimonialQueryParams) => {
    const filtered: Partial<TestimonialQueryParams> = {};

    Object.entries(obj).forEach(([key, value]) => {
      // Include field only if it has a meaningful value
      if (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0) &&
        // Don't include default "summary" filter in URL
        !(key === "filter" && value === "summary")
      ) {
        filtered[key] = value;
      }
    });

    return filtered;
  };

  const constructedRouter = () => {
    // Only update router if user has actually interacted with filters
    if (!hasUserInteracted) return;

    // Filter out empty values before building URL
    const filteredQuery = filterEmptyValues(queryParams);

    // Only proceed if currentPath exists
    if (currentPath) {
      if (Object.keys(filteredQuery).length > 0) {
        const constructedRoute = PathUtil.buildUrlWithQuery(
          currentPath,
          filteredQuery
        );
        router.push(constructedRoute);
      } else {
        // If no query parameters, navigate to base path
        router.push(currentPath);
      }
    }
  };

  // Handle router updates when queryParams changes (only after user interaction)
  useEffect(() => {
    constructedRouter();
  }, [queryParams, currentPath, hasUserInteracted]);

  // Handle debounced search query updates
  useEffect(() => {
    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout (3 seconds like original, but you could reduce to 1500ms)
    debounceRef.current = setTimeout(() => {
      const trimmedQuery = searchQuery.trim();
      setQueryParams((prev) => ({
        ...prev,
        q: trimmedQuery,
        // Set filter to "search" when there's a search query, otherwise keep current filter
        filter: trimmedQuery
          ? "search"
          : prev.filter === "search"
            ? "summary"
            : prev.filter,
      }));
    }, 1500); // Changed from 3000ms to 1500ms for better UX

    // Cleanup function
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  // Initialize state from URL parameters on component mount
  useEffect(() => {
    // Check if there are any existing URL parameters
    const hasUrlParams = checkParams("q") || checkParams("filter");

    if (hasUrlParams) {
      // Only update state if URL parameters actually exist
      const urlParams = {
        q: checkParams("q") || defaultValues.q,
        filter: checkParams("filter") || defaultValues.filter,
      };

      setQueryParams(urlParams);
      setSearchQuery(urlParams.q);
    } else {
      // No URL params exist, keep default state without triggering router update
      setQueryParams(defaultValues);
      setSearchQuery(defaultValues.q);
    }
  }, []); // Run only on mount

  // Handle search input changes with user interaction tracking
  const handleSearchChange = (value: string) => {
    if (value !== searchQuery) {
      setHasUserInteracted(true);
    }
    setSearchQuery(value);
  };

  // Handle filter changes with user interaction tracking
  const handleFilterChange = (filterId: string) => {
    setHasUserInteracted(true);
    setQueryParams((prev) => ({
      ...prev,
      filter: filterId,
    }));
  };

  // Get current filter (prioritize URL params, then local state, then default to "summary")
  const [currentFilter, setCurrentFilter] = useState(
    checkParams("filter") || "summary"
  );

  useEffect(() => {
    setCurrentFilter(checkParams("filter") || "summary");
  }, [currentPathWithQuery, queryParams.filter]);

  const filterOptions = [
    { id: "summary", code: "Recent Testimonials" },
    { id: "all", code: "All Testimonials" },
    { id: "authored", code: `Testimonials You authored` },
  ];

  const FilterOptions = () => {
    return (
      <div className="p-2">
        {filterOptions.map((option, i) => (
          <span
            key={i}
            className="w-full flex items-center justify-between px-2 hover:bg-[var(--accent)]/10 rounded-md transition-colors"
          >
            <Button
              variant={"ghost"}
              text={option.code}
              onClick={() => handleFilterChange(option.id)}
              customColor="grey"
              className="flex-1 text-left justify-start"
            />
            {currentFilter === option.id && (
              <Check size={14} className="text-[var(--accent)]/70" />
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full py-2 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center h-auto">
      {/* Search input - responsive sizing */}
      <div className="sm:col-span-9 col-span-full">
        <span className="w-full">
          <Textinput
            value={searchQuery}
            onChange={handleSearchChange}
            label="Search Testimonial..."
            className="rounded-md w-full"
            labelBgHexIntensity={1}
          />
        </span>
      </div>

      {/* Filter button - responsive sizing */}
      <div className="sm:col-span-3 col-span-full mt-2 flex h-full w-full sm:mt-0">
        <Popover
          className=""
          clickerContainerClassName="w-full h-full"
          clickerClassName="h-full w-full"
          clicker={
            <Button
              size="md"
              className="w-full rounded-md h-full"
              text={
                findMatch(currentFilter, filterOptions)?.code ||
                "Filter Options"
              }
            />
          }
        >
          <FilterOptions />
        </Popover>
      </div>
    </div>
  );
};

export default TestimonialsSearchBar;
