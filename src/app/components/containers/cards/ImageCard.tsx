import React, { ReactNode } from "react";

export interface ImageCardActions {
  download?: boolean;
  view?: boolean;
  share?: boolean;
  extras?: ReactNode;
}
export interface ImageCardProps {
  title?: string;
  description?: string;
  image_url: string;
}

const ImageCard = () => {
  return <div>ImageCard</div>;
};

export default ImageCard;
