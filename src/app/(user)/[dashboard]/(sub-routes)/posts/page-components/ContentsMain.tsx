"use client";
import React, { useEffect } from "react";
import ContentsHeader from "./ContentsHeader";
import { useGlobalState } from "@/app/globalStateProvider";
import Modal from "@/app/components/containers/modals/Modal";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";
import { ContentStatus } from "@/app/components/types and interfaces/Posts";
import PostsGrid from "./ContentsGrid";
import ContentsActions from "./ContentsActions";
import { defaultContent } from "@/app/components/utilities/indices/contents-JSONs/defaultContent";

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
  const varifiedId = checkValidId(updateId || "") ? updateId || "" : "";

  useEffect(() => {
    if (!varifiedId) return;
    if (isOnline && accessToken) {
      getContentById(accessToken, varifiedId, setLoading);
    }
  }, []);
  return (
    <div>
      <ContentsHeader />
      <PostsGrid />
      <Modal
        closeOnBackdropClick={false}
        showMinimizeButton={true}
        size="xl"
        onClose={() => {
          clearQuerryParam();
        }}
        isOpen={checkParams("new") === "true" || varifiedId !== ""}
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
