import MasonryGrid from "@/app/components/containers/divs/MasonryGrid";
import ImageCard from "@/app/components/containers/cards/ImageCard";
import { useGlobalState } from "@/app/globalStateProvider";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";
import React, { useEffect, useCallback, useRef } from "react";

const ContentsGrid = () => {
  const {
    listContent,
    getUserContent,
    contentList,
    currentPage,
    totalContent,
    hasNext,
    setPage,
    filters,
  } = useContentStore();
  const {
    accessToken,
    setLoading,
    isOnline,
    isLoading,
    currentUser,
    extendRouteWithQuery,
  } = useGlobalState();
  const { setCurrentContent } = useContentStore();
  const isLoadingRef = useRef(false);

  // Initial load on mount
  useEffect(() => {
    if (isOnline && accessToken && currentUser) {
      //load specific user content
      getUserContent(accessToken, currentUser, setLoading, {
        page: 1,
      });
    } else if (isOnline && accessToken && !currentUser) {
      //list current user content
      listContent(accessToken, setLoading, { page: 1 });
    }
  }, [isOnline, accessToken, currentUser]);

  // Load more callback for infinite scroll
  const handleLoadMore = useCallback(async () => {
    if (!accessToken || !hasNext || isLoadingRef.current) return;

    isLoadingRef.current = true;
    const nextPage = currentPage + 1;

    try {
      if (currentUser) {
        await getUserContent(accessToken, currentUser, setLoading, {
          page: nextPage,
        });
      } else {
        await listContent(accessToken, setLoading, {
          page: nextPage,
        });
      }
    } finally {
      isLoadingRef.current = false;
    }
  }, [
    accessToken,
    currentUser,
    currentPage,
    hasNext,
    getUserContent,
    listContent,
    setLoading,
  ]);

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
      isLoading={
        isLoading("fetching_content_list") ||
        isLoading(`fetching_user_content_${currentUser}`)
      }
      gap={5}
    >
      {contentList.map((content, i) => (
        <div
        key={i}
          onClick={() => {
            setCurrentContent(content);
            extendRouteWithQuery({
              edit: content.id,
              type: content.content_type,
            });
          }}
        >
          <ImageCard
            key={content.id}
            id={content.id}
            image_url={content.cover_image_url || ""}
            isLoading={false}
            title={content.title}
            titleSize="lg"
          />
        </div>
      ))}
    </MasonryGrid>
  );
};

export default ContentsGrid;
