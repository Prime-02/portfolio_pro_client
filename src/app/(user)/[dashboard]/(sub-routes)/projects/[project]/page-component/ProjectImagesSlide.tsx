import ImageCard from "@/app/components/containers/cards/ImageCard";
import {
  OtherProjectsImageUrlsProps,
  ImageUrlsProps,
} from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import React, { useState, useEffect } from "react";

const ProjectImagesSlide = (props: OtherProjectsImageUrlsProps) => {
  // Extract all image properties (filter out non-ImageUrlsProps properties)
  const images = Object.entries(props)
    .filter(([key, value]) => {
      // Check if the value is an ImageUrlsProps object
      console.log(key)
      return (
        value &&
        typeof value === "object" &&
        ("url" in value || "public_id" in value)
      );
    })
    .map(([key, value]) => ({
      key,
      data: value as ImageUrlsProps,
    }));

  // Fallback to default image if no images provided
  const displayImages =
    images.length > 0
      ? images
      : [
          {
            key: "default",
            data: { url: "/vectors/undraw_drag-and-drop_v4po.svg" },
          },
        ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (displayImages.length <= 1) return; // Don't auto-advance if only one image

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, 5 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBreadcrumbClick = (index: number) => {
    setCurrentIndex(index);
  };

  // Get the image URL, prioritizing 'url' over 'public_id'
  const getImageUrl = (image: ImageUrlsProps): string => {
    return (
      image.url || image.public_id || "/vectors/undraw_drag-and-drop_v4po.svg"
    );
  };

  return (
    <div className="relative w-full h-[70dvh]">
      {/* Image Container */}
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        {displayImages.map((image, index) => (
          <div
            key={image.key}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <ImageCard
              image_url={getImageUrl(image.data)}
              id={image.key.replace(/_/g, " ")}
              width={100000}
              height={100000}
            />
          </div>
        ))}
      </div>

      {/* Breadcrumbs - Only show if more than one image */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-4 left-4 flex gap-2">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleBreadcrumbClick(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-[var(--accent)] w-8"
                  : "bg-[var(--accent)]/50 hover:bg-[var(--accent)]/75"
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image Counter - Only show if more than one image */}
      {displayImages.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {displayImages.length}
        </div>
      )}
    </div>
  );
};

export default ProjectImagesSlide;
