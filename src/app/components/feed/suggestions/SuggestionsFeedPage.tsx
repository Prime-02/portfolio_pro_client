"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import {
  useSuggestionsStore,
  SuggestionStatus,
  SuggestionResponse,
} from "@/lib/stores/suggestions/useSuggestions";
import SuggestionCard from "./components/SuggestionCard";
import SuggestionSkeleton from "./components/SuggestionSkeleton";
import SuggestionForm from "./components/SuggestionForm";

const PAGE_SIZE = 20;
const SKELETON_COUNT = 5;

type TabKey = "pending" | "approved" | "implemented" | "mine";

const TAB_CONFIG: {
  key: TabKey;
  label: string;
  status: SuggestionStatus | null;
}[] = [
    { key: "pending", label: "Suggestions", status: "pending" },
    { key: "approved", label: "Coming Soon", status: "approved" },
    { key: "implemented", label: "What's New", status: "implemented" },
    { key: "mine", label: "My Suggestions", status: null },
  ];

export default function SuggestionsFeedPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";

  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { userInfo } = useUserSettings();

  // Select specific slices to avoid unnecessary re-renders
  const suggestions = useSuggestionsStore((s) => s.suggestions);
  const mySuggestions = useSuggestionsStore((s) => s.mySuggestions);

  const suggestionsHasNext = useSuggestionsStore((s) => s.suggestionsHasNext);
  const suggestionsTotal = useSuggestionsStore((s) => s.suggestionsTotal);
  const suggestionsPage = useSuggestionsStore((s) => s.suggestionsPage);

  const mySuggestionsHasNext = useSuggestionsStore((s) => s.mySuggestionsHasNext);
  const mySuggestionsPage = useSuggestionsStore((s) => s.mySuggestionsPage);

  const isLoading = useSuggestionsStore(
    (s) => s.loading["fetchSuggestions"] ?? false
  );
  const isLoadingMy = useSuggestionsStore(
    (s) => s.loading["fetchMySuggestions"] ?? false
  );
  const isLoadingSearch = useSuggestionsStore(
    (s) => s.loading["searchSuggestions"] ?? false
  );

  const fetchSuggestions = useSuggestionsStore((s) => s.fetchSuggestions);
  const fetchMySuggestions = useSuggestionsStore((s) => s.fetchMySuggestions);
  const searchSuggestionsAction = useSuggestionsStore((s) => s.searchSuggestions);

  const searchResults = useSuggestionsStore((s) => s.searchResults);
  const searchResultsMeta = useSuggestionsStore((s) => s.searchResultsMeta);

  const isMine = activeTab === "mine";
  const currentStatus = TAB_CONFIG.find((t) => t.key === activeTab)?.status;

  // Determine what to display based on search query
  const isSearching = search.length > 0;
  const displayList: SuggestionResponse[] = isSearching
    ? searchResults
    : isMine
      ? mySuggestions
      : suggestions;
  const displayLoading = isSearching
    ? isLoadingSearch
    : isMine
      ? isLoadingMy
      : isLoading;
  const hasMore = isSearching
    ? searchResultsMeta?.has_next ?? false
    : isMine
      ? mySuggestionsHasNext
      : suggestionsHasNext;
  const currentPage = isSearching
    ? searchResultsMeta?.page ?? 1
    : isMine
      ? mySuggestionsPage
      : suggestionsPage;

  // Initial load + reload whenever tab or search changes
  useEffect(() => {
    const loadInitial = async () => {
      setIsInitialLoading(true);

      if (isSearching) {
        // Search across all statuses when search query is present
        await searchSuggestionsAction({
          q: search,
          skip: 0,
          limit: PAGE_SIZE,
        });
      } else if (isMine) {
        if (userInfo?.id) {
          await fetchMySuggestions(0, PAGE_SIZE);
        }
      } else if (currentStatus) {
        await fetchSuggestions({
          skip: 0,
          limit: PAGE_SIZE,
          status: currentStatus,
        });
      }

      setIsInitialLoading(false);
    };
    loadInitial();
  }, [
    activeTab,
    currentStatus,
    search,
    fetchSuggestions,
    fetchMySuggestions,
    searchSuggestionsAction,
    userInfo?.id,
    isMine,
    isSearching,
  ]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !displayLoading &&
          !isInitialLoading
        ) {
          const nextPage = currentPage + 1;
          const skip = (nextPage - 1) * PAGE_SIZE;

          if (isSearching) {
            searchSuggestionsAction({
              q: search,
              skip,
              limit: PAGE_SIZE,
            });
          } else if (isMine && userInfo?.id) {
            fetchMySuggestions(skip, PAGE_SIZE);
          } else if (currentStatus) {
            fetchSuggestions({
              skip,
              limit: PAGE_SIZE,
              status: currentStatus,
            });
          }
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [
    hasMore,
    displayLoading,
    isInitialLoading,
    currentPage,
    currentStatus,
    search,
    isMine,
    isSearching,
    userInfo?.id,
    fetchSuggestions,
    fetchMySuggestions,
    searchSuggestionsAction,
  ]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
  };

  return (
    <div
      className="min-h-screen"
    >
      <div className="max-w-2xl mx-auto space-y-3">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            What&apos;s New
          </h1>
          <p className="text-sm text-[var(--foreground)]/50 max-w-md mx-auto">
            Share ideas, vote on features, and track what&apos;s coming next.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                ${activeTab === tab.key
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--foreground)]/5 text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/10"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search indicator */}
        {isSearching && (
          <div className="text-sm text-[var(--foreground)]/60">
            Search results for:{" "}
            <span className="font-medium text-[var(--foreground)]">{`"${search}"`}</span>
          </div>
        )}

        {/* My Suggestions — Create Form */}
        {isMine && !isSearching && userInfo && <SuggestionForm />}

        {/* Feed */}
        <div className="space-y-4">
          {isInitialLoading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SuggestionSkeleton key={`skeleton-${i}`} />
            ))
          ) : displayList.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[var(--accent)]"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
                {isSearching
                  ? "No results found"
                  : isMine
                    ? "No suggestions yet"
                    : "No suggestions here"}
              </h3>
              <p className="text-sm text-[var(--foreground)]/50">
                {isSearching
                  ? `Nothing matched "${search}". Try a different search.`
                  : isMine
                    ? "Submit your first suggestion above!"
                    : "Check back later for updates."}
              </p>
            </div>
          ) : (
            <>
              {displayList.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  isMine={isMine}
                />
              ))}

              {/* Load more trigger */}
              <div ref={loadMoreRef} className="py-4">
                {displayLoading && !isInitialLoading && (
                  <div className="flex items-center justify-center gap-2 py-4">
                    <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-[var(--foreground)]/50">
                      Loading more...
                    </span>
                  </div>
                )}
                {!hasMore && displayList.length > 0 && (
                  <p className="text-center text-sm text-[var(--foreground)]/30 py-4">
                    {suggestionsTotal > 0
                      ? `Showing all ${displayList.length} ${isMine ? "suggestions" : "items"
                      }`
                      : "You've reached the end"}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}