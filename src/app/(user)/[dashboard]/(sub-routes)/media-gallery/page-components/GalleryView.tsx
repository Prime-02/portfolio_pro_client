import { ImageCardProps } from "@/app/components/containers/cards/ImageCard";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useState } from "react";

const GalleryView = () => {
  const { accessToken, setLoading, loading, currentUser } = useGlobalState();
  const [galleries, setGalleries] = useState<ImageCardProps[]>([]);

  const fetchGallery = async () => {
    setLoading("fetching_user_gallery");
    try {
        const galleryRes = GetAllData({
            access: accessToken,
            url: 
        })
    } catch (error) {
      console.log("Error laoding gallery: ", error);
    } finally {
      setLoading("fetching_user_gallery");
    }
  };

  return <div>GalleryView</div>;
};

export default GalleryView;
