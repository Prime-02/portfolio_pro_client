import ImageCard from "@/app/components/containers/cards/ImageCard";
import TextFormatter from "@/app/components/containers/TextFormatters/TextFormatter";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { AllProjectsDisplayCardProps } from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import { filterPlatform } from "@/app/components/utilities/indices/projects-JSONs/projectCreate";
import {
  getColorShade,
  getImageSrc,
  replaceCharacters,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import Image from "next/image";
import React from "react";

const AllProjectsCard = (prop: AllProjectsDisplayCardProps) => {
  const { checkParams } = useGlobalState();
  const { theme, isDarkMode } = useTheme();
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "text-green-600";
      case "in-progress":
        return "text-yellow-600";
      case "on-hold":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const view = checkParams("view") || "grid"; // Default to grid if no view param
  const isListView = view === "list";
  const platformLogoData = filterPlatform(prop.project_platform);
  const getLogoSrc = () => {
    if (!platformLogoData) return "";

    if (typeof platformLogoData.logoSrc === "function") {
      return platformLogoData.logoSrc(isDarkMode); // Pass theme state
    }

    return platformLogoData.logoSrc;
  };

  return (
    <div
      className={`
        flex shadow-md hover:shadow-2xl transition-shadow duration-300 rounded-lg border border-[var(--accent)]/20
        ${isListView ? "flex-row gap-x-4 items-center" : "flex-col gap-y-4"}
      `}
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Image Section */}
      <div className={`relative ${isListView ? "flex-shrink-0 p-2" : ""}`}>
        <ImageCard
          aspectRatio="1/1"
          borderRadius="lg"
          shadow="sm"
          borderColor="none"
          image_url={prop.project_image_url}
          id={prop.id}
        />

        {/* Status Badges */}
        <div className="absolute top-2 left-2 p-4 flex gap-2">
          {prop.is_completed && (
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              Completed
            </span>
          )}
          {prop.is_concept && (
            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
              Concept
            </span>
          )}
          {!prop.is_public && (
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
              Private
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div
        className={`flex flex-col p-4 gap-y-3 ${isListView ? "flex-1" : ""}`}
      >
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1
              className={`font-semibold capitalize line-clamp-2 ${isListView ? "text-lg" : "text-xl"}`}
            >
              {replaceCharacters(["-", "_"], [" ", " "], prop.project_name)}
            </h1>
            <span
              className={`text-sm font-medium ${getStatusColor(prop.status)}`}
            >
              {prop.status}
            </span>
          </div>

          {/* Platform and Category */}
          <div className="flex items-center gap-2 text-sm opacity-75 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: getColorShade(theme.background, 10),
              }}
            >
              <Image
                src={getImageSrc(getLogoSrc(), prop.project_platform)}
                alt={platformLogoData?.logoAlt || ""}
                className="w-3 h-3 object-contain"
                onError={(e) => {
                  // Fallback to a generic icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  target.nextElementSibling?.classList.remove("hidden");
                }}
                width={32}
                height={32}
              />
              <div
                className="w-3 h-3 rounded  items-center justify-center text-xs font-bold hidden"
                style={{
                  backgroundColor: theme.foreground,
                  color: theme.background,
                }}
              >
                {prop.project_platform.charAt(0).toUpperCase()}
              </div>
            </div>

            <span className="text-sm">{prop.project_category}</span>
          </div>
        </div>

        {/* Description */}
        <div
          className={`opacity-90 ${isListView ? "text-xs line-clamp-2" : "text-sm"}`}
        >
          <TextFormatter>{prop.project_description}</TextFormatter>
        </div>

        {/* Tech Stack and Tags - Compact for list view */}
        <div className={`flex flex-col gap-2 ${isListView ? "gap-1" : ""}`}>
          {/* Tech Stack */}
          {prop.stack && prop.stack.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prop.stack.slice(0, isListView ? 3 : 4).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded border"
                  style={{
                    borderColor: "var(--accent)",
                    color: "var(--accent)",
                  }}
                >
                  {tech}
                </span>
              ))}
              {prop.stack.length > (isListView ? 3 : 4) && (
                <span
                  className="px-2 py-1 text-xs rounded border opacity-60"
                  style={{
                    borderColor: "var(--accent)",
                    color: "var(--accent)",
                  }}
                >
                  +{prop.stack.length - (isListView ? 3 : 4)} more
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {prop.tags && prop.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {prop.tags.slice(0, isListView ? 2 : 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full opacity-75"
                  style={{
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                    border: "1px solid var(--accent)",
                  }}
                >
                  #{tag}
                </span>
              ))}
              {prop.tags.length > (isListView ? 2 : 3) && (
                <span
                  className="px-2 py-1 text-xs rounded-full opacity-60"
                  style={{
                    backgroundColor: "var(--background)",
                    color: "var(--foreground)",
                    border: "1px solid var(--accent)",
                  }}
                >
                  +{prop.tags.length - (isListView ? 2 : 3)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Project Details - Simplified for list view */}
        {!isListView && (
          <div className="text-xs opacity-75 space-y-1">
            {/* Date Range */}
            <div className="flex items-center justify-between">
              <span>Duration:</span>
              <span>
                {formatDate(prop.start_date)} -{" "}
                {prop.end_date ? formatDate(prop.end_date) : "Ongoing"}
              </span>
            </div>

            {/* Client */}
            {prop.client_name && (
              <div className="flex items-center justify-between">
                <span>Client:</span>
                <span className="font-medium">{prop.client_name}</span>
              </div>
            )}

            {/* Budget */}
            {prop.budget && (
              <div className="flex items-center justify-between">
                <span>Budget:</span>
                <span className="font-medium">
                  ${prop.budget.toLocaleString()}
                </span>
              </div>
            )}

            {/* Featured In */}
            {prop.featured_in && prop.featured_in.length > 0 && (
              <div className="flex items-center justify-between">
                <span>Featured:</span>
                <span>{prop.featured_in.slice(0, 2).join(", ")}</span>
              </div>
            )}
          </div>
        )}

        {/* List view condensed details */}
        {isListView && (
          <div className="flex items-center justify-between text-xs opacity-75">
            <span>
              {formatDate(prop.start_date)} -{" "}
              {prop.end_date ? formatDate(prop.end_date) : "Ongoing"}
            </span>
            {prop.client_name && (
              <span className="font-medium">{prop.client_name}</span>
            )}
          </div>
        )}

        {/* Footer - Last Updated */}
        <div
          className={`text-xs opacity-50 border-t pt-2 ${isListView ? "mt-1" : ""}`}
          style={{ borderColor: "var(--accent)" }}
        >
          Last updated: {formatDate(prop.last_updated)}
        </div>
      </div>
    </div>
  );
};

export default AllProjectsCard;
