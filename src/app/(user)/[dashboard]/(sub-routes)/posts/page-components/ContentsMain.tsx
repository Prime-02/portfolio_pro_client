"use client";
import React, { useEffect } from "react";
import ContentsHeader from "./ContentsHeader";
import { useGlobalState } from "@/app/globalStateProvider";
import Modal from "@/app/components/containers/modals/Modal";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";
import { ContentStatus } from "@/app/components/types and interfaces/Posts";
import PostsGrid from "./ContentsGrid";
import ContentsActions from "./ContentsActions";

const ContentsMain = () => {
  const {
    checkParams,
    checkValidId,
    clearQuerryParam,
    accessToken,
    setLoading,
    isOnline,
  } = useGlobalState();
  const { setCurrentContent, getContentById } = useContentStore();
  const updateId = checkParams("edit") || checkParams(ContentStatus.DRAFT);
  const varifiesdId = checkValidId(updateId || "") ? updateId || "" : "";

  useEffect(() => {
    if (!varifiesdId) return;
    if (isOnline && accessToken) {
      getContentById(accessToken, varifiesdId, setLoading);
    }
  }, [accessToken, varifiesdId, isOnline]);
  return (
    <div>
      <ContentsHeader />
      <PostsGrid/>
      <Modal
        closeOnBackdropClick={false}
        showMinimizeButton={true}
        size="xl"
        onClose={() => {
          clearQuerryParam();
          setCurrentContent(null);
        }}
        isOpen={
          checkParams("new") === "true" || checkParams("edit") ? true : false
        }
        title={`${
          checkParams("new") === "true" ? "Create New " : "Edit this "
        } ${checkParams("type")?.slice(0, 1)}${checkParams("type")?.slice(1).toLowerCase() || "post"} `}
      >
        <ContentsActions />
      </Modal>
    </div>
  );
};

export default ContentsMain;
