"use client";
import { getCurrentUrl } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useEffect, useState } from "react";
import AlbumCover from "./AlbumCover";
import MediaCollection from "./MediaCollection";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";

export interface AlbumData {
  id: string;
  cover_media_url: string;
  name: string;
  description: string;
  is_public: boolean;
  created_at: string;
  likes: number;
}

const MediaView = () => {
  const { currentUser, accessToken, setLoading } = useGlobalState();
  const [lastPathSegment, setLastPathSegment] = useState<string>("");
  const [albumData, setAlbumData] = useState<AlbumData>({
    id: "",
    cover_media_url: "",
    name: "",
    description: "",
    is_public: false,
    likes: 0,
    created_at: "",
  });

  const fetchAlbumCover = async () => {
    setLoading("fetching_cover_data");
    const url = currentUser
      ? `${V1_BASE_URL}/media-gallery/users/${currentUser}/collections/${lastPathSegment}`
      : `${V1_BASE_URL}/media-gallery/collections/${lastPathSegment}`;
    try {
      const response: AlbumData = await GetAllData({
        access: accessToken,
        url: url,
      });
      if (response) {
        setAlbumData({
          id: response.id,
          cover_media_url: response.cover_media_url,
          name: response.name,
          description: response.description,
          is_public: response.is_public,
          likes: response.likes || 0,
          created_at: response.created_at,
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
    <div className="grid w-full grid-cols-1 md:grid-cols-5 gap-2">
      <div className="md:col-span-2">
        <AlbumCover fetchAlbumData={fetchAlbumCover} albumData={albumData} />
      </div>
      <div className="md:col-span-3">
        <MediaCollection collectionId={lastPathSegment} props={albumData} />
      </div>
    </div>
  );
};

export default MediaView;
