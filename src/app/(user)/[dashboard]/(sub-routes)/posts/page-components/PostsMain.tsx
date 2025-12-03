"use client";
import React, { useEffect } from "react";
import PostsHeader from "./PostsHeader";
import { useGlobalState } from "@/app/globalStateProvider";
import Modal from "@/app/components/containers/modals/Modal";
import PostsActions from "./PostsActions";
import { useContentStore } from "@/app/stores/posts_store/PostsHandler";
import { ContentStatus } from "@/app/components/types and interfaces/Posts";
import { access } from "fs";

const PostsMain = () => {
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
      <PostsHeader />
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
        <PostsActions />
      </Modal>
    </div>
  );
};

export default PostsMain;
