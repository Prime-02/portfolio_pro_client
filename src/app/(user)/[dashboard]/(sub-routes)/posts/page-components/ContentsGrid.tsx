import MasonryGrid from "@/app/components/containers/divs/MasonryGrid";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import { useGlobalState } from "@/app/globalStateProvider";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";
import React, { useEffect, useCallback, useRef } from "react";

const ContentsGrid = () => {
  const {
    listContent,
    contentList,
    currentPage,
    totalContent,
    hasNext,
    setPage,
    toggleContentSelection,
    selectedContentIds,
    filters,
  } = useContentStore();
  const {
    accessToken,
    setLoading,
    isOnline,
    isLoading,
    currentUser,
  } = useGlobalState();
  const isLoadingRef = useRef(false);

  // Initial load on mount
  useEffect(() => {
    if (isOnline && accessToken) {
      listContent(accessToken, setLoading, {
        page: 1,
        username: currentUser || undefined,
        ...filters
      });
    }
  }, [isOnline, accessToken, currentUser, filters]);



  // Load more callback for infinite scroll
  const handleLoadMore = useCallback(async () => {
    if (!accessToken || !hasNext || isLoadingRef.current) return;

    isLoadingRef.current = true;
    const nextPage = currentPage + 1;

    try {
      await listContent(accessToken, setLoading, {
        page: nextPage,
        username: currentUser || undefined,
        ...filters,
      });
    } finally {
      isLoadingRef.current = false;
    }
  }, [accessToken, currentUser, currentPage, hasNext, listContent, setLoading, filters]);

  useEffect(() => {
    if (contentList.length > 0 && isOnline && accessToken) {
      console.log(contentList);
    }
  }, [contentList]);

  return (
    <MasonryGrid
      page={currentPage}
      setPage={setPage}
      onLoadMore={handleLoadMore}
      totalItems={totalContent}
      loadedItems={contentList.length}
      isLoading={isLoading("fetching_content_list")}
      gap={5}
    >
      {contentList.map((content, i) => (
        <div
          key={i}
          onClick={() => {
            if (!filters.username) return
            toggleContentSelection(content.id)
          }}
        >
          <ImageCard
            key={content.id}
            id={content.id}
            image_url={content.cover_image_url || ""}
            isLoading={false}
            title={content.title}
            titleSize="lg"
            borderWidth={selectedContentIds.includes(content.id) ? 1 : 0}
          />
        </div>
      ))}
    </MasonryGrid>
  );
};

export default ContentsGrid;