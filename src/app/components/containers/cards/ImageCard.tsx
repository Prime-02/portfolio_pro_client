import React, { ReactNode } from "react";

export interface ImageCardProps {
  title?: string;
  description?: string;
  image_url: string;
  actions?: ReactNode
}

const ImageCard = () => {
  return <div>ImageCard</div>;
};

export default ImageCard;
