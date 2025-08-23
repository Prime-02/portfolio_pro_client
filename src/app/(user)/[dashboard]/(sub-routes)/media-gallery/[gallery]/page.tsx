import React from "react";
import AlbumView from "./page-components/AlbumView";

const MediaGallery = () => {
  return (
    <div className="h-auto min-w-sm w-auto p-2 overflow-auto">
      <AlbumView />
    </div>
  );
};

export default MediaGallery;
