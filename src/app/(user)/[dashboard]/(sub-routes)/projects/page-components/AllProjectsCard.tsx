import ImageCard from "@/app/components/containers/cards/ImageCard";
import TextFormatter from "@/app/components/containers/TextFormatters/TextFormatter";
import CheckBox from "@/app/components/inputs/CheckBox";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import {
  AllProjectsDisplayCardProps,
  ProjectStatusProps,
} from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import { filterPlatform } from "@/app/components/utilities/indices/projects-JSONs/projectCreate";
import {
  getImageSrc,
  replaceCharacters,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { useProjectsStore } from "@/app/stores/project_stores/ProjectsStore";
import Image from "next/image";
import React from "react";

const AllProjectsCard = (prop: AllProjectsDisplayCardProps) => {
  const { checkParams, viewportWidth, extendRoute, userData } =
    useGlobalState();
  const { theme, isDarkMode } = useTheme();
  const { toggleProjectName, projectsNames } = useProjectsStore();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const getStatusColor = (status: ProjectStatusProps) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-50 border-green-200";
      case "inactive":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusDotColor = (status: ProjectStatusProps) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Force grid view on small screens (< 640px), otherwise use URL parameter
  const urlView = checkParams("view") || "grid";
  const view = viewportWidth < 640 ? "grid" : urlView;
  const isListView = view === "list";
  const isSelected = projectsNames.includes(prop.id);

  const platformLogoData = filterPlatform(prop.project_platform);
  const getLogoSrc = () => {
    if (!platformLogoData) return "";

    if (typeof platformLogoData.logoSrc === "function") {
      return platformLogoData.logoSrc(isDarkMode);
    }

    return platformLogoData.logoSrc;
  };

  return (
    <div
      onClick={() => {
        extendRoute(prop.id);
      }}
      className={`
        group relative cursor-pointer
        border transition-all duration-300 ease-in-out rounded-xl
        ${
          isSelected
            ? "border-[var(--accent)] shadow-lg scale-[1.02] ring-2 ring-[var(--accent)]/20"
            : "border-[var(--accent)]/20 hover:border-[var(--accent)]/40"
        }
        "hover:shadow-xl hover:transform hover:scale-[1.01] shadow-md
        flex overflow-hidden
        ${isListView ? "flex-row gap-0 items-center min-h-[140px]" : "flex-col gap-0 min-h-[320px]"}
      `}
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
      }}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div
          className="absolute top-0 left-0 w-full h-1 z-10"
          style={{ backgroundColor: "var(--accent)" }}
        />
      )}

      {/* Image Section */}
      <div
        className={`relative overflow-hidden ${isListView ? "w- h-full flex-shrink-0" : "w-full h-48"}`}
      >
        <ImageCard
          borderRadius={isListView ? "none" : "xl"}
          shadow="none"
          borderColor="transparent"
          image_url={prop.project_image_url}
          id={prop.id}
          aspectRatio="1/1"
        />

        {/* Overlay on hover */}
        <div
          className={`
          absolute inset-0 bg-black/20 transition-opacity duration-300
          hover:opacity-100 opacity-0
        `}
        />

        {/* Status Badges - Improved positioning and styling */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2 max-w-[calc(100%-24px)]">
          {prop.is_completed && (
            <span className="px-1 py-0.5 text-[10px] font-medium rounded-full bg-green-500/90 text-white backdrop-blur-sm">
              ✓ Completed
            </span>
          )}
          {prop.is_concept && (
            <span className="px-1 py-0.5 text-[10px] font-medium rounded-full bg-purple-500/90 text-white backdrop-blur-sm">
              💡 Concept
            </span>
          )}
          {!prop.is_public && (
            <span className="px-1 py-0.5 text-[10px] font-medium rounded-full bg-gray-500/90 text-white backdrop-blur-sm">
              🔒 Private
            </span>
          )}
        </div>

        {/* Platform indicator */}
        <div className="absolute bottom-3 right-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm border"
            style={{
              backgroundColor: `${theme.background}ee`,
              borderColor: "var(--accent)",
            }}
          >
            <Image
              src={getImageSrc(getLogoSrc(), prop.project_platform)}
              alt={platformLogoData?.logoAlt || ""}
              className="w-4 h-4 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.nextElementSibling?.classList.remove("hidden");
              }}
              width={16}
              height={16}
            />
            <div
              className="w-4 h-4 rounded flex items-center justify-center text-xs font-bold hidden"
              style={{
                backgroundColor: "var(--foreground)",
                color: "var(--background)",
              }}
            >
              {prop.project_platform.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div
        className={`flex flex-col p-6 gap-4 ${isListView ? "flex-1 justify-between" : ""}`}
      >
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h1
              className={`font-bold capitalize leading-tight transition-colors duration-200 hover:text-[var(--accent)]
              } ${isListView ? "text-lg line-clamp-2" : "text-xl line-clamp-2"}`}
            >
              {replaceCharacters(["-", "_"], [" ", " "], prop.project_name)}
            </h1>

            {/* Status with dot indicator */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`w-2 h-2 rounded-full ${getStatusDotColor(prop.status)}`}
              />
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(prop.status)}`}
              >
                {prop.status}
              </span>
            </div>
          </div>

          {/* Category - Simplified */}
          <div className="flex items-center gap-2 text-sm opacity-75">
            <span>{prop.project_category}</span>
            {prop.client_name && (
              <>
                <span>•</span>
                <span>{prop.client_name}</span>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div
          className={`opacity-90 leading-relaxed ${isListView ? "text-sm line-clamp-2" : "text-sm line-clamp-3"}`}
        >
          <TextFormatter>{prop.project_description}</TextFormatter>
        </div>

        {/* Tech Stack - Simplified */}
        {prop.stack && prop.stack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prop.stack.slice(0, isListView ? 2 : 3).map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full border"
                style={{
                  borderColor: "var(--accent)",
                  color: "var(--accent)",
                  backgroundColor: `${theme.foreground}05`,
                }}
              >
                {tech}
              </span>
            ))}
            {prop.stack.length > (isListView ? 2 : 3) && (
              <span
                className="px-2 py-1 text-xs rounded-full border opacity-60"
                style={{
                  borderColor: "var(--accent)",
                  color: "var(--accent)",
                  backgroundColor: `${theme.foreground}05`,
                }}
              >
                +{prop.stack.length - (isListView ? 2 : 3)}
              </span>
            )}
          </div>
        )}

        {/* Simple date for non-list view */}
        {!isListView && (
          <div className="text-xs opacity-60">
            {formatDate(prop.start_date)} -{" "}
            {prop.end_date ? formatDate(prop.end_date) : "Ongoing"}
          </div>
        )}

        {/* Footer - Simplified */}
        <div className="text-xs opacity-50 flex items-center justify-between">
          <span>{formatDate(prop.last_updated)}</span>
          <div
            className={`transition-transform duration-200 hover:translate-x-1 flex`}
            style={{ position: "relative" }}
          >
            {prop.user_associations.slice(0, 6).map((collab, i) => (
              <Image
                width={100}
                height={100}
                src={getImageSrc(
                  collab.user?.profile_picture,
                  collab.user?.username
                )}
                key={i}
                className="w-10 h-10 rounded-full object-cover relative border"
                style={{
                  zIndex: prop.user_associations.length - i, // Higher z-index for earlier avatars
                  marginLeft: i > 0 ? "-20px" : "0", // Overlap avatars (adjust as needed)
                }}
                alt={`Avatar ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      <span className="absolute top-2 right-0 ">
        <CheckBox
          isChecked={projectsNames.includes(prop.id)}
          setIsChecked={() => {
            toggleProjectName(prop.id);
          }}
        />
      </span>
    </div>
  );
};

export default AllProjectsCard;
