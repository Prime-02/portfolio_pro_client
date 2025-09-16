"use client";
import Button from "@/app/components/buttons/Buttons";
import Popover from "@/app/components/containers/divs/PopOver";
import { Textinput } from "@/app/components/inputs/Textinput";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import {
  getColorShade,
  PathUtil,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { useProjectStatisticsStore } from "@/app/stores/project_stores/ProjectStats";
import {
  Check,
  Grid3X3,
  List,
  ListFilter,
  Plus,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

export interface QuerryAndFilterProps {
  querry: string;
  view: "list" | "grid";
  sort: string;
  sortDirection: "asc" | "desc";
  filter: string;
  [key: string]: string | number | boolean | string[] | null | undefined;
}

const SearchAndFilter = () => {
  const { theme } = useTheme();
  const { currentPath, checkParams, viewportWidth, router } = useGlobalState();
  const { platform_projects, linked_platforms } = useProjectStatisticsStore();

  // Default values - these are used when no URL params exist
  const defaultValues: QuerryAndFilterProps = {
    querry: "",
    view: "grid",
    sort: "",
    sortDirection: "asc",
    filter: "",
  };

  const [querryAndFilter, setQuerryAndFilter] =
    useState<QuerryAndFilterProps>(defaultValues);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // Track actual user interaction

  // Use ref to track debounce timeout
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to filter out empty values from query object
  const filterEmptyValues = (obj: QuerryAndFilterProps) => {
    const filtered: Partial<QuerryAndFilterProps> = {};

    Object.entries(obj).forEach(([key, value]) => {
      // Include field only if it has a meaningful value
      if (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0)
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
    const filteredQuery = filterEmptyValues(querryAndFilter);

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

  // Handle router updates when querryAndFilter changes (only after user interaction)
  useEffect(() => {
    constructedRouter();
  }, [querryAndFilter, currentPath, hasUserInteracted]);

  // Handle debounced search query updates
  useEffect(() => {
    // Clear existing timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(() => {
      setQuerryAndFilter((prev) => ({
        ...prev,
        querry: searchQuery.trim(), // Trim whitespace
      }));
    }, 1500);

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
    const hasUrlParams =
      checkParams("querry") ||
      checkParams("view") ||
      checkParams("sort") ||
      checkParams("sortDirection") ||
      checkParams("filter");

    if (hasUrlParams) {
      // Only update state if URL parameters actually exist
      const urlParams = {
        querry: checkParams("querry") || defaultValues.querry,
        view: (checkParams("view") || defaultValues.view) as "list" | "grid",
        sort: checkParams("sort") || defaultValues.sort,
        sortDirection: (checkParams("sortDirection") ||
          defaultValues.sortDirection) as "asc" | "desc",
        filter: checkParams("filter") || defaultValues.filter,
      };

      setQuerryAndFilter(urlParams);
      setSearchQuery(urlParams.querry);
    } else {
      // No URL params exist, keep default state without triggering router update
      setQuerryAndFilter(defaultValues);
      setSearchQuery(defaultValues.querry);
    }
  }, []); // Run only on mount

// Update view based on viewport width changes (only if no URL param exists and no user interaction)
  useEffect(() => {
    const newDefaultView = viewportWidth <= 640 ? "grid" : querryAndFilter.view;

    // Only update if no view is set in URL params and user hasn't interacted
    if (!checkParams("view") && !hasUserInteracted) {
      setQuerryAndFilter((prev) => ({
        ...prev,
        view: newDefaultView,
      }));
      
      // Manually trigger router update for viewport-based view changes
      if (currentPath && newDefaultView !== querryAndFilter.view) {
        const filteredQuery = filterEmptyValues({
          ...querryAndFilter,
          view: newDefaultView,
        });
        
        if (Object.keys(filteredQuery).length > 0) {
          const constructedRoute = PathUtil.buildUrlWithQuery(
            currentPath,
            filteredQuery
          );
          router.push(constructedRoute);
        } else {
          router.push(currentPath);
        }
      }
    }
  }, [viewportWidth]);

  // Handle sort selection with user interaction tracking
  const handleSortSelection = (sortType: string) => {
    setHasUserInteracted(true); // Mark that user has interacted

    if (checkParams("sort") === sortType || querryAndFilter.sort === sortType) {
      // If same sort type is selected, toggle direction or clear
      if (querryAndFilter.sortDirection === "asc") {
        setQuerryAndFilter((prev) => ({
          ...prev,
          sortDirection: "desc",
        }));
      } else {
        // Clear sort if direction was desc
        setQuerryAndFilter((prev) => ({
          ...prev,
          sort: "",
          sortDirection: "asc",
        }));
      }
    } else {
      // New sort type selected, set to ascending
      setQuerryAndFilter((prev) => ({
        ...prev,
        sort: sortType,
        sortDirection: "asc",
      }));
    }
  };

  // Handle view changes with user interaction tracking
  const handleViewChange = (newView: "list" | "grid") => {
    setHasUserInteracted(true);
    setQuerryAndFilter((prev) => ({ ...prev, view: newView }));
  };

  // Handle filter changes with user interaction tracking
  const handleFilterChange = (filterKey: string) => {
    setHasUserInteracted(true);

    const currentFilter = checkParams("filter") || querryAndFilter.filter;

    if (currentFilter !== filterKey) {
      setQuerryAndFilter((prev) => ({
        ...prev,
        filter: filterKey,
      }));
    } else {
      setQuerryAndFilter((prev) => ({
        ...prev,
        filter: "",
      }));
    }
  };

  // Handle search input changes with user interaction tracking
  const handleSearchChange = (value: string) => {
    if (value !== searchQuery) {
      setHasUserInteracted(true);
    }
    setSearchQuery(value);
  };

  // Get current view (prioritize URL params, then local state)
  const view = checkParams("view") || querryAndFilter.view;
  const currentSort = checkParams("sort") || querryAndFilter.sort;
  const currentFilter = checkParams("filter") || querryAndFilter.filter;

  const FilterAndSortPopPop = () => {
    return (
      <div className="sm:w-64 w-full p-3 sm:p-2 sm:py-3 flex flex-col gap-y-3 min-h-32">
        <div className="w-full ">
          <div className="flex flex-col w-full  ">
            <h3 className="font-semibold">Filter By</h3>
            {Object.entries(platform_projects).map(([key, value]) => (
              <span
                onClick={() => handleFilterChange(key.replace("-", ""))}
                className="opacity-65 hover:border-b border-white/50 cursor-pointer flex items-center justify-between capitalize py-2 w-full   ml-2"
                key={key}
              >
                <p>{` ${key.replace("-", " ")} [${value}]`}</p>
                <span className="mr-3 ">
                  {currentFilter === key && <Check size={16} />}
                </span>
              </span>
            ))}
          </div>
        </div>
        <span className="w-full h-[0.1px] bg-[var(--accent)]/20"></span>
        <div className="flex flex-col w-full  ">
          <h3 className="font-semibold">Sort By</h3>
          {["date", "name"].map((item, i) => {
            const isSelected = currentSort === item;
            const currentDirection = querryAndFilter.sortDirection;

            return (
              <span
                className="opacity-65 hover:border-b border-white/50 cursor-pointer flex items-center justify-between capitalize py-2 w-full   ml-2"
                key={i}
                onClick={() => handleSortSelection(item)}
              >
                <p>{item}</p>
                <div className="flex items-center gap-1 mr-3">
                  {isSelected && (
                    <>
                      {currentDirection === "asc" ? (
                        <ChevronUp size={16} className="text-[var(--accent)]" />
                      ) : (
                        <ChevronDown
                          size={16}
                          className="text-[var(--accent)]"
                        />
                      )}
                      <Check size={16} />
                    </>
                  )}
                </div>
              </span>
            );
          })}
        </div>

        {/* Sort Direction Controls - Only show when a sort is active */}
        {currentSort && (
          <>
            <span className="w-full h-[0.1px] bg-[var(--accent)]/20"></span>
            <div className="flex flex-col w-full">
              <h3 className="font-semibold">Sort Direction</h3>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setHasUserInteracted(true);
                    setQuerryAndFilter((prev) => ({
                      ...prev,
                      sortDirection: "asc",
                    }));
                  }}
                  className={`flex-1 px-3 py-2 rounded-md border transition-colors ${
                    querryAndFilter.sortDirection === "asc"
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <ChevronUp size={16} />
                    <span className="text-sm">Asc</span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setHasUserInteracted(true);
                    setQuerryAndFilter((prev) => ({
                      ...prev,
                      sortDirection: "desc",
                    }));
                  }}
                  className={`flex-1 px-3 py-2 rounded-md border transition-colors ${
                    querryAndFilter.sortDirection === "desc"
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <ChevronDown size={16} />
                    <span className="text-sm">Desc</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const NewProjectPopUp = () => {
    const urlConstructor = (query: string) => {
      const cunstructedUrl = PathUtil.buildUrlWithQuery(
        `${currentPath}/import`,
        {
          platform: [query],
        }
      );
      router.push(cunstructedUrl);
    };
    return (
      <div className="sm:w-64 w-full p-3 sm:p-2 sm:py-3 flex flex-col gap-y-3 min-h-32">
        <div className="flex flex-col w-full  ">
          <h3 className="font-semibold">Import A New Project</h3>
          {["manual-upload", ...linked_platforms].map((item, i) => {
            return (
              <span
                className="opacity-65 hover:border-b border-white/50 cursor-pointer flex items-center justify-between capitalize py-2 w-full   ml-2"
                key={i}
                onClick={() => urlConstructor(item)}
              >
                <p>{item.replace("-", " ")}</p>
                <div className="flex items-center gap-1 mr-3">
                  <Plus size={16} />
                </div>
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full py-2 grid grid-cols-24 gap-2 items-center h-auto">
      {/* Search input - takes majority of space */}
      <div className={`${viewportWidth > 640 ? "col-span-16" : "col-span-18"}`}>
        <Textinput
          value={searchQuery}
          onChange={handleSearchChange}
          label="Search Projects..."
          labelBgHexIntensity={1}
          className="rounded-md w-full"
        />
      </div>

      {/* View toggles - only show on larger screens */}
      {viewportWidth > 640 && (
        <div className="col-span-3 h-full">
          <div
            style={{
              backgroundColor: getColorShade(theme.background, 10),
            }}
            title="view"
            className="flex justify-between items-center p-1 rounded-md h-full"
          >
            <span
              onClick={() => handleViewChange("grid")}
              className={`w-1/2 cursor-pointer flex items-center ${
                view === "grid"
                  ? "bg-[var(--foreground)] text-[var(--background)] h-full rounded-sm shadow-md"
                  : ""
              } justify-center`}
            >
              <Grid3X3 />
            </span>
            <span
              onClick={() => handleViewChange("list")}
              className={`w-1/2 cursor-pointer flex items-center ${
                view === "list"
                  ? "bg-[var(--foreground)] text-[var(--background)] h-full rounded-sm shadow-md"
                  : ""
              } justify-center`}
            >
              <List />
            </span>
          </div>
        </div>
      )}

      {/* Filter popover */}
      <div
        className={`${viewportWidth > 640 ? "col-span-1" : "col-span-3"} flex items-center justify-center`}
      >
        <Popover
          position="bottom-right"
          clicker={
            <div
              style={{
                backgroundColor: getColorShade(theme.background, 10),
              }}
              title="filter"
              className="flex justify-center items-center rounded-md w-full h-full"
            >
              <ListFilter />
            </div>
          }
        >
          <FilterAndSortPopPop />
        </Popover>
      </div>

      <div
        className={`${viewportWidth > 640 ? "col-span-4" : "col-span-3"}  flex items-center justify-center w-full `}
      >
        <Popover
          position="bottom-left"
          clickerClassName="h-full w-full"
          clicker={
            <Button
              className="rounded-sm w-full"
              text={viewportWidth > 640 ? "New Project" : ""}
              icon2={<Plus />}
            />
          }
        >
          <NewProjectPopUp />
        </Popover>
      </div>
    </div>
  );
};

export default SearchAndFilter;
