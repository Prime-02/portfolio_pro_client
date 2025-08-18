"use client";
import { getCurrentUrl } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import MediaCollection from "./MediaCollection";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import Modal from "@/app/components/containers/modals/Modal";
import GalleryActions from "../../page-components/GalleryActions";
import { ImageCardProps } from "@/app/components/types and interfaces/ImageCardTypes";
import {
  createMediaConfig,
  mediaCardDefault,
} from "@/app/components/utilities/indices/settings-JSONs/mediaCard";

export interface AlbumData {
  id: string;
  name?: string;
  description?: string;
  cover_media_url?: string;
  image_url?: string;
  media_count?: number;
  is_public?: boolean;
  created_at?: string;
  updated_at?: string | null;
  likes?: number;
  media?: ImageCardProps;
}

const MediaView = () => {
  const {
    currentUser,
    accessToken,
    setLoading,
    searchParams,
    checkValidId,
    clearQuerryParam,
  } = useGlobalState();
  const [lastPathSegment, setLastPathSegment] = useState<string>("");
  const [albumData, setAlbumData] = useState<AlbumData>({
    id: "",
    name: "",
    description: "",
    cover_media_url: "",
    image_url: "",
    is_public: false,
    likes: 0,
    media_count: 0,
    created_at: "",
    updated_at: "",
    media: mediaCardDefault,
  });

  // Get the current action from search params
  const updateAction = searchParams.get("update");
  const deleteAction = searchParams.get("delete");
  const currentAction =
    updateAction || deleteAction ? searchParams.get("albumCover") : "";
  const isEditMode = updateAction === "true";

  const fetchAlbumCover = async () => {
    setLoading("fetching_cover_data");
    const url = currentUser
      ? `${V1_BASE_URL}/media-gallery/users/${currentUser}/collections/${lastPathSegment}`
      : `${V1_BASE_URL}/media-gallery/collections/${lastPathSegment}`;
    try {
      const response: AlbumData & { cover_media_url: string } =
        await GetAllData({
          access: accessToken,
          url: url,
        });
      if (response) {
        setAlbumData({
          ...albumData,
          id: response.id,
          image_url: response.cover_media_url,
          name: response.name,
          description: response.description,
          is_public: response.is_public,
          likes: response.likes || 0,
          created_at: response.created_at,
          media: createMediaConfig(response),
        });
      }
    } catch (error) {
      console.error("Error loading album data:", error);
    } finally {
      setLoading("fetching_cover_data");
    }
  };

  useEffect(() => {
    if (accessToken && lastPathSegment) {
      fetchAlbumCover();
    }
  }, [accessToken, lastPathSegment, currentUser]);

  useEffect(() => {
    const updateLastPathSegment = () => {
      try {
        const url = getCurrentUrl("lastPathSegment");
        setLastPathSegment(url);
      } catch (error) {
        console.error("Error getting last path segment:", error);
        setLastPathSegment("");
      }
    };

    updateLastPathSegment();
  }, [lastPathSegment]);

  return (
    <>
      <Modal
        title={`${deleteAction ? "Delete" : updateAction ? "Edit" : ""} Album`}
        isOpen={checkValidId(currentAction || "")}
        onClose={clearQuerryParam}
      >
        <GalleryActions
          edit={isEditMode}
          albumId={albumData.id}
          fetchAlbum={fetchAlbumCover}
        />
      </Modal>
      <div className="grid w-full">
        <div className="w-full">
          <MediaCollection collectionId={lastPathSegment} props={albumData} />
        </div>
      </div>
    </>
  );
};

export default MediaView;
